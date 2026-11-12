"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { apiGet, apiPost, apiPatch } from "@/lib/api";
import { centsToDollarInput, dollarsToCents, formatMoney } from "@/lib/money";
import { localDate } from "@/lib/dates";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/skeletons";
import type { User, Unit } from "@/lib/types";

// Mirrors the API's rules so admins can't pick a unit it would refuse.
function unavailableReason(unit: Unit, currentUnitId?: string | null): string | null {
  if (unit.id === currentUnitId) return null;
  if (unit.status === "MAINTENANCE") return "Under maintenance";
  if ((unit._count?.tenants ?? 0) > 0) return "Occupied";
  return null;
}

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<User[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  // Assign unit dialog state
  const [assigningTenant, setAssigningTenant] = useState<User | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("none");
  const [assigning, setAssigning] = useState(false);

  // New tenant dialog state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [creatingTenant, setCreatingTenant] = useState(false);
  const [newTenantForm, setNewTenantForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    unitId: "none",
  });

  // Create payment dialog state
  const [paymentTenant, setPaymentTenant] = useState<User | null>(null);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    type: "RENT",
    dueDate: "",
  });

  async function loadData() {
    try {
      const [tenantsData, unitsData] = await Promise.all([
        apiGet<User[]>("/users"),
        apiGet<Unit[]>("/units"),
      ]);
      setTenants(tenantsData);
      setUnits(unitsData);
    } catch {
      toast.error("Failed to load tenants and units");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openAssignDialog(tenant: User) {
    setAssigningTenant(tenant);
    setSelectedUnitId(tenant.unitId || "none");
  }

  async function handleAssignUnit() {
    if (!assigningTenant) return;
    setAssigning(true);
    try {
      const unitIdToAssign = selectedUnitId === "none" ? null : selectedUnitId;
      // The API updates both units' status as part of the move.
      await apiPatch(`/users/${assigningTenant.id}/assign`, {
        unitId: unitIdToAssign,
      });

      toast.success("Unit assignment updated successfully");
      setAssigningTenant(null);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to assign unit");
    } finally {
      setAssigning(false);
    }
  }

  async function handleCreateTenant(e: React.FormEvent) {
    e.preventDefault();
    if (!newTenantForm.name.trim() || !newTenantForm.email.trim() || !newTenantForm.password) {
      toast.error("Please fill in Name, Email, and Password");
      return;
    }

    setCreatingTenant(true);
    try {
      // One request: the account and its unit assignment succeed or fail together.
      await apiPost<User>("/users", {
        name: newTenantForm.name.trim(),
        email: newTenantForm.email.trim(),
        password: newTenantForm.password,
        phone: newTenantForm.phone.trim() || undefined,
        unitId: newTenantForm.unitId === "none" ? undefined : newTenantForm.unitId,
      });

      toast.success("Tenant account created successfully");
      setIsAddOpen(false);
      setNewTenantForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        unitId: "none",
      });
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create tenant");
    } finally {
      setCreatingTenant(false);
    }
  }

  async function handleCreatePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentTenant || !paymentTenant.unitId || !paymentForm.amount) {
      toast.error("Amount and assigned unit are required");
      return;
    }
    const amountCents = dollarsToCents(paymentForm.amount);
    if (!amountCents) {
      toast.error("Enter an amount like 1500 or 1500.50");
      return;
    }

    setCreatingPayment(true);
    try {
      await apiPost("/payments", {
        tenantId: paymentTenant.id,
        unitId: paymentTenant.unitId,
        amountCents,
        type: paymentForm.type,
        dueDate: paymentForm.dueDate,
      });

      toast.success("Rent payment request created");
      setPaymentTenant(null);
      setPaymentForm({
        amount: "",
        type: "RENT",
        dueDate: "",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create payment invoice");
    } finally {
      setCreatingPayment(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tenants</h1>
          <p className="mt-1 text-muted-foreground">Accounts, unit assignments and invoices.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <UserPlus data-icon="inline-start" /> Add tenant
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={3} columns={5} />
          ) : tenants.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-lg font-medium mb-1">No tenants registered yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first tenant to start managing leases and assignments.
              </p>
              <Button onClick={() => setIsAddOpen(true)}>
                <UserPlus data-icon="inline-start" /> Add tenant
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-semibold">
                      {tenant.name}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{tenant.email}</p>
                      <p className="text-xs text-muted-foreground">{tenant.phone || "No phone"}</p>
                    </TableCell>
                    <TableCell>
                      {tenant.unit ? (
                        <div>
                          <p className="font-medium">{tenant.unit.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {tenant.unit.address}
                          </p>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Unassigned
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAssignDialog(tenant)}
                        >
                          {tenant.unitId ? "Transfer" : "Assign unit"}
                        </Button>
                        {tenant.unitId && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setPaymentTenant(tenant);
                              setPaymentForm({
                                amount: (() => {
                                  const rent = units.find((u) => u.id === tenant.unitId)?.priceCents;
                                  return rent ? centsToDollarInput(rent) : "";
                                })(),
                                type: "RENT",
                                dueDate: localDate(),
                              });
                            }}
                          >
                            Invoice
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assign Unit Dialog */}
      <Dialog open={!!assigningTenant} onOpenChange={(open) => !open && setAssigningTenant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign or Transfer Unit</DialogTitle>
            <DialogDescription>
              Select a property unit to assign to {assigningTenant?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Select Unit</Label>
              <Select value={selectedUnitId} onValueChange={(val) => setSelectedUnitId(val || "none")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a unit">
                    {(val: any) => {
                      if (!val || val === "none") return "No Unit (Unassign)";
                      const u = units.find((unit) => unit.id === val);
                      return u ? `${u.name} — ${formatMoney(u.priceCents)}/mo (${u.status})` : "Select a unit";
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Unit (Unassign)</SelectItem>
                  {units.map((unit) => {
                    const blocked = unavailableReason(unit, assigningTenant?.unitId);
                    return (
                      <SelectItem key={unit.id} value={unit.id} disabled={!!blocked}>
                        {unit.name} — {formatMoney(unit.priceCents)}/mo ({blocked ?? unit.status})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssigningTenant(null)} loading={assigning}>
              Cancel
            </Button>
            <Button onClick={handleAssignUnit} loading={assigning}>
              {assigning ? "Assigning..." : "Save Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Tenant Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Tenant</DialogTitle>
            <DialogDescription>
              Create credentials and assign a unit for a new tenant
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTenant} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="tenant-name">Full Name *</Label>
              <Input
                id="tenant-name"
                placeholder="Sarah Connor"
                value={newTenantForm.name}
                onChange={(e) => setNewTenantForm({ ...newTenantForm, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenant-email">Email *</Label>
              <Input
                id="tenant-email"
                type="email"
                placeholder="sarah@example.com"
                value={newTenantForm.email}
                onChange={(e) => setNewTenantForm({ ...newTenantForm, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenant-password">Temporary Password *</Label>
              <Input
                id="tenant-password"
                type="password"
                placeholder="••••••••"
                value={newTenantForm.password}
                onChange={(e) => setNewTenantForm({ ...newTenantForm, password: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenant-phone">Phone Number</Label>
              <Input
                id="tenant-phone"
                type="tel"
                placeholder="+1 (555) 234-5678"
                value={newTenantForm.phone}
                onChange={(e) => setNewTenantForm({ ...newTenantForm, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Assign Unit (Optional)</Label>
              <Select
                value={newTenantForm.unitId}
                onValueChange={(val) => setNewTenantForm({ ...newTenantForm, unitId: val || "none" })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select unit to assign">
                    {(val: any) => {
                      if (!val || val === "none") return "Assign Later";
                      const u = units.find((unit) => unit.id === val);
                      return u ? `${u.name} (${formatMoney(u.priceCents)}/mo - ${u.status})` : "Assign Later";
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Assign Later</SelectItem>
                  {units.map((unit) => {
                    const blocked = unavailableReason(unit, null);
                    return (
                      <SelectItem key={unit.id} value={unit.id} disabled={!!blocked}>
                        {unit.name} ({formatMoney(unit.priceCents)}/mo - {blocked ?? unit.status})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} loading={creatingTenant}>
                Cancel
              </Button>
              <Button type="submit" loading={creatingTenant}>
                {creatingTenant ? "Creating" : "Create tenant"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Payment Invoice Dialog */}
      <Dialog open={!!paymentTenant} onOpenChange={(open) => !open && setPaymentTenant(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Issue Payment Invoice</DialogTitle>
            <DialogDescription>
              Create a rent or utility bill for {paymentTenant?.name} ({paymentTenant?.unit?.name})
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePayment} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Amount ($) *</Label>
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="1500"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-type">Payment Type</Label>
              <Select
                value={paymentForm.type}
                onValueChange={(val) => setPaymentForm({ ...paymentForm, type: val || "RENT" })}
              >
                <SelectTrigger id="payment-type" className="w-full">
                  <SelectValue placeholder="Select type">
                    {(val: any) => {
                      const labels: Record<string, string> = {
                        RENT: "Rent",
                        DEPOSIT: "Security Deposit",
                        UTILITY: "Utilities",
                      };
                      return labels[val] || val;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RENT">Rent</SelectItem>
                  <SelectItem value="DEPOSIT">Security Deposit</SelectItem>
                  <SelectItem value="UTILITY">Utilities</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-date">Due Date *</Label>
              <Input
                id="payment-date"
                type="date"
                value={paymentForm.dueDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, dueDate: e.target.value })}
                required
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setPaymentTenant(null)} loading={creatingPayment}>
                Cancel
              </Button>
              <Button type="submit" loading={creatingPayment}>
                {creatingPayment ? "Issuing" : "Issue invoice"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

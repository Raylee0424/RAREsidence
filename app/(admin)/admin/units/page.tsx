"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Building2,
} from "lucide-react";
import { apiGet, apiDelete, getImageUrl } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { toast } from "sonner";
import type { Unit } from "@/lib/types";

export default function AdminUnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchUnits() {
    try {
      const data = await apiGet<Unit[]>("/units");
      setUnits(data);
    } catch {
      toast.error("Failed to load units");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUnits();
  }, []);

  async function handleDeleteConfirm() {
    if (!unitToDelete) return;
    setDeleting(true);
    try {
      await apiDelete(`/units/${unitToDelete.id}`);
      toast.success("Unit deleted successfully");
      setUnitToDelete(null);
      fetchUnits();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete unit");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Unit Management</h1>
          <p className="text-muted-foreground">
            Manage your rental inventory, pricing, and availability
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/units/new">
            <Plus className="mr-2 h-4 w-4" /> Add New Unit
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading units...
            </div>
          ) : units.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-lg font-medium mb-1">No units created yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by creating your first residential unit listing.
              </p>
              <Button asChild>
                <Link href="/admin/units/new">
                  <Plus className="mr-2 h-4 w-4" /> Add Unit
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Photo</TableHead>
                  <TableHead>Unit Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Specs</TableHead>
                  <TableHead>Price/mo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit) => {
                  const primaryPhoto =
                    unit.photos && unit.photos.length > 0
                      ? unit.photos.find((p) => p.isPrimary) || unit.photos[0]
                      : null;

                  return (
                    <TableRow key={unit.id}>
                      <TableCell>
                        <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                          <img
                            src={getImageUrl(primaryPhoto ? primaryPhoto.path : null)}
                            alt={unit.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold">{unit.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {unit.photos?.length || 0} photos
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground text-sm">
                        {unit.address}
                      </TableCell>
                      <TableCell className="text-sm">
                        {unit.bedrooms} bd • {unit.bathrooms} ba • {unit.area || "—"} sqft
                      </TableCell>
                      <TableCell className="font-bold">
                        {formatMoney(unit.priceCents)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            unit.status === "AVAILABLE"
                              ? "default"
                              : unit.status === "OCCUPIED"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {unit.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button asChild size="icon" variant="ghost">
                            <Link href={`/units/${unit.id}`} target="_blank" title="View Public Page">
                              <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            </Link>
                          </Button>
                          <Button asChild size="icon" variant="ghost">
                            <Link href={`/admin/units/${unit.id}/edit`} title="Edit Unit">
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setUnitToDelete(unit)}
                            title="Delete Unit"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!unitToDelete} onOpenChange={(open) => !open && setUnitToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Unit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{unitToDelete?.name}&quot;? This permanently removes its photos and viewing requests. Units with assigned tenants or payment records can&apos;t be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnitToDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete Unit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


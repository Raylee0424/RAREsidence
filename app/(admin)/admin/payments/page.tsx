"use client";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Check, X } from "lucide-react";
import { apiGet, apiPatch } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { calendarDateKey, formatCalendarDate, localDate } from "@/lib/dates";
import { toast } from "sonner";
import type { Payment } from "@/lib/types";

const filterLabels: Record<string, string> = {
  ALL: "All Payments",
  SUBMITTED: "Awaiting Confirmation",
  PENDING: "Pending",
  OVERDUE: "Overdue",
  PAID: "Paid",
};

function statusBadgeVariant(status: Payment["status"]): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "PAID":
      return "default";
    case "OVERDUE":
      return "destructive";
    case "SUBMITTED":
      return "outline";
    default:
      return "secondary";
  }
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function fetchPayments() {
    try {
      const data = await apiGet<Payment[]>("/payments");
      setPayments(data);
    } catch {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPayments();
  }, []);

  async function handleStatusUpdate(payment: Payment, status: "PAID" | "PENDING" | "OVERDUE") {
    setProcessingId(payment.id);
    try {
      await apiPatch(`/payments/${payment.id}`, { status });
      toast.success(status === "PAID" ? "Payment confirmed" : "Payment report rejected");
      fetchPayments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update payment");
    } finally {
      setProcessingId(null);
    }
  }

  // A rejected report goes back to whatever it was before the tenant reported it.
  function statusBeforeReport(payment: Payment): "PENDING" | "OVERDUE" {
    return calendarDateKey(payment.dueDate) < localDate() ? "OVERDUE" : "PENDING";
  }

  const filteredPayments =
    filterStatus === "ALL"
      ? payments
      : payments.filter((p) => p.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">
            Confirm payments tenants have reported and record payments received
          </p>
        </div>
        <div className="w-56">
          <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val || "ALL")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by status">
                {(val: string) => filterLabels[val] || val}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(filterLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading payments...
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-lg font-medium mb-1">No payments found</p>
              <p className="text-sm text-muted-foreground">
                {filterStatus === "ALL"
                  ? "No payment invoices have been issued yet."
                  : `No payments with status "${filterLabels[filterStatus]}".`}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <p className="font-medium">{payment.tenant?.name || "Tenant"}</p>
                      <p className="text-xs text-muted-foreground">{payment.tenant?.email}</p>
                    </TableCell>
                    <TableCell className="font-medium">
                      {payment.unit?.name || "Unit"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.type}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatMoney(payment.amountCents)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatCalendarDate(payment.dueDate)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(payment.status)}>
                        {payment.status === "SUBMITTED" ? "AWAITING CONFIRMATION" : payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.status === "SUBMITTED" && (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            disabled={processingId === payment.id}
                            onClick={() => handleStatusUpdate(payment, "PAID")}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            disabled={processingId === payment.id}
                            onClick={() => handleStatusUpdate(payment, statusBeforeReport(payment))}
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {(payment.status === "PENDING" || payment.status === "OVERDUE") && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={processingId === payment.id}
                          onClick={() => handleStatusUpdate(payment, "PAID")}
                        >
                          Record Payment
                        </Button>
                      )}
                      {payment.status === "PAID" && payment.paidAt && (
                        <span className="text-xs text-muted-foreground">
                          Paid {new Date(payment.paidAt).toLocaleDateString()}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { apiGet, apiPatch } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { calendarDateKey, formatCalendarDate, localDate } from "@/lib/dates";
import { toast } from "sonner";
import { StatusBadge } from "@/components/status-badge";
import { TableSkeleton } from "@/components/skeletons";
import type { Payment } from "@/lib/types";

const filterLabels: Record<string, string> = {
  ALL: "All payments",
  SUBMITTED: "Awaiting confirmation",
  PENDING: "Pending",
  OVERDUE: "Overdue",
  PAID: "Paid",
};

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
          <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
          <p className="mt-1 text-muted-foreground">Confirm what tenants report, and record payments you receive.</p>
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
            <TableSkeleton rows={3} columns={6} />
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <p className="mb-1 font-medium">No payments</p>
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
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Due date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
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
                      {payment.type === "RENT" ? "Rent" : payment.type === "DEPOSIT" ? "Deposit" : "Utilities"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMoney(payment.amountCents)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatCalendarDate(payment.dueDate)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.status === "SUBMITTED" && (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={processingId === payment.id}
                            onClick={() => handleStatusUpdate(payment, statusBeforeReport(payment))}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            loading={processingId === payment.id}
                            onClick={() => handleStatusUpdate(payment, "PAID")}
                          >
                            Confirm
                          </Button>
                        </div>
                      )}
                      {(payment.status === "PENDING" || payment.status === "OVERDUE") && (
                        <Button
                          size="sm"
                          variant="outline"
                          loading={processingId === payment.id}
                          onClick={() => handleStatusUpdate(payment, "PAID")}
                        >
                          Record payment
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

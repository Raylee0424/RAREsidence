"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { formatCalendarDate } from "@/lib/dates";
import { toast } from "sonner";
import { StatusBadge } from "@/components/status-badge";
import type { Payment } from "@/lib/types";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    try {
      const data = await apiGet<Payment[]>("/payments/my-payments");
      setPayments(data);
    } catch {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }

  async function handleReportPaid(paymentId: string) {
    setReporting(paymentId);
    try {
      await apiPost(`/payments/${paymentId}/report`);
      toast.success("Payment reported. Your property manager will confirm it.");
      fetchPayments();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to report payment");
    } finally {
      setReporting(null);
    }
  }

  const totalPaid = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amountCents, 0);
  // Reported payments stay outstanding until an admin confirms them.
  const totalOutstanding = payments
    .filter((p) => p.status !== "PAID")
    .reduce((sum, p) => sum + p.amountCents, 0);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-24 bg-muted animate-pulse rounded" />
          <div className="h-24 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <p className="mt-1 text-muted-foreground">Tell us when you&apos;ve paid and we&apos;ll confirm it.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Paid so far</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{formatMoney(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Outstanding</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{formatMoney(totalOutstanding)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No bills yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Due</TableHead>
                  <TableHead>For</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Action</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatCalendarDate(payment.dueDate)}
                    </TableCell>
                    <TableCell>
                      {payment.type === "RENT" ? "Rent" : payment.type === "DEPOSIT" ? "Deposit" : "Utilities"}
                      {payment.unit?.name && <span className="text-muted-foreground"> · {payment.unit.name}</span>}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMoney(payment.amountCents)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {(payment.status === "PENDING" || payment.status === "OVERDUE") && (
                        <Button
                          size="sm"
                          variant="outline"
                          loading={reporting === payment.id}
                          onClick={() => handleReportPaid(payment.id)}
                        >
                          I&apos;ve paid this
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

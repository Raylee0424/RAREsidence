"use client";

import { Badge } from "@/components/ui/badge";
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
import { CreditCard, DollarSign, AlertCircle, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { formatCalendarDate } from "@/lib/dates";
import { toast } from "sonner";
import type { Payment } from "@/lib/types";

function statusBadgeVariant(status: Payment["status"]): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "PAID":
      return "default";
    case "PENDING":
      return "secondary";
    case "OVERDUE":
      return "destructive";
    case "SUBMITTED":
      return "outline";
    default:
      return "secondary";
  }
}

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
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-muted-foreground">View and manage your payment history</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Paid
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatMoney(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding
            </CardTitle>
            {totalOutstanding > 0 ? (
              <AlertCircle className="h-4 w-4 text-destructive" />
            ) : (
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totalOutstanding > 0 ? "text-destructive" : ""}`}>
              {formatMoney(totalOutstanding)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No payment records found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatCalendarDate(payment.dueDate)}
                    </TableCell>
                    <TableCell>{payment.unit?.name ? `${payment.type} - ${payment.unit.name}` : payment.type}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.type}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatMoney(payment.amountCents)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {(payment.status === "PENDING" || payment.status === "OVERDUE") && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={reporting === payment.id}
                          onClick={() => handleReportPaid(payment.id)}
                        >
                          {reporting === payment.id ? "Sending..." : "I've Paid This"}
                        </Button>
                      )}
                      {payment.status === "SUBMITTED" && (
                        <span className="text-xs text-muted-foreground">
                          Awaiting confirmation
                        </span>
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

"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { apiGet } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { Home, CreditCard, Building2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { Unit, Payment } from "@/lib/types";

export default function TenantDashboard() {
  const { user } = useAuth();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [unitData, paymentData] = await Promise.allSettled([
          apiGet<Unit>("/units/my-unit"),
          apiGet<Payment[]>("/payments/my-payments"),
        ]);
        if (unitData.status === "fulfilled") setUnit(unitData.value);
        if (paymentData.status === "fulfilled") setPayments(paymentData.value);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const pendingPayments = payments.filter((p) => p.status === "PENDING" || p.status === "OVERDUE");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">Here&apos;s a summary of your account</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  My Unit
                </CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {unit ? (
                  <div>
                    <p className="text-lg font-bold">{unit.name}</p>
                    <p className="text-sm text-muted-foreground">{unit.address}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No unit assigned</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Monthly Rent
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {unit ? `${formatMoney(unit.priceCents)}` : "—"}
                </p>
                <p className="text-sm text-muted-foreground">per month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Payments
                </CardTitle>
                {pendingPayments.length > 0 ? (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                ) : (
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{pendingPayments.length}</p>
                <p className="text-sm text-muted-foreground">
                  {pendingPayments.length === 0 ? "All caught up!" : "payments due"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">View My Unit</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  See details, photos, and information about your assigned unit.
                </p>
                <Button asChild variant="outline">
                  <Link href="/tenant/unit">View Unit</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Payment History</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  View your payment history and make pending payments.
                </p>
                <Button asChild variant="outline">
                  <Link href="/tenant/payments">View Payments</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

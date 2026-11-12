"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/skeletons";
import { useAuth } from "@/context/auth-context";
import { apiGet } from "@/lib/api";
import { calendarDateKey, formatCalendarDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
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

  // Soonest unpaid bill first; that's the one thing a tenant needs to act on.
  const due = payments
    .filter((p) => p.status === "PENDING" || p.status === "OVERDUE")
    .sort((a, b) => calendarDateKey(a.dueDate).localeCompare(calendarDateKey(b.dueDate)));
  const next = due[0];
  const totalDue = due.reduce((sum, p) => sum + p.amountCents, 0);

  if (loading) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading">
        <Skeleton className="h-8 w-80" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">Hi {user?.name?.split(" ")[0]}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {next
            ? `${formatMoney(totalDue)} due${next.status === "OVERDUE" ? ", including overdue rent" : ` by ${formatCalendarDate(next.dueDate, { month: "long", day: "numeric" })}`}`
            : "Your payments are up to date"}
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="gap-0 p-6">
          <h2 className="text-sm text-muted-foreground">Next payment</h2>
          {next ? (
            <>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{formatMoney(next.amountCents)}</p>
              <p className="mt-1 text-sm text-muted-foreground tabular-nums">
                {next.type === "RENT" ? "Rent" : next.type === "DEPOSIT" ? "Deposit" : "Utilities"} · due{" "}
                {formatCalendarDate(next.dueDate, { month: "short", day: "numeric", year: "numeric" })}
              </p>
              <Button asChild size="lg" className="mt-6 self-start">
                <Link href="/tenant/payments">View and report payment</Link>
              </Button>
            </>
          ) : (
            <p className="mt-2 text-muted-foreground">Nothing to pay right now.</p>
          )}
        </Card>

        <Card className="gap-0 p-6">
          <h2 className="text-sm text-muted-foreground">Your home</h2>
          {unit ? (
            <>
              <p className="mt-2 text-xl font-semibold">{unit.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{unit.address}</p>
              <p className="mt-4 tabular-nums">
                {formatMoney(unit.priceCents)}
                <span className="text-sm text-muted-foreground">/mo</span>
              </p>
              <Button asChild variant="outline" size="lg" className="mt-6 self-start">
                <Link href="/tenant/unit">Home details</Link>
              </Button>
            </>
          ) : (
            <p className="mt-2 text-muted-foreground">
              No home assigned yet. Your property manager will set this up.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

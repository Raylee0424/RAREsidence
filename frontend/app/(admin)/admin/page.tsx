"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton, TableSkeleton } from "@/components/skeletons";
import { apiGet, apiPatch } from "@/lib/api";
import { formatCalendarDate } from "@/lib/dates";
import { toast } from "sonner";
import type { Unit, Booking, User } from "@/lib/types";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="gap-1 px-5 py-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-semibold tabular-nums">{value}</p>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tenants, setTenants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<{ id: string; status: "ACCEPTED" | "DECLINED" } | null>(null);

  async function loadData() {
    try {
      const [unitsData, bookingsData, tenantsData] = await Promise.all([
        apiGet<Unit[]>("/units"),
        apiGet<Booking[]>("/bookings"),
        apiGet<User[]>("/users"),
      ]);
      setUnits(unitsData);
      setBookings(bookingsData);
      setTenants(tenantsData);
    } catch {
      toast.error("Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleUpdateBookingStatus(bookingId: string, status: "ACCEPTED" | "DECLINED") {
    setProcessing({ id: bookingId, status });
    try {
      await apiPatch(`/bookings/${bookingId}`, { status });
      toast.success(status === "ACCEPTED" ? "Viewing accepted" : "Viewing declined");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update booking");
    } finally {
      setProcessing(null);
    }
  }

  const pending = bookings.filter((b) => b.status === "PENDING");
  const availableUnits = units.filter((u) => u.status === "AVAILABLE").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          {loading ? (
            <Skeleton className="h-8 w-72" />
          ) : (
            <h1 className="text-2xl font-semibold tracking-tight">
              {pending.length > 0
                ? `${pending.length} viewing ${pending.length === 1 ? "request needs" : "requests need"} a reply`
                : "No viewing requests waiting"}
            </h1>
          )}
          <p className="mt-1 text-muted-foreground">Your portfolio at a glance.</p>
        </div>
        <Button asChild>
          <Link href="/admin/units/new">
            <Plus data-icon="inline-start" /> Add unit
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? (
          [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[88px] rounded-xl" />)
        ) : (
          <>
            <Stat label="Units" value={units.length} />
            <Stat label="Available" value={availableUnits} />
            <Stat label="Viewing requests waiting" value={pending.length} />
            <Stat label="Tenants" value={tenants.length} />
          </>
        )}
      </div>

      <Card className="gap-0 py-0">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-semibold">Waiting for a reply</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/bookings">All requests</Link>
          </Button>
        </div>
        {loading ? (
          <TableSkeleton rows={3} columns={4} />
        ) : pending.length === 0 ? (
          <p className="border-t px-5 py-10 text-center text-muted-foreground">
            New viewing requests will appear here.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Guest</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Preferred date</TableHead>
                <TableHead className="pr-5 text-right">Reply</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.slice(0, 5).map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="pl-5">
                    <p className="font-medium">{booking.guestName}</p>
                    <p className="text-xs text-muted-foreground">
                      {booking.guestEmail} · {booking.guestPhone}
                    </p>
                  </TableCell>
                  <TableCell>{booking.unit?.name ?? "—"}</TableCell>
                  <TableCell>{formatCalendarDate(booking.preferredDate, { month: "short", day: "numeric", year: "numeric" })}</TableCell>
                  <TableCell className="pr-5 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={processing?.id === booking.id}
                        loading={processing?.id === booking.id && processing.status === "DECLINED"}
                        onClick={() => handleUpdateBookingStatus(booking.id, "DECLINED")}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        disabled={processing?.id === booking.id}
                        loading={processing?.id === booking.id && processing.status === "ACCEPTED"}
                        onClick={() => handleUpdateBookingStatus(booking.id, "ACCEPTED")}
                      >
                        Accept
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

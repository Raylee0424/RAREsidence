"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Building,
  CalendarCheck,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
} from "lucide-react";
import { apiGet, apiPatch } from "@/lib/api";
import { formatCalendarDate } from "@/lib/dates";
import { toast } from "sonner";
import type { Unit, Booking, User } from "@/lib/types";

export default function AdminDashboardPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tenants, setTenants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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
    try {
      await apiPatch(`/bookings/${bookingId}`, { status });
      toast.success(`Booking ${status.toLowerCase()} successfully`);
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update booking");
    }
  }

  const availableUnits = units.filter((u) => u.status === "AVAILABLE").length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of units, bookings, and tenancy operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/units/new">
              <Plus className="mr-2 h-4 w-4" /> Add Unit
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Units
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{units.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Properties in portfolio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Units
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{availableUnits}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Ready for new tenants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Bookings
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-500">{pendingBookings}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Require review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Tenants
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{tenants.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Registered tenants
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Bookings Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Recent Viewing Requests</CardTitle>
            <p className="text-sm text-muted-foreground">
              Guest appointments awaiting confirmation
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/bookings">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {bookings.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No booking requests received yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Preferred Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.slice(0, 5).map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.guestName}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.guestEmail} • {booking.guestPhone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {booking.unit?.name || "Unit"}
                    </TableCell>
                    <TableCell>
                      {formatCalendarDate(booking.preferredDate)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          booking.status === "ACCEPTED"
                            ? "default"
                            : booking.status === "DECLINED"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {booking.status === "PENDING" && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleUpdateBookingStatus(booking.id, "ACCEPTED")}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleUpdateBookingStatus(booking.id, "DECLINED")}
                          >
                            Decline
                          </Button>
                        </div>
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


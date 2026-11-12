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
import { Mail, Phone } from "lucide-react";
import { apiGet, apiPatch } from "@/lib/api";
import { formatCalendarDate } from "@/lib/dates";
import { toast } from "sonner";
import { StatusBadge } from "@/components/status-badge";
import { TableSkeleton } from "@/components/skeletons";
import type { Booking } from "@/lib/types";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function fetchBookings() {
    try {
      const data = await apiGet<Booking[]>("/bookings");
      setBookings(data);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  async function handleStatusUpdate(id: string, status: "ACCEPTED" | "DECLINED") {
    setProcessingId(id);
    try {
      await apiPatch(`/bookings/${id}`, { status });
      toast.success(`Booking ${status.toLowerCase()} successfully`);
      fetchBookings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update booking status");
    } finally {
      setProcessingId(null);
    }
  }

  const filteredBookings =
    filterStatus === "ALL"
      ? bookings
      : bookings.filter((b) => b.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Viewing requests</h1>
          <p className="mt-1 text-muted-foreground">Accept or decline requests from prospective tenants.</p>
        </div>
        <div className="w-48">
          <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val || "ALL")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by status">
                {(val: any) => {
                  const labels: Record<string, string> = {
                    ALL: "All requests",
                    PENDING: "Pending",
                    ACCEPTED: "Accepted",
                    DECLINED: "Declined",
                  };
                  return labels[val] || val;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All requests</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ACCEPTED">Accepted</SelectItem>
              <SelectItem value="DECLINED">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={4} columns={6} />
          ) : filteredBookings.length === 0 ? (
            <div className="p-12 text-center">
              <p className="mb-1 font-medium">No viewing requests</p>
              <p className="text-sm text-muted-foreground">
                {filterStatus === "ALL"
                  ? "No viewing requests have been submitted yet."
                  : `No bookings with status "${filterStatus}".`}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Preferred date</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-semibold">
                      {booking.guestName}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{booking.guestEmail}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{booking.guestPhone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{booking.unit?.name || "Unit"}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {booking.unit?.address}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <span>
                          {formatCalendarDate(booking.preferredDate, {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs text-sm text-muted-foreground">
                      {booking.message || "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {booking.status === "PENDING" ? (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={processingId === booking.id}
                            onClick={() => handleStatusUpdate(booking.id, "DECLINED")}
                          >
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            loading={processingId === booking.id}
                            onClick={() => handleStatusUpdate(booking.id, "ACCEPTED")}
                          >
                            Accept
                          </Button>
                        </div>
                      ) : null}
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

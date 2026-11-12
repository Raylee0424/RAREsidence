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
import { CalendarCheck, Mail, Phone, Calendar, Check, X } from "lucide-react";
import { apiGet, apiPatch } from "@/lib/api";
import { formatCalendarDate } from "@/lib/dates";
import { toast } from "sonner";
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
          <h1 className="text-3xl font-bold">Booking Requests</h1>
          <p className="text-muted-foreground">
            Review and manage prospective tenant viewing appointments
          </p>
        </div>
        <div className="w-48">
          <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val || "ALL")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by status">
                {(val: any) => {
                  const labels: Record<string, string> = {
                    ALL: "All Bookings",
                    PENDING: "Pending Only",
                    ACCEPTED: "Accepted",
                    DECLINED: "Declined",
                  };
                  return labels[val] || val;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Bookings</SelectItem>
              <SelectItem value="PENDING">Pending Only</SelectItem>
              <SelectItem value="ACCEPTED">Accepted</SelectItem>
              <SelectItem value="DECLINED">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading booking requests...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarCheck className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-lg font-medium mb-1">No bookings found</p>
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
                  <TableHead>Preferred Date</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
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
                      {booking.status === "PENDING" ? (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            disabled={processingId === booking.id}
                            onClick={() => handleStatusUpdate(booking.id, "ACCEPTED")}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            disabled={processingId === booking.id}
                            onClick={() => handleStatusUpdate(booking.id, "DECLINED")}
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Decline
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {booking.status === "ACCEPTED" ? "Confirmed" : "Declined"}
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

"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarPlus, ArrowLeft, CheckCircle2, Building2 } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { localDate } from "@/lib/dates";
import { toast } from "sonner";
import type { Unit } from "@/lib/types";
import Link from "next/link";

function BookingContent() {
  const params = useParams();
  const unitId = params.unitId as string;

  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    preferredDate: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    apiGet<Unit>(`/units/${unitId}`)
      .then(setUnit)
      .catch(() => setUnit(null))
      .finally(() => setLoading(false));
  }, [unitId]);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.guestName.trim()) newErrors.guestName = "Name is required";
    if (!form.guestEmail.trim()) newErrors.guestEmail = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.guestEmail)) newErrors.guestEmail = "Invalid email address";
    if (!form.guestPhone.trim()) newErrors.guestPhone = "Phone is required";
    if (!form.preferredDate) newErrors.preferredDate = "Preferred date is required";
    else if (form.preferredDate < localDate()) newErrors.preferredDate = "Please choose today or a later date";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await apiPost("/bookings", {
        unitId,
        ...form,
      });
      setSubmitted(true);
      toast.success("Booking request submitted successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit booking");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="h-8 bg-muted animate-pulse rounded mb-4 w-1/3" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-600 mb-6" />
        <h2 className="text-2xl font-bold mb-2">Booking Request Sent!</h2>
        <p className="text-muted-foreground mb-6">
          We&apos;ve received your viewing request{unit ? ` for ${unit.name}` : ""}. 
          Our team will get back to you shortly.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild variant="outline">
            <Link href="/units">Browse More Units</Link>
          </Button>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Never show the form for a unit that can't be booked; the API would refuse it.
  if (!unit || unit.status !== "AVAILABLE") {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <Building2 className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          {unit ? "Viewings Unavailable" : "Unit Not Found"}
        </h2>
        <p className="text-muted-foreground mb-6">
          {unit
            ? `${unit.name} isn't available for viewings right now.`
            : "This unit doesn't exist or is no longer listed."}
        </p>
        <Button asChild>
          <Link href="/units">Browse Available Units</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <Button asChild variant="ghost" className="mb-6">
        <Link href={unit ? `/units/${unit.id}` : "/units"}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5" />
            Book a Viewing
          </CardTitle>
          <CardDescription>
            {unit
              ? `Schedule a viewing for ${unit.name} — ${formatMoney(unit.priceCents)}/mo`
              : "Schedule a property viewing"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="guestName">Full Name *</Label>
              <Input
                id="guestName"
                maxLength={100}
                placeholder="John Doe"
                value={form.guestName}
                onChange={(e) => setForm({ ...form, guestName: e.target.value })}
              />
              {errors.guestName && (
                <p className="text-sm text-destructive">{errors.guestName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestEmail">Email *</Label>
              <Input
                id="guestEmail"
                maxLength={254}
                type="email"
                placeholder="john@example.com"
                value={form.guestEmail}
                onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
              />
              {errors.guestEmail && (
                <p className="text-sm text-destructive">{errors.guestEmail}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestPhone">Phone *</Label>
              <Input
                id="guestPhone"
                maxLength={30}
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={form.guestPhone}
                onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
              />
              {errors.guestPhone && (
                <p className="text-sm text-destructive">{errors.guestPhone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredDate">Preferred Date *</Label>
              <Input
                id="preferredDate"
                type="date"
                value={form.preferredDate}
                // The guest's own today, not UTC's (the form renders client-side only).
                min={localDate()}
                max={localDate(365)}
                onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
              />
              {errors.preferredDate && (
                <p className="text-sm text-destructive">{errors.preferredDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (optional)</Label>
              <Textarea
                id="message"
                maxLength={1000}
                placeholder="Any specific requests or questions..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Booking Request"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-10 max-w-2xl">
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}

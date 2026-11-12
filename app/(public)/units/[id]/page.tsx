"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/skeletons";
import { StatusBadge } from "@/components/status-badge";
import { unitFacts } from "@/components/unit-card";
import { apiGet, getImageUrl } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { Unit } from "@/lib/types";

function parseAmenities(amenities?: string | string[] | null): string[] {
  if (!amenities) return [];
  if (Array.isArray(amenities)) return amenities;
  try {
    const parsed = JSON.parse(amenities);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    return amenities.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function DetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-10" role="status" aria-label="Loading">
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  );
}

function UnitDetailContent() {
  const params = useParams();
  const id = params.id as string;
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPhoto, setCurrentPhoto] = useState(0);

  useEffect(() => {
    apiGet<Unit>(`/units/${id}`)
      .then(setUnit)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DetailSkeleton />;

  if (error || !unit) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">This home isn&apos;t listed</h1>
        <p className="mt-2 text-muted-foreground">It may have been let or removed.</p>
        <Button asChild className="mt-6">
          <Link href="/units">See available homes</Link>
        </Button>
      </div>
    );
  }

  const photos = unit.photos;
  const amenities = parseAmenities(unit.amenities);
  const available = unit.status === "AVAILABLE";

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/units"
        className="-ml-1 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All homes
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
            <img
              key={photos[currentPhoto]?.id ?? "placeholder"}
              src={getImageUrl(photos[currentPhoto]?.path)}
              alt={unit.name}
              className="h-full w-full object-cover animate-in fade-in duration-300"
            />
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={() => setCurrentPhoto((p) => (p - 1 + photos.length) % photos.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/85 p-2 shadow-sm transition hover:bg-background active:scale-95"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={() => setCurrentPhoto((p) => (p + 1) % photos.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/85 p-2 shadow-sm transition hover:bg-background active:scale-95"
                >
                  <ChevronRight className="size-5" />
                </button>
                <p className="absolute bottom-3 right-3 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium tabular-nums">
                  {currentPhoto + 1} / {photos.length}
                </p>
              </>
            )}
          </div>

          {photos.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {photos.map((photo, i) => (
                <button
                  key={photo.id}
                  type="button"
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === currentPhoto}
                  onClick={() => setCurrentPhoto(i)}
                  className={cn(
                    "h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg ring-2 transition",
                    i === currentPhoto ? "ring-brand" : "opacity-60 ring-transparent hover:opacity-100",
                  )}
                >
                  <img src={getImageUrl(photo.path)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-8">
            <h1 className="text-3xl font-semibold tracking-tight">{unit.name}</h1>
            <p className="mt-1 text-muted-foreground">{unit.address}</p>
            <p className="mt-3 font-medium tabular-nums">{unitFacts(unit)}</p>
          </div>

          {unit.description && (
            <section className="mt-10">
              <h2 className="text-lg font-semibold">About this home</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">{unit.description}</p>
            </section>
          )}

          {amenities.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-semibold">Amenities</h2>
              <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-3">
                {amenities.map((amenity) => (
                  <li key={amenity} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 shrink-0 text-brand" aria-hidden />
                    {amenity}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl bg-card p-6 ring-1 ring-foreground/10">
            <p className="text-3xl font-semibold tabular-nums">
              {formatMoney(unit.priceCents)}
              <span className="ml-1 text-base font-normal text-muted-foreground">/month</span>
            </p>
            {available ? (
              <>
                <Button asChild size="xl" className="mt-6 w-full">
                  <Link href={`/book/${unit.id}`}>Book a viewing</Link>
                </Button>
                <p className="mt-3 text-center text-sm text-muted-foreground">
                  Free and with no commitment. We&apos;ll confirm the time with you.
                </p>
              </>
            ) : (
              <div className="mt-6 flex items-center gap-2">
                <StatusBadge status={unit.status} />
                <span className="text-sm text-muted-foreground">Not taking viewings right now</span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function UnitDetailPage() {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <UnitDetailContent />
    </Suspense>
  );
}

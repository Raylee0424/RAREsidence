"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { apiGet, getImageUrl } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { unitFacts } from "@/components/unit-card";
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

export default function MyUnitPage() {
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiGet<Unit>("/units/my-unit")
      .then(setUnit)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded w-1/3" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="text-center py-20">
        <h1 className="mb-2 text-xl font-semibold">No home assigned yet</h1>
        <p className="text-muted-foreground">
          You don&apos;t have a unit assigned yet. Contact your property manager for assistance.
        </p>
      </div>
    );
  }

  const photos = unit.photos || [];
  const amenities = parseAmenities(unit.amenities);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My home</h1>
      </div>

      {/* Photo display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {photos.length > 0 ? (
          photos.map((photo) => (
            <div key={photo.id} className="aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={getImageUrl(photo.path)}
                alt={photo.filename || unit.name}
                className="w-full h-full object-cover"
              />
            </div>
          ))
        ) : (
          <div className="aspect-video rounded-lg overflow-hidden bg-muted col-span-full max-h-64">
            <img
              src={getImageUrl(null)}
              alt={unit.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      <Card>
        <CardContent className="space-y-10 p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">{unit.name}</h2>
              <p className="mt-1 text-muted-foreground">{unit.address}</p>
              <p className="mt-3 font-medium tabular-nums">{unitFacts(unit)}</p>
            </div>
            <p className="text-2xl font-semibold tabular-nums">
              {formatMoney(unit.priceCents)}
              <span className="text-base font-normal text-muted-foreground">/mo</span>
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">About this home</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {unit.description || "No description provided."}
            </p>
          </div>

          {amenities.length > 0 && (
            <>
              <div>
                <h3 className="font-semibold mb-3">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 text-sm">
                      <Check className="size-4 shrink-0 text-brand" aria-hidden />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

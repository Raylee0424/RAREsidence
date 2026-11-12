"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building2, Bed, Bath, Maximize, MapPin, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { apiGet, getImageUrl } from "@/lib/api";
import { formatMoney } from "@/lib/money";
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
        <Building2 className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Unit Assigned</h2>
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
        <h1 className="text-2xl font-bold">My Unit</h1>
        <p className="text-muted-foreground">Details about your assigned property</p>
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
        <CardContent className="p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold mb-1">{unit.name}</h2>
              <p className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {unit.address}
              </p>
            </div>
            <Badge variant="secondary">{unit.status}</Badge>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Bed className="h-5 w-5 text-muted-foreground" />
              <span>{unit.bedrooms} Bedrooms</span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="h-5 w-5 text-muted-foreground" />
              <span>{unit.bathrooms} Bathrooms</span>
            </div>
            <div className="flex items-center gap-2">
              <Maximize className="h-5 w-5 text-muted-foreground" />
              <span>{unit.area} sqft</span>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Monthly Rent</h3>
            <p className="text-2xl font-bold">{formatMoney(unit.priceCents)}/mo</p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {unit.description || "No description provided."}
            </p>
          </div>

          {amenities.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
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

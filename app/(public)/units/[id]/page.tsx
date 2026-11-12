"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Bed,
  Bath,
  Maximize,
  MapPin,
  DollarSign,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CalendarPlus,
  Check,
} from "lucide-react";
import { useEffect, useState, Suspense } from "react";
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="h-80 bg-muted animate-pulse rounded-lg mb-6" />
        <div className="space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded w-1/3" />
          <div className="h-5 bg-muted animate-pulse rounded w-1/2" />
          <div className="h-20 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Building2 className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Unit Not Found</h2>
        <p className="text-muted-foreground mb-6">{error || "This unit could not be found."}</p>
        <Button asChild>
          <Link href="/units">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Units
          </Link>
        </Button>
      </div>
    );
  }

  const photos = unit.photos || [];
  const statusVariant = unit.status === "AVAILABLE" ? "default" : unit.status === "OCCUPIED" ? "secondary" : "outline";

  return (
    <div className="container mx-auto px-4 py-10">
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/units">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Units
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Photos + Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo Gallery */}
          <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
            {photos.length > 0 ? (
              <>
                <img
                  src={getImageUrl(photos[currentPhoto].path)}
                  alt={photos[currentPhoto].filename || unit.name}
                  className="w-full h-full object-cover"
                />
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentPhoto((p) => (p - 1 + photos.length) % photos.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-2 hover:bg-background transition"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentPhoto((p) => (p + 1) % photos.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-2 hover:bg-background transition"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {photos.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPhoto(i)}
                          className={`h-2 w-2 rounded-full transition ${
                            i === currentPhoto ? "bg-white" : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <img
                src={getImageUrl(null)}
                alt={unit.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Thumbnail strip */}
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {photos.map((photo, i) => (
                <button
                  key={photo.id}
                  onClick={() => setCurrentPhoto(i)}
                  className={`flex-shrink-0 w-20 h-14 rounded-md overflow-hidden border-2 transition ${
                    i === currentPhoto ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={getImageUrl(photo.path)} alt={photo.filename || ""} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Details */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1">{unit.name}</h1>
                <p className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {unit.address}
                </p>
              </div>
              <Badge variant={statusVariant}>{unit.status}</Badge>
            </div>

            <div className="flex items-center gap-6 mb-6">
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

            <Separator className="mb-6" />

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {unit.description}
              </p>
            </div>

            {parseAmenities(unit.amenities).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {parseAmenities(unit.amenities).map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Price Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-3xl font-bold">
                  {formatMoney(unit.priceCents)}
                  <span className="text-base font-normal text-muted-foreground">/month</span>
                </p>
              </div>
              <Separator />
              {unit.status === "AVAILABLE" && (
                <Button asChild className="w-full" size="lg">
                  <Link href={`/book/${unit.id}`}>
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Book a Viewing
                  </Link>
                </Button>
              )}
              {unit.status !== "AVAILABLE" && (
                <p className="text-sm text-muted-foreground text-center">
                  This unit is currently {unit.status.toLowerCase()}.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function UnitDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-10">
          <div className="h-80 bg-muted animate-pulse rounded-lg mb-6" />
        </div>
      }
    >
      <UnitDetailContent />
    </Suspense>
  );
}

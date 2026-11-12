"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Bed, Bath, Maximize } from "lucide-react";
import { useEffect, useState } from "react";
import { apiGet, getImageUrl } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import type { Unit } from "@/lib/types";

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Unit[]>("/units")
      .then(setUnits)
      .catch(() => setUnits([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Available Properties</h1>
        <p className="text-muted-foreground">
          Browse our curated selection of quality living spaces
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 bg-muted animate-pulse" />
              <CardContent className="p-5 space-y-3">
                <div className="h-5 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : units.length === 0 ? (
        <div className="text-center py-20">
          <Building2 className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Properties Found</h2>
          <p className="text-muted-foreground">
            Check back soon for new listings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {units.map((unit) => (
            <Link key={unit.id} href={`/units/${unit.id}`}>
              <Card className="overflow-hidden transition-shadow hover:shadow-lg cursor-pointer h-full flex flex-col">
                <div className="h-48 bg-muted relative">
                  {unit.photos && unit.photos.length > 0 ? (
                    <img
                      src={getImageUrl(unit.photos[0].path)}
                      alt={unit.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={getImageUrl(null)}
                      alt={unit.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <Badge
                    className="absolute top-3 right-3"
                    variant={unit.status === "AVAILABLE" ? "default" : "secondary"}
                  >
                    {unit.status}
                  </Badge>
                </div>
                <CardContent className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-lg mb-1">{unit.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                    {unit.address}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Bed className="h-3.5 w-3.5" /> {unit.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="h-3.5 w-3.5" /> {unit.bathrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize className="h-3.5 w-3.5" /> {unit.area} sqft
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <p className="text-lg font-bold">
                      {formatMoney(unit.priceCents)}
                      <span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </p>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

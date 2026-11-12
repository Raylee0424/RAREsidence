"use client";

import { useEffect, useState } from "react";
import { UnitCard, UnitCardSkeleton } from "@/components/unit-card";
import { apiGet } from "@/lib/api";
import type { Unit } from "@/lib/types";

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only homes that can actually be booked, which is what the heading promises.
    apiGet<Unit[]>("/units?status=AVAILABLE")
      .then(setUnits)
      .catch(() => setUnits([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">
        {loading ? "Available homes" : `${units.length} ${units.length === 1 ? "home" : "homes"} available now`}
      </h1>
      <p className="mt-2 text-muted-foreground">Open any listing to see photos, amenities and viewing times.</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [1, 2, 3].map((i) => <UnitCardSkeleton key={i} />)
        ) : units.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed px-6 py-16 text-center">
            <h2 className="text-lg font-semibold">Every home is currently let</h2>
            <p className="mt-1 text-muted-foreground">Check back soon for new listings.</p>
          </div>
        ) : (
          units.map((unit) => <UnitCard key={unit.id} unit={unit} />)
        )}
      </div>
    </div>
  );
}

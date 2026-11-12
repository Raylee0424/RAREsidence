"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { UnitCard, UnitCardSkeleton } from "@/components/unit-card";
import { apiGet } from "@/lib/api";
import type { Unit } from "@/lib/types";

export default function HomePage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Unit[]>("/units?status=AVAILABLE")
      .then(setUnits)
      .catch(() => setUnits([]))
      .finally(() => setLoading(false));
  }, []);

  const [featured, ...others] = units;

  return (
    <div className="container mx-auto px-4 pb-24 pt-14 md:pt-20">
      <section className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          Apartments for rent, with real photos and prices
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Pick a home, choose a date and request a viewing in about two minutes. Our team confirms
          every request personally.
        </p>
        <Button asChild size="xl" className="mt-8">
          <Link href="/units">
            {loading || units.length === 0
              ? "Browse homes"
              : units.length === 1
                ? "See the available home"
                : `See all ${units.length} available homes`}
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </section>

      {/* The product itself, in the first screen: what's available right now. */}
      <section className="mt-14 space-y-6" aria-label="Available now">
        {loading ? (
          <>
            <UnitCardSkeleton featured />
            <div className="grid gap-6 sm:grid-cols-2">
              <UnitCardSkeleton />
              <UnitCardSkeleton />
            </div>
          </>
        ) : !featured ? (
          <div className="rounded-xl border border-dashed px-6 py-16 text-center">
            <h2 className="text-lg font-semibold">Every home is currently let</h2>
            <p className="mt-1 text-muted-foreground">New listings appear here as soon as they&apos;re available.</p>
          </div>
        ) : (
          <>
            <UnitCard unit={featured} featured />
            {others.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {others.slice(0, 3).map((unit) => (
                  <UnitCard key={unit.id} unit={unit} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

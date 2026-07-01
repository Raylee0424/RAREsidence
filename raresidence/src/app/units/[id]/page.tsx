"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { unitsData } from "@/lib/dummy-data";

const getUnitData = (id: string) => {
  return unitsData.find((unit) => unit.id.toString() === id);
};

// 2. Change the TypeScript type to indicate params is a Promise
export default function UnitDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 3. Unwrap the params Promise using React.use()
  const resolvedParams = use(params);

  // 4. Safely access the id from the unwrapped params
  const unit = getUnitData(resolvedParams.id);

  if (!unit) {
    return (
      <div className="p-12 text-center text-2xl font-bold">Unit not found!</div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl p-6 py-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
        {/* Left Column: Image */}
        <div className="relative w-full aspect-4/3 overflow-hidden rounded-2xl border shadow-sm lg:col-span-3">
          <img
            src={unit.image}
            alt={`${unit.name} cover`}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col justify-between rounded-2xl border p-8 shadow-sm lg:col-span-2">
          <div>
            {/* Header section with Name and Badge */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <h1 className="text-4xl font-bold tracking-tight">{unit.name}</h1>
              <Badge
                variant={unit.status === "Available" ? "default" : "secondary"}
                className={`text-sm ${unit.status === "Available" ? "bg-amber-400 hover:bg-amber-500 text-black" : ""}`}
              >
                {unit.status}
              </Badge>
            </div>

            {/* Location */}
            <p className="mb-8 text-lg text-muted-foreground">
              {unit.location}
            </p>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 gap-y-6 rounded-xl bg-muted/50 p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Size
                </p>
                <p className="text-xl font-semibold">{unit.size} sq ft</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Bedrooms
                </p>
                <p className="text-xl font-semibold">{unit.bedrooms}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Bathrooms
                </p>
                <p className="text-xl font-semibold">{unit.bathrooms}</p>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-10 pt-6 border-t">
            <Button asChild size="lg" className="w-full text-lg">
              <Link href={`/booking?unitId=${unit.id}`}>Book Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

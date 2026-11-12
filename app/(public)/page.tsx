"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, ArrowRight, Bed, Bath, Maximize } from "lucide-react";
import { useEffect, useState } from "react";
import { apiGet, getImageUrl } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import type { Unit } from "@/lib/types";

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/50 to-muted py-20 md:py-32">
      <div className="container mx-auto px-4 text-center">
        <Badge variant="secondary" className="mb-4">
          Premium Property Management
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Find Your Perfect
          <br />
          <span className="text-primary">Home</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Discover beautifully managed properties in prime locations. 
          Quality living spaces designed for modern lifestyles.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/units">
              Browse Units
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Tenant & Admin Login</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function FeaturedUnitsSection() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Unit[]>("/units")
      .then((data) => setUnits(data.slice(0, 3)))
      .catch(() => setUnits([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Featured Properties</h2>
          <p className="text-muted-foreground">
            Explore our most sought-after living spaces
          </p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 bg-muted animate-pulse" />
                <CardContent className="p-5 space-y-3">
                  <div className="h-5 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : units.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No units available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {units.map((unit) => (
              <Link key={unit.id} href={`/units/${unit.id}`}>
                <Card className="overflow-hidden transition-shadow hover:shadow-lg cursor-pointer h-full">
                  <div className="h-48 bg-muted relative">
                    <img
                      src={getImageUrl(unit.photos && unit.photos.length > 0 ? unit.photos[0].path : null)}
                      alt={unit.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-3 right-3" variant={unit.status === "AVAILABLE" ? "default" : "secondary"}>
                      {unit.status}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-lg mb-1">{unit.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                      {unit.address}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Bed className="h-3.5 w-3.5" /> {unit.bedrooms} bed
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="h-3.5 w-3.5" /> {unit.bathrooms} bath
                      </span>
                      <span className="flex items-center gap-1">
                        <Maximize className="h-3.5 w-3.5" /> {unit.area} sqft
                      </span>
                    </div>
                    <p className="text-lg font-bold">
                      {formatMoney(unit.priceCents)}
                      <span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        {units.length > 0 && (
          <div className="text-center mt-10">
            <Button asChild variant="outline" size="lg">
              <Link href="/units">
                View All Properties
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="border-t border-b bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "50+", label: "Properties" },
            { value: "200+", label: "Happy Tenants" },
            { value: "98%", label: "Satisfaction Rate" },
            { value: "24/7", label: "Support" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl md:text-4xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedUnitsSection />
      <StatsSection />
    </>
  );
}


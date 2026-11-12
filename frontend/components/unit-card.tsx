import Link from "next/link";
import { getImageUrl } from "@/lib/api";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { Unit } from "@/lib/types";

/** "2 bd · 1 ba · 45 sqft": the facts people compare, without icon clutter. */
export function unitFacts(unit: Pick<Unit, "bedrooms" | "bathrooms" | "area">): string {
  return [
    `${unit.bedrooms} bd`,
    `${unit.bathrooms} ba`,
    unit.area ? `${unit.area.toLocaleString()} sqft` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function UnitCard({ unit, featured = false }: { unit: Unit; featured?: boolean }) {
  const photo = unit.photos.find((p) => p.isPrimary) ?? unit.photos[0];

  return (
    // The whole card is one link, so there's no button nested inside a link.
    <Link
      href={`/units/${unit.id}`}
      className={cn(
        "group flex flex-col gap-3 rounded-xl bg-card p-2 ring-1 ring-foreground/10 transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-lg hover:ring-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        featured && "md:flex-row md:gap-6",
      )}
    >
      {/* Inset photo: radius = card radius − p-2 padding. */}
      <div
        className={cn(
          "relative overflow-hidden rounded-inset bg-muted",
          featured ? "aspect-[4/3] md:w-3/5" : "aspect-[4/3]",
        )}
      >
        <img
          src={getImageUrl(photo?.path)}
          alt={unit.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className={cn("flex flex-1 flex-col px-2 pb-2", featured && "md:justify-center md:py-4 md:pr-6")}>
        <h3 className={cn("font-semibold", featured ? "text-2xl" : "text-base")}>{unit.name}</h3>
        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{unit.address}</p>
        {featured && unit.description && (
          <p className="mt-4 line-clamp-3 text-muted-foreground">{unit.description}</p>
        )}
        {/* Price stays with the text it describes; only grid cards pin it to the bottom so rows line up. */}
        <div className={cn("flex items-baseline justify-between gap-4 pt-4", featured ? "md:pt-8" : "mt-auto")}>
          <p className={cn("font-semibold tabular-nums", featured ? "text-2xl" : "text-lg")}>
            {formatMoney(unit.priceCents)}
            <span className="ml-0.5 text-sm font-normal text-muted-foreground">/mo</span>
          </p>
          <p className="text-sm text-muted-foreground tabular-nums">{unitFacts(unit)}</p>
        </div>
      </div>
    </Link>
  );
}

export function UnitCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div
      className={cn("flex flex-col gap-3 rounded-xl p-2 ring-1 ring-foreground/10", featured && "md:flex-row md:gap-6")}
      aria-hidden
    >
      <div className={cn("aspect-[4/3] animate-pulse rounded-inset bg-muted", featured && "md:w-3/5")} />
      <div className="flex-1 space-y-3 px-2 pb-2 md:py-4">
        <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

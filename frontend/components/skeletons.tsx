import { cn } from "@/lib/utils";

// Loading placeholders shaped like the content they stand in for, so the page
// doesn't jump when data arrives.

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} aria-hidden />;
}

export function TableSkeleton({ rows = 4, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="divide-y" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex items-center gap-6 px-4 py-4">
          {Array.from({ length: columns }, (_, col) => (
            <Skeleton key={col} className={cn("h-4", col === 0 ? "w-40" : "flex-1")} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Stand-in for a dashboard layout while the session is checked. */
export function DashboardSkeleton() {
  return (
    <div className="flex h-screen" role="status" aria-label="Loading">
      <div className="hidden w-64 border-r bg-card p-4 md:block">
        <Skeleton className="mb-8 h-6 w-32" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </div>
      <div className="flex-1 space-y-6 p-6">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

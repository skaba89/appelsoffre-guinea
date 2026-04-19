import { Skeleton } from "@/components/ui/skeleton";

export default function ComparisonLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-border overflow-hidden">
        <Skeleton className="h-12 w-full" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex border-t border-border">
            <Skeleton className="h-12 w-40 shrink-0" />
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className="h-12 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

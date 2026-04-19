import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function CalendarLoading() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64 mt-1" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-8" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Calendar grid skeleton */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 bg-muted/50">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="py-2 text-center">
              <Skeleton className="h-3 w-8 mx-auto" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="min-h-[80px] sm:min-h-[100px] border-b border-r border-border p-2">
              <Skeleton className="h-4 w-4 mb-2" />
              <Skeleton className="h-3 w-full mb-1" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

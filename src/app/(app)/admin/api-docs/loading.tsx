import { Skeleton } from "@/components/ui/skeleton";

export default function APIDocsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-5 h-5 rounded" />
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
      </div>

      {/* Search */}
      <Skeleton className="h-10 w-full rounded-md" />

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 shrink-0 hidden lg:block space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-8 w-full" />
              ))}
            </div>
          ))}
        </div>

        {/* Detail */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-14" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-6 w-72" />
          <Skeleton className="h-16 w-full" />

          {/* Params table */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>

          {/* Response example */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

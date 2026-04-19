import { Skeleton } from "@/components/ui/skeleton";

export default function EmailTemplatesLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Template selector skeleton */}
      <div className="flex gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>

        {/* Preview skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

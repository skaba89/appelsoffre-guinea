import { Skeleton } from "@/components/ui/skeleton";

export default function WebhooksLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded" />
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <Skeleton className="h-9 w-40" />
      </div>

      {/* Info card */}
      <div className="border border-dashed rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="w-5 h-5 shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      </div>

      {/* Webhook cards */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

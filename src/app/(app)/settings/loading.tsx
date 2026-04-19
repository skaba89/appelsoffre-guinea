import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
}

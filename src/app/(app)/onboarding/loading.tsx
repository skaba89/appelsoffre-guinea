import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard } from "@/components/ui/skeleton";

export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar skeleton */}
      <div className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="flex-1 h-1.5 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-xl space-y-6">
          <div className="text-center space-y-4">
            <Skeleton className="w-20 h-20 rounded-2xl mx-auto" />
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-4 w-80 mx-auto" />
          </div>
          <SkeletonCard />
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

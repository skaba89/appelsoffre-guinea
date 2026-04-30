import { TableSkeleton } from "@/components/ui/page-skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-36 bg-accent animate-pulse rounded mb-2" />
          <div className="h-4 w-48 bg-accent animate-pulse rounded" />
        </div>
        <div className="h-9 w-28 bg-accent animate-pulse rounded-lg" />
      </div>
      <TableSkeleton rows={8} cols={4} />
    </div>
  );
}

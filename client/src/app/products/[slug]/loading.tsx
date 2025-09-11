import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
        <div>
          <Skeleton className="w-full aspect-square rounded-lg" />
          <div className="flex gap-2 mt-4">
            <Skeleton className="w-24 h-24 rounded" />
            <Skeleton className="w-24 h-24 rounded" />
            <Skeleton className="w-24 h-24 rounded" />
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <div className="flex items-center gap-4 pt-4">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 flex-1" />
          </div>
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}

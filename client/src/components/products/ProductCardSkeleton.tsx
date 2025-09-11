import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col h-full overflow-hidden rounded-lg border border-gray-200/60 bg-white">
      {/* Skeleton for Image */}
      <Skeleton className="relative aspect-square w-full" />

      {/* Skeleton for Text Content */}
      <div className="flex flex-col flex-grow p-3 text-right">
        {/* Skeleton for Brand */}
        <Skeleton className="h-3 w-1/3 mb-2" />

        {/* Skeleton for Product Name */}
        <div className="flex-grow mb-2 space-y-1.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="flex justify-between items-center mt-auto pt-2">
          {/* Skeleton for Price */}
          <div className="w-1/2 space-y-1.5">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>

          {/* Skeleton for Action Buttons */}
          <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

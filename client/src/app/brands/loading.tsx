// client/src/app/brands/loading.tsx

import { Skeleton } from "@/components/ui/skeleton";

export default function BrandsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Skeleton for Page Header/Banner */}
      <Skeleton className="h-48 w-full rounded-2xl mb-10" />

      {/* Skeleton for Brands Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center gap-3 p-4"
          >
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

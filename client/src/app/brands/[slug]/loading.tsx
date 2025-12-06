import { FilterSkeleton } from "@/components/skeleton/FilterSkeleton";
import { ProductGridSkeleton } from "@/components/skeleton/ProductGridSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="bg-neutral-50 min-h-screen pb-20">
      {/* ۱. اسکلت هدر برند (عکس و لوگو) */}
      <div className="relative w-full">
        <div className="relative h-[300px] md:h-[400px] w-full bg-neutral-200 animate-pulse" />
        <div className="container mx-auto px-4 relative -mt-20 z-10 pb-8">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-right">
            <Skeleton className="w-32 h-32 rounded-full border-4 border-white" />
            <div className="flex-1 mb-4 space-y-3 flex flex-col items-center md:items-start">
              <Skeleton className="h-10 w-64 rounded-lg" />
              <Skeleton className="h-4 w-96 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* ۲. اسکلت بخش فروشگاه (سایدبار و محصولات) */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-white/50 p-6 md:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* سایدبار */}
            <div className="hidden lg:block w-72 flex-shrink-0">
              <FilterSkeleton />
            </div>
            {/* لیست محصولات */}
            <div className="flex-1 w-full space-y-6">
              <div className="flex justify-between">
                <Skeleton className="h-10 w-32 rounded-lg" />
                <Skeleton className="h-10 w-40 rounded-lg" />
              </div>
              <ProductGridSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

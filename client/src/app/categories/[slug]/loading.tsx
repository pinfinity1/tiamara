import { FilterSkeleton } from "@/components/skeleton/FilterSkeleton";
import { ProductGridSkeleton } from "@/components/skeleton/ProductGridSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="bg-neutral-50 min-h-screen pb-20">
      {/* ۱. اسکلت هدر دسته‌بندی (استایل Editorial و وسط‌چین) */}
      <div className="relative h-[400px] md:h-[500px] w-full bg-neutral-900 flex flex-col items-center justify-center overflow-hidden">
        {/* پالس پس‌زمینه برای شبیه‌سازی لود شدن عکس بزرگ */}
        <div className="absolute inset-0 bg-neutral-800 animate-pulse opacity-50" />

        <div className="relative z-10 flex flex-col items-center gap-6 px-4 w-full max-w-4xl">
          {/* بج کوچک انگلیسی */}
          <Skeleton className="h-6 w-24 rounded-full bg-white/10" />

          {/* تیتر بزرگ وسط‌چین */}
          <Skeleton className="h-16 md:h-24 w-3/4 md:w-1/2 rounded-xl bg-white/10" />

          {/* توضیحات وسط‌چین */}
          <div className="space-y-2 w-full flex flex-col items-center">
            <Skeleton className="h-4 w-2/3 bg-white/10" />
            <Skeleton className="h-4 w-1/2 bg-white/10" />
          </div>
        </div>
      </div>

      {/* ۲. اسکلت بخش فروشگاه (دقیقاً مشابه برندها اما بدون فاصله زیاد هدر) */}
      <div className="container mx-auto px-4">
        {/* مارجین منفی برای روی هم افتادن با هدر */}
        <div className="bg-white -mt-12 relative z-20 rounded-[2.5rem] shadow-xl border border-neutral-100 p-6 md:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* سایدبار فیلتر */}
            <div className="hidden lg:block w-72 flex-shrink-0">
              <FilterSkeleton />
            </div>

            {/* لیست محصولات */}
            <div className="flex-1 w-full space-y-6">
              {/* تولبار بالای محصولات */}
              <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-32 rounded-lg" />{" "}
                {/* دکمه فیلتر موبایل / تعداد */}
                <Skeleton className="h-10 w-40 rounded-lg" /> {/* مرتب‌سازی */}
              </div>

              {/* گرید محصولات */}
              <ProductGridSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

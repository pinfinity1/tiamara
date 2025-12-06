import { FilterSkeleton } from "@/components/skeleton/FilterSkeleton";
import { ProductGridSkeleton } from "@/components/skeleton/ProductGridSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="bg-white min-h-screen pb-20">
      {/* 1. اسکلت هدر برند (Dark Mode Style) */}
      {/* منطبق با BrandHero جدید */}
      <div className="relative h-[400px] md:h-[500px] w-full bg-neutral-900 overflow-hidden">
        {/* پالس پس‌زمینه */}
        <div className="absolute inset-0 bg-neutral-800 animate-pulse" />

        {/* محتوای پایین هدر (لوگو و متون) */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-10 md:pb-14 pt-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
              {/* لوگو (مربعی با گوشه گرد) */}
              <div className="relative shrink-0">
                <Skeleton className="w-28 h-28 md:w-36 md:h-36 rounded-[2rem] bg-white/10 border border-white/5 shadow-2xl" />
              </div>

              {/* متون (تراز راست یا وسط) */}
              <div className="flex-1 space-y-4 flex flex-col items-center md:items-start w-full">
                {/* نام فارسی */}
                <Skeleton className="h-12 md:h-16 w-64 bg-white/10 rounded-xl" />
                {/* نام انگلیسی */}
                <Skeleton className="h-4 md:h-6 w-32 bg-white/10 rounded-lg" />
                {/* توضیحات کوتاه */}
                <div className="hidden md:flex flex-col gap-2 w-full max-w-xl opacity-50">
                  <Skeleton className="h-2 w-full bg-white/20" />
                  <Skeleton className="h-2 w-2/3 bg-white/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. اسکلت بخش معرفی (Intro Box) */}
      {/* منطبق با سکشن Glassmorphism جدید */}
      <div className="relative z-10 -mt-8 mb-12 container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white border border-neutral-100 shadow-sm rounded-3xl p-8 md:p-12 flex flex-col items-center gap-6">
          <Skeleton className="w-12 h-12 rounded-full" /> {/* آیکون Sparkles */}
          <Skeleton className="h-8 w-1/2 rounded-xl" /> {/* تیتر درباره برند */}
          <div className="w-full space-y-3 flex flex-col items-center">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>

      {/* 3. اسکلت بخش فروشگاه (Shop Section) */}
      <div className="container mx-auto px-4">
        {/* خط جداکننده */}
        <div className="flex items-center gap-4 mb-12 opacity-50 px-4 md:px-0">
          <Skeleton className="h-px flex-1" />
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-px flex-1" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* سایدبار فیلتر */}
          <div className="hidden lg:block w-72 flex-shrink-0 sticky top-24">
            <FilterSkeleton />
          </div>

          {/* گرید محصولات */}
          <div className="flex-1 w-full space-y-6">
            <div className="flex justify-between items-center">
              <Skeleton className="h-10 w-32 rounded-lg" />
              <Skeleton className="h-10 w-40 rounded-lg" />
            </div>
            <ProductGridSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

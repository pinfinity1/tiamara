import { Skeleton } from "@/components/ui/skeleton";

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col h-full rounded-xl border border-gray-100 bg-white overflow-hidden"
        >
          {/* جای تصویر (مربعی) */}
          <div className="relative aspect-square w-full bg-gray-50">
            <Skeleton className="h-full w-full" />
          </div>

          {/* محتوای متنی */}
          <div className="flex flex-col flex-grow p-3 gap-2">
            {/* برند */}
            <Skeleton className="h-3 w-1/3 rounded-full" />

            {/* نام محصول (دو خط) */}
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />

            <div className="mt-auto pt-4 flex items-center justify-between">
              {/* دکمه افزودن */}
              <Skeleton className="h-8 w-8 rounded-lg" />
              {/* قیمت */}
              <div className="flex flex-col items-end gap-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

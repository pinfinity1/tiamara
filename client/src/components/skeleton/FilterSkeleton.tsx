import { Skeleton } from "@/components/ui/skeleton";

export function FilterSkeleton() {
  return (
    <div className="space-y-6 p-5 rounded-2xl border border-gray-100 bg-white">
      {/* هدر فیلتر */}
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-4 w-12" />
      </div>

      {/* آیتم‌های آکاردئونی */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="space-y-2 pl-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

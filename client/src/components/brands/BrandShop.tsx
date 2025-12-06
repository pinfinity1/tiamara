"use client";

import { useEffect, useMemo } from "react";
import { useProductStore } from "@/store/useProductStore";
import { useFilterStore } from "@/store/useFilterStore";
import ProductGrid from "@/components/products/ProductGrid";
import FilterSidebar from "@/components/products/FilterSidebar";
import SortBar from "@/components/products/SortBar";
import StorefrontPagination from "@/components/products/StorefrontPagination";
import MobileFilter from "@/components/products/MobileFilter";
import { ProductCardSkeleton } from "@/components/products/ProductCardSkeleton";
import { useSearchParams } from "next/navigation";
import { FilterOption } from "@/lib/data/get-filters";

interface BrandShopProps {
  brandName: string; // نام برند برای فیلتر کردن اجباری
}

export default function BrandShop({ brandName }: BrandShopProps) {
  const searchParams = useSearchParams();
  const {
    products,
    totalPages,
    totalProducts,
    isLoading,
    fetchProductsForClient,
  } = useProductStore();

  const { filters, fetchFilters } = useFilterStore();

  const page = parseInt(searchParams.get("page") ?? "1");
  const [sortField, sortOrder] = (
    searchParams.get("sortBy") || "createdAt-desc"
  ).split("-");

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    fetchProductsForClient({
      page,
      limit: 12,
      brands: [brandName], // 🔒 قفل کردن روی برند جاری
      categories: searchParams.get("categories")?.split(","),
      skin_types: searchParams.get("skin_types")?.split(","),
      concerns: searchParams.get("concerns")?.split(","),
      minPrice: Number(searchParams.get("minPrice")) || undefined,
      maxPrice: Number(searchParams.get("maxPrice")) || undefined,
      sortBy: sortField,
      sortOrder: sortOrder as "asc" | "desc",
      hasDiscount: searchParams.get("hasDiscount") === "true",
    });
  }, [
    searchParams,
    brandName,
    fetchProductsForClient,
    page,
    sortField,
    sortOrder,
  ]);

  // ✅ حل مشکل تایپ‌اسکریپت: تبدیل null به undefined
  const safeCategories: FilterOption[] = useMemo(() => {
    if (!filters?.categories) return [];
    return filters.categories.map((cat) => ({
      ...cat,
      englishName: cat.englishName || undefined, // اگر null بود تبدیل به undefined میشه
    }));
  }, [filters?.categories]);

  // مقادیر قیمت برای اسلایدر
  const minPrice = filters?.priceRange?.min ?? 0;
  const maxPrice = filters?.priceRange?.max ?? 10000000;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start relative">
      {/* --- سایدبار فیلترها (Desktop) --- */}
      <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-24">
        {filters ? (
          <FilterSidebar
            // ✅ اینجا آرایه خالی می‌فرستیم تا فیلتر برند مخفی شود
            allBrands={[]}
            // ✅ از لیست اصلاح شده استفاده می‌کنیم تا ارور تایپ رفع شود
            allCategories={safeCategories}
            minPriceData={minPrice}
            maxPriceData={maxPrice}
          />
        ) : (
          <div className="space-y-4">
            <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        )}
      </aside>

      {/* --- بدنه اصلی --- */}
      <main className="flex-1 w-full">
        {/* تولبار (فیلتر موبایل + مرتب‌سازی + تعداد) */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2">
            {filters && (
              <MobileFilter
                // ✅ برای موبایل هم برندها را مخفی می‌کنیم
                allBrands={[]}
                allCategories={safeCategories}
                minPriceData={minPrice}
                maxPriceData={maxPrice}
              />
            )}
            <span className="text-sm text-gray-500 font-medium px-2">
              {totalProducts} محصول
            </span>
          </div>

          <div className="flex-1 flex justify-end">
            <SortBar />
          </div>
        </div>

        {/* گرید محصولات */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
            <p className="text-lg font-medium text-gray-600">
              محصولی یافت نشد.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              شاید فیلترهای انتخاب شده نتیجه‌ای ندارند.
            </p>
          </div>
        )}

        {/* صفحه‌بندی */}
        <div className="mt-12 pt-6 border-t border-gray-100">
          <StorefrontPagination totalPages={totalPages} />
        </div>
      </main>
    </div>
  );
}

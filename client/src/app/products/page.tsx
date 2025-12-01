import { Suspense } from "react";
import { searchParamsCache } from "@/lib/searchParams";
import { getProducts } from "@/lib/data/get-products";
import { getFilters } from "@/lib/data/get-filters"; // <--- ایمپورت جدید
import ProductGrid from "@/components/products/ProductGrid";
import FilterSidebar from "@/components/products/FilterSidebar";
import SortBar from "@/components/products/SortBar";
import { SearchParams } from "nuqs/server";
import StorefrontPagination from "@/components/products/StorefrontPagination";

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  // 1. پارس کردن پارامترهای URL
  const params = await searchParams;
  console.log(params);

  const parsedParams = searchParamsCache.parse(params);

  // 2. دریافت داده‌ها از سرور (به صورت موازی برای سرعت بالاتر)
  const [productsData, filtersData] = await Promise.all([
    getProducts(parsedParams),
    getFilters(), // <--- دریافت لیست برندها و دسته‌ها
  ]);

  const { products, metadata } = productsData;
  const { brands, categories } = filtersData; // <--- استخراج داده‌ها

  return (
    <div className="container mx-auto px-4 py-8">
      {/* هدر صفحه */}
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">همه محصولات</h1>
        <p className="text-gray-500 mt-2 text-sm">
          {metadata.totalCount.toLocaleString("fa-IR")} محصول پیدا شد
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* --- سایدبار فیلترها --- */}
        <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-24">
          {/* پاس دادن دیتای واقعی به سایدبار */}
          <FilterSidebar allBrands={brands} allCategories={categories} />
        </aside>

        {/* --- بدنه اصلی --- */}
        <main className="flex-1 w-full">
          {/* نوار مرتب‌سازی */}
          <div className="mb-6 flex justify-between items-center bg-gray-50/50 p-2 rounded-lg">
            {/* در موبایل دکمه فیلتر را اینجا اضافه خواهیم کرد */}
            <span className="lg:hidden text-sm font-bold text-gray-700">
              فیلترها
            </span>
            <div className="mr-auto">
              <SortBar />
            </div>
          </div>

          {/* لیست محصولات */}
          <Suspense
            key={JSON.stringify(parsedParams)}
            fallback={<ProductListSkeleton />}
          >
            <ProductGrid products={products} />
          </Suspense>

          {/* صفحه‌بندی */}
          <div className="mt-12 flex justify-center border-t pt-6">
            <StorefrontPagination totalPages={metadata.totalPages} />
          </div>
        </main>
      </div>
    </div>
  );
}

function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="aspect-square bg-gray-100 rounded-2xl animate-pulse"
        />
      ))}
    </div>
  );
}

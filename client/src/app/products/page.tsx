import { Suspense } from "react";
import { getProducts } from "@/lib/data/get-products";
import { getFilters } from "@/lib/data/get-filters";
import ProductGrid from "@/components/products/ProductGrid";
import FilterSidebar from "@/components/products/FilterSidebar";
import SortBar from "@/components/products/SortBar";
import StorefrontPagination from "@/components/products/StorefrontPagination";
import MobileFilter from "@/components/products/MobileFilter";
import AutoScrollTop from "@/components/common/AutoScrollTop";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;

  const search = (params.search as string) || "";

  const categories =
    typeof params.categories === "string" ? params.categories.split(",") : [];
  const brands =
    typeof params.brands === "string" ? params.brands.split(",") : [];

  let title = "فروشگاه محصولات";
  let description = "بهترین محصولات آرایشی و بهداشتی را در تیامارا پیدا کنید.";

  // سناریو ۱: جستجو
  if (search) {
    title = `نتایج جستجو برای "${search}"`;
    description = `خرید و قیمت انواع محصولات مرتبط با ${search} در تیامارا.`;
  }
  // سناریو ۲: فیلتر برند
  else if (brands.length === 1) {
    title = `محصولات برند ${brands[0]}`;
    description = `خرید بهترین محصولات اورجینال برند ${brands[0]} با ضمانت اصالت کالا.`;
  }
  // سناریو ۳: فیلتر دسته‌بندی
  else if (categories.length === 1) {
    title = `خرید ${categories[0]}`;
    description = `مشاهده و خرید انواع ${categories[0]} با بهترین قیمت و کیفیت.`;
  }
  // سناریو ۴: تخفیف‌ها
  else if (params.hasDiscount === "true") {
    title = "پیشنهادات شگفت‌انگیز و تخفیف‌دار";
    description = "لیست محصولات دارای تخفیف ویژه در فروشگاه اینترنتی تیامارا.";
  }

  return {
    title: title,
    description: description,
    openGraph: {
      title: `${title} | تیامارا`,
      description: description,
      type: "website",
    },
    alternates: {
      canonical: `/products`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const search = (params.search as string) || "";
  const sort = (params.sort as string) || "newest";
  const hasDiscount = params.hasDiscount === "true";

  // فچ کردن فیلترها (برند، دسته، قیمت واقعی)
  const filtersData = await getFilters();
  const {
    brands: allBrands,
    categories: allCategories,
    priceRange,
  } = filtersData;

  // تنظیم قیمت بر اساس ورودی URL یا مقادیر دیتابیس
  const minPrice = params.minPrice ? Number(params.minPrice) : priceRange.min;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : priceRange.max;

  const parseArray = (param: string | string[] | undefined) => {
    if (!param) return [];
    if (Array.isArray(param)) return param;
    return param.split(",");
  };

  const categories = parseArray(params.categories);
  const brands = parseArray(params.brands);

  const productsData = await getProducts({
    page,
    limit: 12,
    search,
    sort,
    minPrice,
    maxPrice,
    categories,
    brands,
    hasDiscount,
  });

  const { products, metadata } = productsData;

  return (
    <div className="container mx-auto px-4 py-8">
      <AutoScrollTop />
      {/* هدر صفحه */}
      <div className="mb-8 border-b pb-4 flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">
          {hasDiscount
            ? "پیشنهادات شگفت‌انگیز"
            : search
            ? `نتایج جستجو برای "${search}"`
            : "همه محصولات"}
        </h1>
        <p className="text-gray-500 text-sm">
          {metadata.totalCount.toLocaleString("fa-IR")} محصول پیدا شد
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* --- سایدبار دسکتاپ --- */}
        <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-24">
          <FilterSidebar
            allBrands={allBrands}
            allCategories={allCategories}
            minPriceData={priceRange.min}
            maxPriceData={priceRange.max}
          />
        </aside>

        {/* --- بدنه اصلی --- */}
        <main className="flex-1 w-full">
          {/* نوار ابزار موبایل و دسکتاپ */}
          <div className="mb-6 flex flex-wrap gap-4 items-center justify-between bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
            {/* دکمه فیلتر موبایل */}
            <MobileFilter
              allBrands={allBrands}
              allCategories={allCategories}
              minPriceData={priceRange.min}
              maxPriceData={priceRange.max}
            />

            {/* مرتب‌سازی */}
            <div className="flex-1 flex justify-end">
              <SortBar />
            </div>
          </div>

          {/* لیست محصولات */}
          <Suspense
            key={JSON.stringify(params)}
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

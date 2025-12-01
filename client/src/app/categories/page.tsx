import Link from "next/link";
import Image from "next/image";
import { fetchAllCategories } from "@/lib/data-fetching";
import { Category } from "@/store/useCategoryStore";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "دسته‌بندی محصولات",
  description:
    "محصولات آرایشی، بهداشتی و مراقبتی را در دسته‌بندی‌های متنوع تیامارا، از جمله مراقبت پوست، آرایش، عطر و ... پیدا کنید.",
  openGraph: {
    title: "دسته‌بندی کامل محصولات در تیامارا",
    description: "هر آنچه برای زیبایی نیاز دارید، در دسته‌بندی‌های متنوع ما.",
    images: [
      {
        url: "/images/category-banner.webp",
        width: 1200,
        height: 630,
        alt: "دسته‌بندی‌های تیامارا",
      },
    ],
  },
  alternates: {
    canonical: "/categories",
  },
};

const CategoriesPage = async () => {
  const categories: Category[] = await fetchAllCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header/Banner */}
      <div className="relative bg-gray-100 rounded-2xl p-8 md:p-12 mb-10 overflow-hidden text-center">
        <div className="absolute inset-0">
          <Image
            src="/images/abstract-design-1.png"
            alt="Tiamara Categories"
            width={750}
            height={200}
            className="m-auto opacity-20 object-fit"
          />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-800">
            دسته‌بندی محصولات
          </h1>
          <p className="mt-4 text-md md:text-lg text-gray-600 max-w-2xl mx-auto">
            از مراقبت پوست تا آرایش و عطر، همه چیز برای زیبایی شما در
            دسته‌بندی‌های متنوع ما.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link
            href={`/categories/${category.slug}`}
            key={category.id}
            className="group block w-full h-40 rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="relative flex h-full w-full items-center justify-center bg-gray-50/80 p-4 border border-gray-200/80">
              {/* خط تزئینی عمودی */}
              <div
                aria-hidden="true"
                className="absolute right-4 top-1/2 h-2/3 w-px -translate-y-1/2 bg-repeat-y opacity-70 transition-opacity group-hover:opacity-100"
                style={{
                  backgroundImage:
                    "linear-gradient(to bottom, #9ca3af 60%, transparent 40%)",
                  backgroundSize: "100% 8px",
                }}
              />
              <h3 className="font-semibold text-gray-800 text-lg pr-4">
                {category.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;

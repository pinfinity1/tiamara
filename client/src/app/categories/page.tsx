import Link from "next/link";
import Image from "next/image";
import { fetchAllCategories } from "@/lib/data-fetching"; // تابع دریافت دیتا از سرور
import { Category } from "@/store/useCategoryStore"; // وارد کردن تایپ دسته‌بندی

// کامپوننت به صورت async تعریف می‌شود
const CategoriesPage = async () => {
  // دیتا مستقیما در سرور دریافت می‌شود
  const categories: Category[] = await fetchAllCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header/Banner */}
      <div className="relative bg-gray-100 rounded-2xl p-8 md:p-12 mb-10 overflow-hidden text-center">
        <div className="absolute inset-0">
          <Image
            src="/images/category-banner.jpg" // مسیر بنر جدید شما
            alt="Tiamara Categories"
            layout="fill"
            objectFit="cover"
            className="opacity-20"
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
      {/* دیگر نیازی به Skeleton نیست */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link
            href={`/categories/${category.slug}`}
            key={category.id}
            legacyBehavior
          >
            <a className="group relative block w-full h-40 rounded-xl overflow-hidden shadow-md">
              <Image
                src={category.imageUrl || "/images/placeholder.png"}
                alt={category.name}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <h3 className="text-white text-xl font-bold">
                  {category.name}
                </h3>
              </div>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;

import { fetchAllCategories } from "@/lib/data-fetching";
import { Category } from "@/store/useCategoryStore";
import { Metadata } from "next";
import CategoryBentoGrid from "@/components/categories/CategoryBentoGrid";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "کالکشن‌ها و دسته‌بندی‌ها",
  description:
    "دنیایی از محصولات آرایشی و مراقبتی را در دسته‌بندی‌های تخصصی تیامارا کشف کنید.",
};

export default async function CategoriesPage() {
  // دریافت دیتا سمت سرور (بدون نیاز به SSR داینامیک، این دیتا می‌تواند کش شود)
  const categories: Category[] = await fetchAllCategories();

  return (
    <div className="bg-neutral-50 min-h-screen pb-20">
      {/* هدر ساده و تمیز */}
      <div className="container mx-auto px-4 pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-600 text-xs font-bold mb-4">
          <Sparkles className="w-3 h-3" />
          دسته‌بندی‌های منتخب
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-neutral-900 mb-4 tracking-tight">
          چه چیزی نیاز دارید؟
        </h1>
        <p className="text-neutral-500 max-w-lg mx-auto">
          برای پیدا کردن محصول مناسب، ابتدا دسته‌بندی مورد نظر خود را انتخاب
          کنید.
        </p>
      </div>

      {/* بنتو گرید */}
      <div className="container mx-auto px-2 md:px-4">
        <CategoryBentoGrid categories={categories} />
      </div>
    </div>
  );
}

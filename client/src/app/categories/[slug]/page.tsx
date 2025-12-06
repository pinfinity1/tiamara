import CategoryHero from "@/components/categories/CategoryHero";
import CategoryShop from "@/components/categories/CategoryShop"; // ✅ کامپوننت جدید
import { getCategoryBySlug } from "@/lib/data-fetching";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) return { title: "دسته‌بندی یافت نشد" };

  return {
    title: category.metaTitle || category.name,
    description:
      category.metaDescription ||
      `خرید اینترنتی انواع محصولات ${category.name} با بهترین قیمت.`,
    openGraph: {
      images: [category.imageUrl || "/images/placeholder.png"],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  // فقط دیتای اولیه کتگوری را سمت سرور می‌گیریم (برای SEO و Hero)
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  return (
    <div className="bg-neutral-50 min-h-screen pb-20">
      {/* هدر زیبای دسته‌بندی */}
      <CategoryHero category={category} />

      <div className="container mx-auto px-4">
        {/* کانتینر فروشگاه */}
        <div className="bg-white -mt-12 relative z-20 rounded-[2.5rem] shadow-xl border border-white/50 p-4 md:p-8 lg:p-10 min-h-[600px]">
          {/* لاجیک فروشگاه اختصاصی دسته‌بندی */}
          <CategoryShop categoryName={category.name} />
        </div>
      </div>
    </div>
  );
}

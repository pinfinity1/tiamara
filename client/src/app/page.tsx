// file: client/src/app/page.tsx

import HomeBannerCarousel from "@/components/layout/home/HomeBannerCarousel";
import ProductSection from "@/components/layout/home/ProductSection";
import { ProductCardSkeleton } from "@/components/products/ProductCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { getHomepageData } from "@/lib/data-fetching";

export default async function HomePage() {
  const { banners, sections } = await getHomepageData();

  if (!sections || sections.length === 0) {
    return (
      <section className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold">محصولی برای نمایش وجود ندارد</h2>
        <p className="text-gray-500 mt-2">
          به زودی محصولات جدید اضافه خواهد شد.
        </p>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <HomeBannerCarousel banners={banners} />

      <div className="py-12 lg:py-16 space-y-12 lg:space-y-16">
        {sections.map((section) => (
          <ProductSection key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}

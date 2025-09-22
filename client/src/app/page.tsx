import HomeBannerCarousel from "@/components/layout/home/HomeBannerCarousel";
import ProductSection from "@/components/layout/home/ProductSection"; // اصلاح نام کامپوننت
import { getHomepageData } from "@/lib/data-fetching";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { collections } = await getHomepageData();

  console.log(collections);

  return (
    <div className="min-h-screen bg-white">
      <HomeBannerCarousel group="home-banner" />

      <div className="py-12 lg:py-16 space-y-12 lg:space-y-16">
        {collections.map((collection) => (
          <ProductSection key={collection.id} collection={collection} />
        ))}
      </div>
    </div>
  );
}

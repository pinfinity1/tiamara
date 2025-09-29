import HomeBannerCarousel from "@/components/layout/home/HomeBannerCarousel";
import ProductSection from "@/components/layout/home/ProductSection";
import {
  getBannersByGroup,
  getCollectionsByLocation,
  getHomepageData,
} from "@/lib/data-fetching";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const homepageBanners = await getBannersByGroup("home-banner");
  const homepageCollections = await getCollectionsByLocation("homepage");

  return (
    <div className="min-h-screen bg-white">
      <HomeBannerCarousel banners={homepageBanners} />

      <div className="py-12 lg:py-16 space-y-12 lg:space-y-16">
        {homepageCollections.map((collection) => (
          <ProductSection key={collection.id} collection={collection} />
        ))}
      </div>
    </div>
  );
}

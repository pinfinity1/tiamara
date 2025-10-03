import FeaturedBrands from "@/components/layout/home/FeaturedBrands";
import HomeBannerCarousel from "@/components/layout/home/HomeBannerCarousel";
import ProductSection from "@/components/layout/home/ProductSection";
import WhyChooseUs from "@/components/layout/home/WhyChooseUs";
import {
  fetchAllBrands,
  getBannersByGroup,
  getCollectionsByLocation,
} from "@/lib/data-fetching";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const homepageBanners = await getBannersByGroup("home-banner");
  const homepageCollections = await getCollectionsByLocation("homepage");
  const allBrands = await fetchAllBrands();

  return (
    <div className="min-h-screen bg-white">
      <HomeBannerCarousel banners={homepageBanners} />

      <div className="py-12 lg:py-16 space-y-12 lg:space-y-16">
        {homepageCollections.map((collection) => (
          <ProductSection key={collection.id} collection={collection} />
        ))}
      </div>

      <FeaturedBrands brands={allBrands} />

      <WhyChooseUs />
    </div>
  );
}

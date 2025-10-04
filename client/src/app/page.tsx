import FeaturedBrands from "@/components/layout/home/FeaturedBrands";
import HomeBannerCarousel from "@/components/layout/home/HomeBannerCarousel";
import NewsletterSignUp from "@/components/layout/home/NewsletterSignUp";
import ProductSection from "@/components/layout/home/ProductSection";
import VideoShowcase from "@/components/layout/home/VideoShowcase";
import WhyChooseUs from "@/components/layout/home/WhyChooseUs";
import {
  fetchAllBrands,
  getBannersByGroup,
  getCollectionsByLocation,
  getVideoShowcaseItems,
} from "@/lib/data-fetching";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const homepageBanners = await getBannersByGroup("home-banner");
  const homepageCollections = await getCollectionsByLocation("homepage");
  const allBrands = await fetchAllBrands();
  const videoShowcaseItems = await getVideoShowcaseItems();

  return (
    <div className="min-h-screen bg-white">
      <HomeBannerCarousel banners={homepageBanners} />

      <VideoShowcase items={videoShowcaseItems} />

      <div className="py-12 lg:py-16 space-y-12 lg:space-y-16">
        {homepageCollections.map((collection) => (
          <ProductSection key={collection.id} collection={collection} />
        ))}
      </div>

      <FeaturedBrands brands={allBrands} />

      <WhyChooseUs />

      <NewsletterSignUp />
    </div>
  );
}

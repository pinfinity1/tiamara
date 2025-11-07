import { SkinProfilePromptBanner } from "@/components/common/SkinProfilePromptBanner";
import AmazingOfferSection from "@/components/layout/home/AmazingOfferSection";
import BrandsProductSection from "@/components/layout/home/BrandsProductSection";
import HomeBannerCarousel from "@/components/layout/home/HomeBannerCarousel";
import NewsletterSignUp from "@/components/layout/home/NewsletterSignUp";
import BestSellingProductSection from "@/components/layout/home/BestSellingProductSection";
import WhyChooseUs from "@/components/layout/home/WhyChooseUs";
import {
  fetchAllBrands,
  getBannersByGroup,
  getCollectionsByLocation,
  getVideoShowcaseItems,
} from "@/lib/data-fetching";
import dynamic from "next/dynamic";

const VideoCarousel = dynamic(
  () => import("@/components/layout/home/VideoCarousel")
);
const ProductSection = dynamic(
  () => import("@/components/layout/home/ProductSection")
);
const FeaturedBrands = dynamic(
  () => import("@/components/layout/home/FeaturedBrands")
);

export default async function HomePage() {
  const homepageBanners = await getBannersByGroup("home-banner");
  const homepageCollections = await getCollectionsByLocation("homepage");
  const allBrands = await fetchAllBrands();
  const videoShowcaseItems = await getVideoShowcaseItems();

  return (
    <div className="min-h-screen bg-white">
      <HomeBannerCarousel banners={homepageBanners} />

      {/* <AmazingOfferSection /> */}

      {/* <BestSellingProductSection /> */}

      {/* <BrandsProductSection collectionType="BRAND" /> */}

      {/* <BrandsProductSection collectionType="BRAND_SPOTLIGHT_2" /> */}

      {/* <div className="py-12 lg:py-16 space-y-12 lg:space-y-16">
        {homepageCollections.map((collection) => (
          <ProductSection key={collection.id} collection={collection} />
        ))}
      </div> */}

      <SkinProfilePromptBanner />

      <VideoCarousel items={videoShowcaseItems} />

      <FeaturedBrands brands={allBrands} />

      <WhyChooseUs />

      <NewsletterSignUp />
    </div>
  );
}

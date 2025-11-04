import { SkinProfilePromptBanner } from "@/components/common/SkinProfilePromptBanner";
import HomeBannerCarousel from "@/components/layout/home/HomeBannerCarousel";
import NewsletterSignUp from "@/components/layout/home/NewsletterSignUp";
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

  const carouselItems = videoShowcaseItems.map((item) => ({
    ...item, // کپی کردن id, videoUrl و سایر فیلدها
    product: {
      ...item.product, // کپی کردن تمام فیلدهای محصول
      // این خط خطا را برطرف می‌کند:
      // اگر item.product.brand وجود دارد (null یا undefined نیست)، آن را به { name: ... } تبدیل کن
      // در غیر این صورت، آن را undefined قرار بده
      brand: item.product?.brand
        ? { name: item.product.brand.name }
        : undefined,
    },
  }));

  return (
    <div className="min-h-screen bg-white">
      <HomeBannerCarousel banners={homepageBanners} />

      <div className="py-12 lg:py-16 space-y-12 lg:space-y-16">
        {homepageCollections.map((collection) => (
          <ProductSection key={collection.id} collection={collection} />
        ))}
      </div>

      <SkinProfilePromptBanner />

      <VideoCarousel items={carouselItems} />

      <FeaturedBrands brands={allBrands} />

      <WhyChooseUs />

      <NewsletterSignUp />
    </div>
  );
}

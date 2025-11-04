import { getCollectionByType } from "@/lib/data-fetching";
import ProductSlider from "@/components/layout/home/ProductSlider"; // ایمپورت کامپوننت "خنگ"
import { ProductCollection } from "@/store/useHomepageStore"; // ۱. ایمپورت تایپ اصلی
import { Brand } from "@/store/useBrandStore"; // ۱. ایمپورت تایپ برند

// ۲. یک تایپ محلی بسازید که تایپ اصلی را گسترش می‌دهد
// این کار تایپ‌اسکریپت را "مجبور" می‌کند که پراپرتی brand را ببیند
// که ما می‌دانیم از بک‌اند ارسال می‌شود.
type CollectionWithBrand = ProductCollection & {
  brand?: Brand;
};

interface BrandsProductSectionProps {
  collectionType: string; // "BRAND_SPOTLIGHT_1" یا "BRAND_SPOTLIGHT_2"
  background?: boolean;
}

/**
 * کامپوننت "هوشمند" برای نمایش محصولات یک برند خاص در صفحه اصلی
 */
export default async function BrandsProductSection({
  collectionType,
  background = false,
}: BrandsProductSectionProps) {
  // ۳. نتیجه را به تایپ جدید و کامل‌تر کست کنید
  const collection = (await getCollectionByType(
    collectionType
  )) as CollectionWithBrand | null;

  if (!collection || !collection.products || collection.products.length === 0) {
    return null;
  }

  // ۴. حالا collection.brand?.slug بدون خطا کار می‌کند
  //    همچنین یک بررسی اضافه شده که اگر برند وجود نداشت، لینکی ساخته نشود
  return (
    <ProductSlider
      title={collection.title}
      products={collection.products}
      viewAllLink={
        collection.brand ? `/brands/${collection.brand.slug}` : undefined
      } // لینک به صفحه برند
    />
  );
}

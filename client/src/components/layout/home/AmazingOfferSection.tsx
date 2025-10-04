// client/src/components/layout/home/AmazingOfferSection.tsx

import { ProductCollection } from "@/store/useHomepageStore";
import Link from "next/link";
import Image from "next/image";
import ItemsCarousel from "@/components/common/carousel/ItemsCarousel";

interface AmazingOfferSectionProps {
  collection: ProductCollection;
}

export default function AmazingOfferSection({
  collection,
}: AmazingOfferSectionProps) {
  if (!collection || !collection.products || collection.products.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4">
      {/* کانتینر اصلی با position: relative برای پس‌زمینه */}
      <div className="relative rounded-lg overflow-hidden md:h-[420px] w-full flex flex-col md:flex-row">
        {/* تصویر پس‌زمینه که از پنل ادمین می‌آید و کل بخش را می‌پوشاند */}
        {collection.imageUrl && (
          <Image
            src={collection.imageUrl}
            alt={collection.title}
            fill
            className="object-cover z-0"
          />
        )}
        {/* لایه تیره برای خوانایی بهتر */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>

        {/* محتوای رویی با z-index بالاتر */}
        <div className="relative z-20 w-full md:w-1/4 flex flex-col items-center justify-center p-6 text-white text-center">
          <h2 className="text-3xl font-bold">{collection.title}</h2>
          <p className="text-6xl font-bold my-4">%</p>
          <Link
            href="/products?sort=discount"
            className="mt-4 inline-block bg-white text-gray-800 font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition-colors"
          >
            مشاهده همه
          </Link>
        </div>

        {/* کانتینر اسلایدر */}
        <div className="relative z-20 w-full md:w-3/4 p-4 flex items-center">
          <ItemsCarousel products={collection.products} />
        </div>
      </div>
    </section>
  );
}

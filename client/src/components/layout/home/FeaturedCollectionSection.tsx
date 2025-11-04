import ProductCard from "@/components/products/ProductCard";
import ItemsCarousel from "@/components/common/carousel/ItemsCarousel";
import { ProductCollection } from "@/store/useHomepageStore";
import Link from "next/link";
import Image from "next/image";

interface FeaturedCollectionProps {
  collection: ProductCollection;
}

export default function FeaturedCollectionSection({
  collection,
}: FeaturedCollectionProps) {
  if (
    !collection ||
    !collection.products ||
    collection.products.length === 0 ||
    !collection.imageUrl
  ) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 my-12 lg:my-16">
      {/* بخش بنر */}
      <div className="relative rounded-lg overflow-hidden min-h-[300px] lg:min-h-[350px] flex items-center justify-center p-8 text-center">
        <Image
          src={collection.imageUrl}
          alt={collection.title}
          layout="fill"
          objectFit="cover"
          className="z-0"
        />
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="relative z-20 text-white">
          <h2 className="text-3xl lg:text-5xl font-extrabold">
            {collection.title}
          </h2>
          <Link
            href={`/products?collection=${collection.id}`} // لینک داینامیک
            className="mt-6 inline-block bg-white text-primary font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition-colors"
          >
            مشاهده همه
          </Link>
        </div>
      </div>

      {/* اسلایدر محصولات مرتبط با بنر */}
      {/* به جای گرید ۵تایی، از اسلایدر استفاده می‌کنیم
        و همه محصولات (یا مثلا ۱۰ تای اول) را نشان می‌دهیم
      */}
      <div className="relative w-full h-[380px] mt-8">
        {" "}
        {/* ارتفاع مثال: 380px */}
        <ItemsCarousel>
          {collection.products.slice(0, 10).map(
            (
              product // مثلا 10 محصول اول
            ) => (
              <ProductCard key={product.id} product={product} />
            )
          )}
        </ItemsCarousel>
      </div>
    </section>
  );
}

import ProductCard from "@/components/products/ProductCard";
import { ProductCollection } from "@/store/useHomepageStore";
import Link from "next/link";
import Image from "next/image";
import AmazingOfferSection from "./AmazingOfferSection"; // کامپوننت جدید را وارد می‌کنیم

interface ProductSectionProps {
  collection: ProductCollection;
}

export default function ProductSection({ collection }: ProductSectionProps) {
  if (!collection || !collection.products || collection.products.length === 0) {
    return null;
  }

  // اگر نوع مجموعه تخفیف‌دار بود، کامپوننت مربوط به آن را نمایش بده
  if (collection.type === "DISCOUNTED") {
    return <AmazingOfferSection collection={collection} />;
  }

  // اگر مجموعه بنر داشت، این ظاهر را نمایش بده
  if (collection.imageUrl) {
    return (
      <section className="container mx-auto px-4">
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
              href="/products"
              className="mt-6 inline-block bg-white text-primary font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition-colors"
            >
              مشاهده همه
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 mt-8">
          {collection.products.slice(0, 5).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    );
  }

  // ظاهر پیش‌فرض برای سایر مجموعه‌ها
  return (
    <section className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
          {collection.title}
        </h2>
        <Link
          href="/products"
          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          مشاهده همه
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
        {collection.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

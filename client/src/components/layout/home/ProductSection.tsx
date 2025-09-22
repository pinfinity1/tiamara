import ProductCard from "@/components/products/ProductCard";
import { ProductCollection } from "@/store/useHomepageStore";
import Link from "next/link";

interface ProductSectionProps {
  collection: ProductCollection;
}

export default function ProductSection({ collection }: ProductSectionProps) {
  // اگر مجموعه‌ای محصولی برای نمایش نداشت، آن را رندر نکن
  if (!collection || !collection.products || collection.products.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
          {collection.title}
        </h2>
        <Link
          href="/products" // لینکی به صفحه تمام محصولات
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

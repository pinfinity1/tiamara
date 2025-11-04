import ProductCard from "@/components/products/ProductCard";
import ItemsCarousel from "@/components/common/carousel/ItemsCarousel";
import { Product } from "@/store/useProductStore";
import Link from "next/link";

interface ProductSliderProps {
  title: string;
  products: Product[];
  viewAllLink?: string;
}

export default function ProductSlider({
  title,
  products,
  viewAllLink,
}: ProductSliderProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="container mx-auto px-4 my-12 lg:my-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900">{title}</h2>
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="text-sm font-semibold text-primary hover:text-primary/80"
          >
            مشاهده همه
          </Link>
        )}
      </div>
      <div className="relative w-full h-[380px]">
        {/* ارتفاع باید تنظیم شود */}
        <ItemsCarousel>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ItemsCarousel>
      </div>
    </section>
  );
}

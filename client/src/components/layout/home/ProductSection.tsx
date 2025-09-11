import { HomepageSection } from "@/store/useHomepageStore";
import ProductCard from "@/components/products/ProductCard";

export default function ProductSection({
  section,
}: {
  section: HomepageSection;
}) {
  return (
    <section className="container mx-auto px-4">
      <h2 className="text-center text-2xl lg:text-3xl font-bold mb-2 text-gray-900">
        {section.title}
      </h2>
      <p className="text-center text-gray-500 mb-8">
        جدیدترین محصولات در این بخش
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
        {section.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

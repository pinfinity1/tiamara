import { Product } from "@/store/useProductStore";
import ProductCard from "./ProductCard";
import { PackageSearch } from "lucide-react";

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <PackageSearch className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-800">محصولی یافت نشد!</h3>
        <p className="text-sm text-gray-500 mt-2">
          لطفاً فیلترها را تغییر دهید یا عبارت دیگری جستجو کنید.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

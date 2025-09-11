"use client";

import { Product } from "@/store/useProductStore";
import { Button } from "@/components/ui/button";
import Image from "next/image";

function ProductCard({ product }: { product: Product }) {
  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0].url
      : "/placeholder.png";

  return (
    <a
      href={`/products/${product.slug}`}
      className="group cursor-pointer flex flex-col h-full no-underline text-current"
    >
      <div className="relative aspect-[3/4] mb-3 bg-gray-100 overflow-hidden rounded-lg">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button className="bg-white text-black hover:bg-gray-100 pointer-events-none">
            مشاهده محصول
          </Button>
        </div>
      </div>
      <div className="flex flex-col flex-grow">
        <h3 className="font-semibold text-sm text-gray-800 flex-grow">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1">{product.brand?.name}</p>
        <p className="font-bold mt-2 text-gray-900">
          {product.price.toLocaleString("fa-IR")} تومان
        </p>
      </div>
    </a>
  );
}

export default ProductCard;

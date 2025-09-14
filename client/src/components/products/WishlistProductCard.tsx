"use client";

import { Product } from "@/store/useProductStore";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import WishlistButton from "../common/buttons/WishlistButton";
import ImagePlaceholder from "../common/ImagePlaceholder";
import { ArrowLeft } from "lucide-react";

export default function WishlistProductCard({ product }: { product: Product }) {
  const imageUrl =
    product.images && product.images.length > 0 ? product.images[0].url : null;
  const hasDiscount =
    product.discount_price && product.discount_price < product.price;

  return (
    <div className="group flex items-center gap-4 rounded-lg border bg-white p-4 transition-shadow hover:shadow-md">
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
        <Link
          href={`/products/${product.slug}`}
          className="block h-full w-full"
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="100px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <ImagePlaceholder />
          )}
        </Link>
      </div>

      <div className="flex flex-1 flex-col justify-between self-stretch">
        <div>
          <p className="text-xs text-gray-500">{product.brand?.name}</p>
          <h3 className="font-semibold text-sm text-gray-800">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h3>
          <div className="mt-1">
            {hasDiscount ? (
              <div className="flex items-center gap-2">
                <p className="font-bold text-base text-red-600">
                  {product.discount_price?.toLocaleString("fa-IR")}
                  <span className="text-xs mr-1">تومان</span>
                </p>
                <p className="text-xs text-gray-400 line-through">
                  {product.price.toLocaleString("fa-IR")}
                </p>
              </div>
            ) : (
              <p className="font-bold text-base text-gray-900">
                {product.price.toLocaleString("fa-IR")}
                <span className="text-xs mr-1">تومان</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between self-stretch">
        <WishlistButton productId={product.id} productName={product.name} />
        <Button asChild size="sm" variant="outline">
          <Link href={`/products/${product.slug}`}>
            مشاهده
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

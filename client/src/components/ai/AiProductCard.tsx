"use client";

import { Product } from "@/store/useProductStore";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ImagePlaceholder from "../common/ImagePlaceholder";

interface AiProductCardProps {
  product: Product;
}

export default function AiProductCard({ product }: AiProductCardProps) {
  const imageUrl =
    product.images && product.images.length > 0 ? product.images[0].url : null;
  const hasDiscount =
    product.discount_price && product.discount_price < product.price;

  return (
    <div className="group flex items-center gap-4 w-full max-w-sm rounded-lg border bg-white p-3 transition-shadow hover:shadow-md">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>

      <div className="flex-1 text-right">
        <p className="text-xs text-gray-500">{product.brand?.name}</p>
        <h3 className="font-semibold text-sm text-gray-800 leading-tight">
          {product.name}
        </h3>
        <div className="mt-1">
          {hasDiscount ? (
            <div className="flex items-baseline gap-2">
              <p className="font-bold text-base text-red-600">
                {product.discount_price?.toLocaleString("fa-IR")}
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

      <div className="self-end">
        <Button asChild size="sm" variant="ghost" className="h-full">
          <Link href={`/products/${product.slug}`} target="_blank">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

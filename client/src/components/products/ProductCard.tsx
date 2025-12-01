"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ImagePlaceholder from "../common/ImagePlaceholder";
import WishlistButton from "../common/buttons/WishlistButton";
import type { Product } from "@/store/useProductStore";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasDiscount =
    product.discount_price && product.discount_price < product.price;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.price - product.discount_price!) / product.price) * 100
      )
    : 0;

  const isOutOfStock = product.stock <= 0;
  const imageUrl = product.images?.[0]?.url;

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group relative flex flex-col w-full h-full bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300",
        !isOutOfStock
          ? "hover:border-gray-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:-translate-y-1"
          : "opacity-60 grayscale-[0.8] cursor-default"
      )}
    >
      {/* --- بخش تصویر (مربعی) --- */}
      <div className="relative aspect-square w-full bg-white overflow-hidden border-b border-gray-50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-contain transition-transform duration-500 group-hover:scale-[101%]"
          />
        ) : (
          <ImagePlaceholder />
        )}

        {/* بج تخفیف (با عدد فارسی) */}
        {hasDiscount && !isOutOfStock && (
          <span className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
            {discountPercentage.toLocaleString("fa-IR")}%
          </span>
        )}

        {/* لیبل ناموجود */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] z-10">
            <span className="bg-gray-800 text-white text-xs px-3 py-1 rounded-md font-medium">
              ناموجود
            </span>
          </div>
        )}

        {/* دکمه علاقه‌مندی */}
        <div className="absolute top-2 left-2 z-20 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200">
          <div onClick={(e) => e.preventDefault()}>
            <WishlistButton productId={product.id} productName={product.name} />
          </div>
        </div>
      </div>

      {/* --- بخش اطلاعات --- */}
      <div className="flex flex-col flex-grow p-3">
        {/* برند */}
        {product.brand && (
          <span className="text-[10px] text-gray-400 mb-1 truncate block">
            {product.brand.name}
          </span>
        )}

        {/* نام محصول */}
        <h3 className="text-xs sm:text-sm font-bold text-gray-800 leading-tight line-clamp-2 min-h-[2.2rem] mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* قیمت (با اعداد فارسی) */}
        <div className="mt-auto pt-2 border-t border-dashed border-gray-100 flex items-center justify-end flex-wrap gap-2">
          {isOutOfStock ? (
            <span className="text-xs text-gray-400 font-medium">
              تماس بگیرید
            </span>
          ) : hasDiscount ? (
            <>
              <span className="text-[10px] text-gray-400 line-through decoration-gray-300">
                {product.price.toLocaleString("fa-IR")}
              </span>
              <div className="flex items-center gap-1 text-rose-600 font-bold text-sm sm:text-base">
                {product.discount_price?.toLocaleString("fa-IR")}
                <span className="text-[10px] font-normal text-gray-500">
                  تومان
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1 text-gray-800 font-bold text-sm sm:text-base">
              {product.price.toLocaleString("fa-IR")}
              <span className="text-[10px] font-normal text-gray-500">
                تومان
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

"use client";

import { Product } from "@/store/useProductStore";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import ImagePlaceholder from "../common/ImagePlaceholder";
import { AlertTriangle } from "lucide-react";

export default function AmazingOfferProductCard({
  product,
}: {
  product: Product;
}) {
  const imageUrl = product.images?.[0]?.url;

  const hasDiscount =
    product.discount_price && product.discount_price < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.price - product.discount_price!) / product.price) * 100
      )
    : 0;

  const showLowStockAlert = product.stock > 0 && product.stock < 3;

  return (
    <Link
      href={`/products/${product.slug}`}
      target="_blank"
      className="group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* بج تخفیف (سایز استاندارد) */}
      {hasDiscount && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 text-xs font-bold rounded-md shadow-sm">
            {discountPercentage.toLocaleString("fa-IR")}%
          </Badge>
        </div>
      )}

      {/* تصویر (فضای مناسب) */}
      <div className="relative aspect-square w-full p-4 bg-gray-50/30 group-hover:bg-gray-50 transition-colors duration-300">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>

      {/* محتوای متنی */}
      <div className="flex flex-col flex-grow p-3 text-right">
        {/* برند (سایز کوچک اما خوانا) */}
        <p className="text-xs text-gray-400 mb-1 font-medium truncate">
          {product.brand?.name}
        </p>

        {/* عنوان محصول (سایز استاندارد و بولد) */}
        <h3 className="font-bold text-sm text-gray-800 line-clamp-2 min-h-[2.5rem] leading-relaxed group-hover:text-rose-600 transition-colors mb-2">
          {product.name}
        </h3>

        {/* هشدار موجودی */}
        <div className="min-h-[22px] mb-1">
          {showLowStockAlert && (
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded w-full justify-center animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>فقط {product.stock.toLocaleString("fa-IR")} عدد ماند!</span>
            </div>
          )}
        </div>

        {/* قیمت‌ها */}
        <div className="mt-auto pt-2 border-t border-gray-100">
          {hasDiscount ? (
            <div className="flex flex-col items-end gap-0.5">
              {/* قیمت خط خورده */}
              <span className="text-xs text-gray-400 line-through decoration-rose-300/60">
                {product.price.toLocaleString("fa-IR")}
              </span>
              {/* قیمت نهایی (درشت) */}
              <div className="flex items-center gap-1 text-gray-900 font-black text-lg">
                <span>{product.discount_price?.toLocaleString("fa-IR")}</span>
                <span className="text-xs font-medium text-gray-500 mt-1">
                  تومان
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-end justify-end h-full">
              <div className="flex items-center gap-1 text-gray-900 font-black text-lg">
                <span>{product.price.toLocaleString("fa-IR")}</span>
                <span className="text-xs font-medium text-gray-500 mt-1">
                  تومان
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

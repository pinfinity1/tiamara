// client/src/components/products/AmazingOfferProductCard.tsx (Updated)

"use client";

import { Product } from "@/store/useProductStore";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import ImagePlaceholder from "../common/ImagePlaceholder";

function AmazingOfferProductCard({ product }: { product: Product }) {
  const imageUrl =
    product.images && product.images.length > 0 ? product.images[0].url : null;

  const hasDiscount =
    product.discount_price && product.discount_price < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.price - product.discount_price!) / product.price) * 100
      )
    : 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      // تغییر پس‌زمینه به سفید یکدست و بهبود سایه
      className="flex flex-col h-full overflow-hidden rounded-lg border bg-white shadow-sm hover:shadow-lg transition-shadow duration-300"
      prefetch={false}
      target="_blank"
    >
      <div className="relative aspect-square w-full overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-101"
          />
        ) : (
          <ImagePlaceholder />
        )}
        {hasDiscount && (
          <Badge
            variant="destructive"
            className="absolute top-2 left-2 text-xs"
          >
            {discountPercentage.toLocaleString("fa-IR")}%
          </Badge>
        )}
      </div>

      {/* کاهش پدینگ برای فشرده‌تر شدن کارت */}
      <div className="flex flex-col flex-grow p-2.5 text-right">
        <p className="text-xs text-gray-500 mb-1">{product.brand?.name}</p>
        <h3
          // اعمال line-clamp برای محدود کردن عنوان به دو خط
          className="font-semibold text-sm text-gray-800 flex-grow mb-2 leading-tight line-clamp-2"
          style={{ minHeight: "2.5rem" }} // تعیین حداقل ارتفاع برای یکسان‌سازی کارت‌ها
        >
          {product.name}
        </h3>

        <div className="mt-auto pt-2">
          {hasDiscount ? (
            <>
              <p className="font-bold text-base text-red-600">
                {product.discount_price?.toLocaleString("fa-IR")}
                <span className="text-xs mr-1">تومان</span>
              </p>
              <p className="text-xs text-gray-400 line-through">
                {product.price.toLocaleString("fa-IR")}
              </p>
            </>
          ) : (
            <p className="font-bold text-base text-gray-800">
              {product.price.toLocaleString("fa-IR")}
              <span className="text-xs mr-1">تومان</span>
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default AmazingOfferProductCard;

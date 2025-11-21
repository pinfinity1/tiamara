// client/src/components/checkout/CartView.tsx
"use client";

import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ImagePlaceholder from "@/components/common/ImagePlaceholder";

export default function CartView() {
  const { items, updateCartItemQuantity, removeFromCart, pendingItemIds } =
    useCartStore();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
          <ShoppingCart className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">
          سبد خرید شما خالی است
        </h2>
        <p className="text-gray-500 max-w-xs mx-auto">
          شما هنوز هیچ محصولی را به سبد خرید خود اضافه نکرده‌اید.
        </p>
        <Button asChild variant="default" size="lg" className="mt-4">
          <Link href="/products">مشاهده محصولات</Link>
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-none shadow-none sm:border sm:shadow-sm">
      <CardHeader className="px-0 sm:px-6">
        <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" />
          لیست سفارشات
          <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {items.length} کالا
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 sm:px-6 divide-y divide-dashed divide-gray-200">
        {items.map((item) => {
          const isPending = pendingItemIds.has(item.id);
          return (
            <div key={item.id} className="flex gap-4 py-6 first:pt-0 last:pb-0">
              {/* تصویر محصول */}
              <Link
                href={`/products/${item.slug}`}
                className="relative h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 overflow-hidden rounded-xl border bg-white"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <ImagePlaceholder />
                )}
              </Link>

              {/* جزئیات */}
              <div className="flex-1 flex flex-col justify-between py-1">
                <div className="space-y-1">
                  <Link href={`/products/${item.slug}`}>
                    <h3 className="font-bold text-sm sm:text-base text-gray-800 hover:text-primary line-clamp-2 leading-relaxed">
                      {item.name}
                    </h3>
                  </Link>
                  {/* اگر ویژگی خاصی مثل رنگ دارید اینجا نمایش دهید */}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
                  {/* کنترل تعداد */}
                  <div className="flex items-center bg-gray-50 border rounded-lg h-9 w-fit">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-full w-9 rounded-r-lg rounded-l-none hover:bg-white hover:text-primary"
                      onClick={() =>
                        updateCartItemQuantity(item.id, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.stock || isPending}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="w-8 text-center font-medium text-sm relative">
                      {isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto text-primary" />
                      ) : (
                        item.quantity
                      )}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-full w-9 rounded-l-lg rounded-r-none hover:bg-white hover:text-red-500"
                      onClick={() => {
                        if (item.quantity === 1) removeFromCart(item.id);
                        else updateCartItemQuantity(item.id, item.quantity - 1);
                      }}
                      disabled={isPending}
                    >
                      {item.quantity === 1 ? (
                        <Trash2 className="h-3.5 w-3.5" />
                      ) : (
                        <Minus className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>

                  {/* قیمت */}
                  <div className="text-left">
                    <p className="text-lg font-bold text-gray-900">
                      {(item.price * item.quantity).toLocaleString("fa-IR")}
                      <span className="text-xs font-normal text-gray-500 mr-1">
                        تومان
                      </span>
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-gray-400">
                        هر عدد: {item.price.toLocaleString("fa-IR")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

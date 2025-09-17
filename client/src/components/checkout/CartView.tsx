"use client";

import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ImagePlaceholder from "../common/ImagePlaceholder";

export default function CartView() {
  const { items, updateCartItemQuantity, removeFromCart } = useCartStore();

  console.log(items);

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-4 text-2xl font-semibold">سبد خرید شما خالی است</h2>
        <p className="mt-2 text-sm text-gray-500">
          به نظر می‌رسد هنوز محصولی به سبد خرید خود اضافه نکرده‌اید.
        </p>
        <Button asChild className="mt-6">
          <Link href="/products">رفتن به فروشگاه</Link>
        </Button>
      </div>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold">سبد خرید شما</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-gray-200">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 py-4">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-md border">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 25vw, 100px"
                  className="object-cover"
                />
              ) : (
                <ImagePlaceholder />
              )}
            </div>

            <div className="flex-1 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                {/* Fixed: Linking to product slug instead of ID */}
                <Link href={`/products/${item.slug}`} passHref>
                  <span className="font-semibold text-sm sm:text-base text-gray-800 hover:text-primary transition-colors cursor-pointer leading-tight">
                    {item.name}
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0 text-red-500 hover:text-red-600"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-600">
                  {item.price.toLocaleString("fa-IR")}
                  <span className="text-xs mr-1">تومان</span>
                </p>

                <div className="flex items-center gap-1 rounded-lg border p-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      updateCartItemQuantity(item.id, item.quantity + 1)
                    }
                    disabled={item.quantity >= item.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-bold text-base">
                    {item.quantity.toLocaleString("fa-IR")}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      updateCartItemQuantity(item.id, item.quantity - 1)
                    }
                    // This button logic is independent of the product name
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

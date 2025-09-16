"use client";

import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CartView() {
  const { items, updateCartItemQuantity, removeFromCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold">سبد خرید شما خالی است</h2>
        <Button asChild className="mt-4">
          <Link href="/products">رفتن به فروشگاه</Link>
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>خلاصه سفارش شما</CardTitle>
      </CardHeader>
      <CardContent className="divide-y">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 py-4">
            <Image
              src={item.image}
              alt={item.name}
              width={80}
              height={80}
              className="rounded-md object-cover border"
            />
            <div className="flex-1">
              <Link href={`/products/${item.productId}`}>
                <h3 className="font-semibold hover:text-primary transition-colors">
                  {item.name}
                </h3>
              </Link>
              <p className="text-sm text-gray-500 mt-1">
                {item.price.toLocaleString("fa-IR")} تومان
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    updateCartItemQuantity(item.id, item.quantity - 1)
                  }
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-bold">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    updateCartItemQuantity(item.id, item.quantity + 1)
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-red-500 hover:text-red-600"
                onClick={() => removeFromCart(item.id)}
              >
                <Trash2 className="h-4 w-4 ml-1" />
                حذف
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

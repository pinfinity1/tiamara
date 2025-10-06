// client/src/components/common/modal/ProductModal.tsx

"use client";

import React from "react";
import Image from "next/image";
import { useProductModalStore } from "@/store/useProductModalStore";
import { useCartStore } from "@/store/useCartStore"; // فرض می‌کنیم استور سبد خرید شما این است
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export const ProductModal = () => {
  const { isOpen, onClose, product } = useProductModalStore();
  const addToCart = useCartStore((state) => state.addToCart);

  if (!product) {
    return null;
  }

  const handleAddToCart = () => {
    // addToCart(product, 1); // تابع افزودن به سبد خرید شما
    toast({
      title: "موفق",
      description: `${product.name} به سبد خرید اضافه شد.`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {product.brand?.name} - {product.name}
          </DialogTitle>
          <DialogDescription>
            جزئیات کامل محصول را در اینجا مشاهده کنید.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="relative h-60 w-full overflow-hidden rounded-lg">
            <Image
              src={product.images?.[0]?.url || "/images/placeholder.png"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="mt-4 flex justify-between items-center">
            <h3 className="text-lg font-bold">
              {product.price.toLocaleString()} تومان
            </h3>
            <Button onClick={handleAddToCart}>افزودن به سبد خرید</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// client/src/components/common/modal/ProductModal.tsx

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useProductModalStore } from "@/store/useProductModalStore";
import { useCartStore } from "@/store/useCartStore";
import { useIsDesktop } from "@/hooks/use-is-desktop";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle as SheetTitleMobile,
  SheetFooter,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ShoppingCart, Eye } from "lucide-react";

export const ProductModal = () => {
  const { isOpen, onClose, product } = useProductModalStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const isDesktop = useIsDesktop();

  if (!product) {
    return null;
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    const itemToAdd = {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.discount_price || product.price,
      quantity: 1,
      image: product.images?.[0]?.url || "/images/placeholder.png",
      stock: product.stock,
    };

    addToCart(itemToAdd);

    toast({
      title: "موفق",
      description: `${product.name} به سبد خرید اضافه شد.`,
      className: "font-vazir",
    });
    onClose();
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="p-0 max-w-4xl font-vazir">
          <DialogTitle className="sr-only">{product.name}</DialogTitle>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* --- اینجا padding اضافه شد --- */}
            <div className="relative aspect-square w-full bg-gray-100 md:rounded-r-lg p-6">
              <Image
                src={product.images?.[0]?.url || "/images/placeholder.png"}
                alt={product.name}
                fill
                className="object-contain"
              />
            </div>

            <div className="flex flex-col p-8">
              {product.brand?.name && (
                <span className="text-sm text-gray-500 mb-1">
                  {product.brand.name}
                </span>
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {product.name}
              </h2>
              <span className="text-2xl font-semibold text-gray-800 mb-6">
                {product.price.toLocaleString("fa")} تومان
              </span>

              <div className="flex-grow"></div>

              <div className="flex flex-row gap-3 w-full">
                <Button onClick={handleAddToCart} size="lg" className="flex-1">
                  <ShoppingCart className="ml-2 size-4" />
                  افزودن به سبد
                </Button>
                <Button asChild variant="outline" size="lg" className="flex-1">
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={handleLinkClick}
                  >
                    <Eye className="ml-2 size-4" />
                    مشاهده جزئیات
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="p-0 font-vazir max-h-[90dvh] overflow-y-auto"
      >
        {/* --- اینجا padding اضافه شد --- */}
        <div className="relative aspect-video w-full bg-gray-100 p-6">
          <Image
            src={product.images?.[0]?.url || "/images/placeholder.png"}
            alt={product.name}
            fill
            className="object-contain"
          />
        </div>

        <div className="p-6">
          <SheetHeader className="text-right mb-4">
            {product.brand?.name && (
              <span className="text-sm text-gray-500">
                {product.brand.name}
              </span>
            )}
            <SheetTitleMobile className="text-2xl font-bold text-gray-900">
              {product.name}
            </SheetTitleMobile>
          </SheetHeader>

          <span className="text-2xl font-semibold text-gray-800 mb-6 block text-right">
            {product.price.toLocaleString("fa")} تومان
          </span>

          <SheetFooter className="flex-col gap-3 w-full pt-6 border-t">
            <Button onClick={handleAddToCart} size="lg" className="w-full">
              <ShoppingCart className="ml-2 size-4" />
              افزودن به سبد
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link
                href={`/products/${product.slug}`}
                onClick={handleLinkClick}
              >
                <Eye className="ml-2 size-4" />
                مشاهده جزئیات
              </Link>
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
};

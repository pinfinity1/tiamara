"use client";

import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart, Trash2, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/store/useProductStore";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  size?: "default" | "sm" | "lg"; // برای استفاده در جاهای مختلف با سایزهای مختلف
}

export default function AddToCartButton({
  product,
  className,
  size = "default",
}: AddToCartButtonProps) {
  const { toast } = useToast();
  // اضافه کردن state داخلی برای هندل کردن لودینگ لحظه‌ای دکمه "افزودن" اولیه
  const [isAdding, setIsAdding] = useState(false);

  const {
    items,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    pendingItemIds,
  } = useCartStore(
    useShallow((state) => ({
      items: state.items,
      addToCart: state.addToCart,
      updateCartItemQuantity: state.updateCartItemQuantity,
      removeFromCart: state.removeFromCart,
      pendingItemIds: state.pendingItemIds, // استفاده از مکانیزم لودینگ استور
    }))
  );

  const itemInCart = items.find((item) => item.productId === product.id);
  const quantityInCart = itemInCart?.quantity || 0;

  // بررسی اینکه آیا این آیتم خاص در حال آپدیت است یا خیر
  const isPending = itemInCart ? pendingItemIds.has(itemInCart.id) : false;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);

    await addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.discount_price || product.price,
      image: product.images?.[0]?.url || "/images/placeholder.png",
      quantity: 1,
      stock: product.stock,
    });

    toast({
      title: "به سبد اضافه شد",
      description: `"${product.name}"`,
      className: "bg-primary text-primary-foreground",
    });

    setIsAdding(false);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (itemInCart && itemInCart.quantity < product.stock) {
      updateCartItemQuantity(itemInCart.id, itemInCart.quantity + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (itemInCart) {
      if (itemInCart.quantity > 1) {
        updateCartItemQuantity(itemInCart.id, itemInCart.quantity - 1);
      } else {
        removeFromCart(itemInCart.id);
        toast({
          title: "حذف شد",
          description: "محصول از سبد خرید حذف شد.",
          variant: "destructive",
        });
      }
    }
  };

  // مدیریت ارتفاع و سایز بر اساس پراپ size
  const heightClass = size === "sm" ? "h-9" : size === "lg" ? "h-12" : "h-11";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const fontSize = size === "sm" ? "text-sm" : "text-base";

  // اگر موجودی ندارد
  if (product.stock === 0) {
    return (
      <Button
        disabled
        variant="secondary"
        className={cn("w-full", heightClass, fontSize, className)}
      >
        ناموجود
      </Button>
    );
  }

  // اگر در سبد خرید است (دکمه‌های کم و زیاد)
  if (quantityInCart > 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-between w-full border border-primary rounded-lg bg-white p-1",
          heightClass,
          className
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="text-primary hover:bg-primary/10 h-full aspect-square"
          onClick={handleIncrement}
          disabled={quantityInCart >= product.stock || isPending}
        >
          <Plus className={iconSize} />
        </Button>

        <span className={cn("font-bold text-center min-w-[2rem]", fontSize)}>
          {isPending ? (
            <Loader2
              className={cn("animate-spin mx-auto text-primary", iconSize)}
            />
          ) : (
            quantityInCart.toLocaleString("fa-IR")
          )}
        </span>

        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:bg-red-50 h-full aspect-square"
          onClick={handleDecrement}
          disabled={isPending}
        >
          {quantityInCart === 1 ? (
            <Trash2 className={iconSize} />
          ) : (
            <Minus className={iconSize} />
          )}
        </Button>
      </div>
    );
  }

  // حالت پیش‌فرض (دکمه افزودن به سبد)
  return (
    <Button
      size={size === "sm" ? "sm" : "lg"}
      className={cn(
        "w-full shadow-md shadow-primary/20 hover:shadow-primary/40 transition-all",
        heightClass,
        fontSize,
        className
      )}
      onClick={handleAddToCart}
      disabled={isAdding}
    >
      {isAdding ? (
        <Loader2 className={cn("animate-spin", iconSize)} />
      ) : (
        <>
          <ShoppingCart className={cn("ml-2", iconSize)} />
          افزودن به سبد خرید
        </>
      )}
    </Button>
  );
}

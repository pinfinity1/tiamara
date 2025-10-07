"use client";

import { Product } from "@/store/useProductStore";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { useShallow } from "zustand/react/shallow";
import WishlistButton from "../common/buttons/WishlistButton";
import ImagePlaceholder from "../common/ImagePlaceholder";

function ProductCard({ product }: { product: Product }) {
  const { toast } = useToast();
  const { items, addToCart, updateCartItemQuantity, removeFromCart } =
    useCartStore(
      useShallow((state) => ({
        items: state.items,
        addToCart: state.addToCart,
        updateCartItemQuantity: state.updateCartItemQuantity,
        removeFromCart: state.removeFromCart,
      }))
    );

  const itemInCart = items.find((item) => item.productId === product.id);
  const quantityInCart = itemInCart?.quantity || 0;

  const imageUrl =
    product.images && product.images.length > 0 ? product.images[0].url : null;

  const hasDiscount =
    product.discount_price && product.discount_price < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.price - product.discount_price!) / product.price) * 100
      )
    : 0;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.discount_price || product.price,
      image: imageUrl || "/images/placeholder.png",
      quantity: 1,
      slug: product.slug,
      stock: product.stock,
    });
    toast({
      title: "محصول به سبد خرید اضافه شد.",
      description: product.name,
    });
  };

  const handleIncrement = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (itemInCart) {
      updateCartItemQuantity(itemInCart.id, itemInCart.quantity + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (itemInCart) {
      if (itemInCart.quantity > 1) {
        updateCartItemQuantity(itemInCart.id, itemInCart.quantity - 1);
      } else {
        removeFromCart(itemInCart.id);
        toast({
          title: "محصول از سبد خرید حذف شد.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="group flex flex-col h-full overflow-hidden rounded-lg border border-gray-200/60 hover:shadow-lg transition-shadow duration-300 bg-white">
      <Link
        href={`/products/${product.slug}`}
        className="block"
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
              className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-[103%]"
            />
          ) : (
            <ImagePlaceholder />
          )}
          {hasDiscount && (
            <Badge
              variant="destructive"
              className="absolute top-2.5 right-2.5 text-sm"
            >
              {discountPercentage.toLocaleString("fa-IR")}%
            </Badge>
          )}
          <div className="absolute top-2 left-2">
            <WishlistButton productId={product.id} productName={product.name} />
          </div>
        </div>
      </Link>

      <div className="flex flex-col flex-grow p-3 text-right">
        {product.brand?.slug ? (
          <Link
            href={`/brands/${product.brand.slug}`}
            className="block"
            prefetch={false}
          >
            <p className="text-xs text-gray-500 mb-1 hover:text-primary transition-colors">
              {product.brand.name}
            </p>
          </Link>
        ) : (
          <p className="text-xs text-gray-500 mb-1">{product.brand?.name}</p>
        )}
        <Link
          href={`/products/${product.slug}`}
          className="block"
          prefetch={false}
        >
          <h3 className="font-semibold text-sm text-gray-800 flex-grow mb-2 leading-tight hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex justify-between items-center mt-auto pt-2">
          <div className="flex flex-col items-start">
            {hasDiscount ? (
              <>
                <p className="font-bold text-base text-red-600">
                  {product.discount_price?.toLocaleString("fa-IR")}
                  <span className="text-xs mr-1">تومان</span>
                </p>
                <p className="text-xs text-gray-400 line-through">
                  {product.price.toLocaleString("fa-IR")}
                  <span className="text-xs mr-1">تومان</span>
                </p>
              </>
            ) : (
              <p className="font-bold text-base text-gray-900">
                {product.price.toLocaleString("fa-IR")}
                <span className="text-xs mr-1">تومان</span>
              </p>
            )}
          </div>

          <div className="flex items-center">
            {quantityInCart === 0 ? (
              <div className="border border-transparent rounded-full ">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleAddToCart}
                  className="rounded-full"
                >
                  <ShoppingCart className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1 border rounded-full">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full border-l"
                  onClick={handleIncrement}
                  disabled={quantityInCart >= product.stock}
                >
                  <Plus className="size-4" />
                </Button>
                <span className="text-sm font-bold w-5 text-center">
                  {quantityInCart}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full border-r"
                  onClick={handleDecrement}
                >
                  {quantityInCart > 1 ? (
                    <Minus className="size-4" />
                  ) : (
                    <Trash2 className="size-4 text-red-500" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;

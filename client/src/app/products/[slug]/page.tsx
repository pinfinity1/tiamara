"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "../../../store/useProductStore";
import { useCartStore } from "../../../store/useCartStore";
import { Button } from "../../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { useToast } from "../../../hooks/use-toast";
import { Badge } from "../../../components/ui/badge";

export default function ProductDetailsClient({
  product,
}: {
  product: Product;
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCartStore();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addToCart({
      // @ts-ignore
      productId: product.id,
      name: product.name,
      price: product.discount_price || product.price,
      image: product.images[0]?.url,
      quantity: quantity,
    });
    toast({
      title: "محصول به سبد خرید اضافه شد.",
    });
  };

  const hasDiscount =
    product.discount_price && product.discount_price < product.price;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          <div>
            <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden mb-4">
              <Image
                src={product.images[selectedImage]?.url || "/placeholder.png"}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="flex gap-2 justify-center">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(index)}
                  className={`w-24 h-24 rounded border-2 overflow-hidden relative ${
                    selectedImage === index
                      ? "border-black"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={`${product.name} - thumbnail ${index + 1}`}
                    fill
                    sizes="100px"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500">{product.brand?.name}</p>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-3">
                {hasDiscount ? (
                  <>
                    <span className="text-2xl font-bold text-red-600">
                      {product.discount_price?.toLocaleString("fa-IR")} تومان
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      {product.price.toLocaleString("fa-IR")} تومان
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold">
                    {product.price.toLocaleString("fa-IR")} تومان
                  </span>
                )}
                {product.stock > 0 ? (
                  <Badge variant="secondary">موجود در انبار</Badge>
                ) : (
                  <Badge variant="destructive">ناموجود</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
              <Button
                className="w-full"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                افزودن به سبد خرید
              </Button>
            </div>

            <div className="prose max-w-none text-gray-600 rtl">
              <p>{product.description}</p>
            </div>

            <Tabs defaultValue="how_to_use">
              <TabsList>
                <TabsTrigger value="how_to_use">نحوه استفاده</TabsTrigger>
                <TabsTrigger value="ingredients">ترکیبات</TabsTrigger>
                <TabsTrigger value="caution">هشدارها</TabsTrigger>
              </TabsList>
              <TabsContent
                value="how_to_use"
                className="pt-4 text-sm text-gray-600"
              >
                {product.how_to_use || "نحوه استفاده مشخص نشده است."}
              </TabsContent>
              <TabsContent
                value="ingredients"
                className="pt-4 text-sm text-gray-600"
              >
                {product.ingredients?.join(", ") || "ترکیبات مشخص نشده است."}
              </TabsContent>
              <TabsContent
                value="caution"
                className="pt-4 text-sm text-gray-600"
              >
                {product.caution || "هشداری ثبت نشده است."}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

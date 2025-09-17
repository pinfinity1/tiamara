"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Minus,
  Plus,
  ShoppingCart,
  CheckCircle,
  ShieldCheck,
  Package,
  Globe,
  FlaskConical,
  Trash2,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { Product } from "@/store/useProductStore";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import WishlistButton from "@/components/common/buttons/WishlistButton";
import ProductCard from "@/components/products/ProductCard";
import ShareButton from "@/components/common/buttons/ShareButton";
import ImagePlaceholder from "@/components/common/ImagePlaceholder";

const FeatureDisplay = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null | string[];
}) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  const displayValue = Array.isArray(value) ? value.join("، ") : value;
  return (
    <div className="flex items-center text-sm text-gray-600">
      <Icon className="h-5 w-5 ml-2 text-gray-400 flex-shrink-0" />
      <span className="font-semibold">{label}:</span>
      <span className="mr-2">{displayValue}</span>
    </div>
  );
};

export default function ProductDetailsClient({
  product,
  relatedProducts,
}: {
  product: Product | null;
  relatedProducts: Product[];
}) {
  if (!product) {
    notFound();
  }

  const [selectedImage, setSelectedImage] = useState(0);
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

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.discount_price || product.price,
      image: product.images[0]?.url || "/images/placeholder.png",
      quantity: 1,
      stock: product.stock,
    });
    toast({
      title: "محصول به سبد خرید اضافه شد",
      description: `"${product.name}"`,
    });
  };

  const handleIncrement = () => {
    if (itemInCart) {
      updateCartItemQuantity(itemInCart.id, itemInCart.quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (itemInCart) {
      if (itemInCart.quantity > 1) {
        updateCartItemQuantity(itemInCart.id, itemInCart.quantity - 1);
      } else {
        removeFromCart(itemInCart.id);
        toast({
          title: "محصول از سبد خرید حذف شد",
          variant: "destructive",
        });
      }
    }
  };

  const hasDiscount =
    product.discount_price && product.discount_price < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.price - product.discount_price!) / product.price) * 100
      )
    : 0;

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <div>
              <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden mb-4 border">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImage]?.url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                    priority
                  />
                ) : (
                  <ImagePlaceholder />
                )}
                {hasDiscount && (
                  <Badge
                    variant="destructive"
                    className="absolute top-3 left-3 text-base"
                  >
                    {discountPercentage.toLocaleString("fa-IR")}%
                  </Badge>
                )}
              </div>
              <div className="flex gap-2 justify-center">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 md:w-24 md:h-24 rounded-md border-2 overflow-hidden relative transition-all duration-200 ${
                      selectedImage === index
                        ? "border-primary shadow-md"
                        : "border-gray-200 hover:border-primary/50"
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
                {product.brand?.slug ? (
                  <Link
                    href={`/brands/${product.brand.slug}`}
                    className="text-base text-gray-500 hover:text-primary transition-colors mb-1 inline-block"
                  >
                    {product.brand.name}
                  </Link>
                ) : (
                  <p className="text-base text-gray-500 mb-1">
                    {product.brand?.name}
                  </p>
                )}
                <h1 className="text-3xl lg:text-4xl font-bold mb-3">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4">
                  {hasDiscount ? (
                    <>
                      <span className="text-3xl font-bold text-red-600">
                        {product.discount_price?.toLocaleString("fa-IR")}
                        <span className="text-lg mr-1">تومان</span>
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        {product.price.toLocaleString("fa-IR")}
                        <span className="text-sm mr-1">تومان</span>
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold">
                      {product.price.toLocaleString("fa-IR")}
                      <span className="text-lg mr-1">تومان</span>
                    </span>
                  )}
                  {product.stock > 0 ? (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      <CheckCircle className="h-4 w-4 ml-1" />
                      موجود در انبار
                    </Badge>
                  ) : (
                    <Badge variant="destructive">ناموجود</Badge>
                  )}
                </div>
              </div>

              <div className="w-full flex items-center justify-between gap-2 pt-2">
                <div className="flex items-center border rounded-lg p-0.5">
                  <WishlistButton
                    productId={product.id}
                    productName={product.name}
                  />
                  <ShareButton
                    productName={product.name}
                    productSlug={product.slug}
                  />
                </div>
                {quantityInCart === 0 ? (
                  <Button
                    className="w-fit h-12 text-base"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="h-5 w-5 ml-2" />
                    افزودن به سبد خرید
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm">تعداد در سبد:</p>
                    <div className="flex items-center border rounded-lg">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12"
                        onClick={handleDecrement}
                      >
                        {quantityInCart > 1 ? (
                          <Minus className="h-5 w-5" />
                        ) : (
                          <Trash2 className="h-5 w-5 text-red-500" />
                        )}
                      </Button>
                      <span className="w-16 text-center text-lg font-bold">
                        {quantityInCart.toLocaleString("fa-IR")}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12"
                        onClick={handleIncrement}
                        disabled={quantityInCart >= product.stock}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t">
                <FeatureDisplay
                  icon={ShieldCheck}
                  label="مناسب پوست"
                  value={product.skin_type}
                />
                <FeatureDisplay
                  icon={CheckCircle}
                  label="موثر برای"
                  value={product.concern}
                />
                <FeatureDisplay
                  icon={Package}
                  label="حجم/وزن"
                  value={
                    product.volume
                      ? `${product.volume.toLocaleString("fa-IR")} ${
                          product.unit
                        }`
                      : null
                  }
                />
                <FeatureDisplay
                  icon={Globe}
                  label="کشور سازنده"
                  value={product.country_of_origin}
                />
                <FeatureDisplay
                  icon={FlaskConical}
                  label="شکل محصول"
                  value={product.product_form}
                />
              </div>

              <div className="pt-2">
                <Tabs defaultValue="description">
                  <TabsList className="w-full grid grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="description">توضیحات</TabsTrigger>
                    <TabsTrigger value="how_to_use">نحوه استفاده</TabsTrigger>
                    <TabsTrigger value="ingredients">ترکیبات</TabsTrigger>
                    <TabsTrigger value="caution">هشدارها</TabsTrigger>
                  </TabsList>
                  <TabsContent
                    value="description"
                    className="pt-4 text-base text-gray-700 leading-relaxed prose max-w-none rtl"
                  >
                    {product.description ||
                      "توضیحاتی برای این محصول ثبت نشده است."}
                  </TabsContent>
                  <TabsContent
                    value="how_to_use"
                    className="pt-4 text-base text-gray-700 leading-relaxed"
                  >
                    {product.how_to_use || "نحوه استفاده مشخص نشده است."}
                  </TabsContent>
                  <TabsContent
                    value="ingredients"
                    className="pt-4 text-base text-gray-700"
                  >
                    {product.ingredients?.join("، ") ||
                      "ترکیبات مشخص نشده است."}
                  </TabsContent>
                  <TabsContent
                    value="caution"
                    className="pt-4 text-base text-gray-700"
                  >
                    {product.caution || "هشداری ثبت نشده است."}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="bg-gray-50/70 py-12 lg:py-16">
          <section className="container mx-auto px-4">
            <h2 className="text-center text-2xl lg:text-3xl font-bold mb-8 text-gray-900">
              محصولات مرتبط
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

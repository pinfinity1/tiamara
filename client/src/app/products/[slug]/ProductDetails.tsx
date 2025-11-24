"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  ShieldCheck,
  Package,
  Globe,
  FlaskConical,
  AlertTriangle,
  Info,
  Sparkles,
  Truck,
  RefreshCcw,
} from "lucide-react";

// Stores
import { Product } from "@/store/useProductStore";
import { useUserStore } from "@/store/useUserStore";

// Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import WishlistButton from "@/components/common/buttons/WishlistButton";
import ProductCard from "@/components/products/ProductCard";
import ShareButton from "@/components/common/buttons/ShareButton";
import ImagePlaceholder from "@/components/common/ImagePlaceholder";
import AddToCartButton from "@/components/common/buttons/AddToCartButton";
import Script from "next/script";
import { cn } from "@/lib/utils";

// --- کامپوننت نمایش ویژگی‌های کلیدی ---
const FeatureItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null | number;
}) => {
  if (!value) return null;
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl text-center space-y-2 hover:bg-gray-100 transition-colors">
      <div className="p-2 bg-white rounded-full shadow-sm">
        <Icon className="h-5 w-5 text-gray-600" />
      </div>
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-800 line-clamp-1">
        {value}
      </span>
    </div>
  );
};

// --- کامپوننت اسکیما برای سئو ---
function JsonLd({ product }: { product: Product }) {
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    alternateName: product.englishName, // ✅ افزودن نام انگلیسی به اسکیما
    image: product.images.map((img) => img.url),
    description: product.metaDescription || product.description,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand?.name,
    },
    offers: {
      "@type": "Offer",
      url: `https://www.tiamara.ir/products/${product.slug}`,
      priceCurrency: "IRR",
      price: (product.discount_price || product.price) * 10,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <Script
      id="product-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
    />
  );
}

// --- کامپوننت اصلی ---
export default function ProductDetails({
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
  const { userProfile } = useUserStore();

  const hasDiscount =
    product.discount_price && product.discount_price < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.price - product.discount_price!) / product.price) * 100
      )
    : 0;

  // --- منطق تطبیق هوشمند پوست ---
  let skinMatchStatus: "match" | "warning" | "neutral" | "unknown" = "unknown";
  let skinMatchMessage = "";

  if (userProfile?.skinType) {
    if (
      product.skin_type &&
      product.skin_type.length > 0 &&
      userProfile.skinType
    ) {
      const isCompatible = product.skin_type.some((t) =>
        t.includes(userProfile.skinType!)
      );
      if (isCompatible) {
        skinMatchStatus = "match";
        skinMatchMessage = `عالی! این محصول مناسب پوست ${userProfile.skinType} شماست.`;
      } else {
        skinMatchStatus = "warning";
        skinMatchMessage = `توجه: این محصول برای پوست‌های ${product.skin_type.join(
          "، "
        )} طراحی شده، اما پوست شما ${userProfile.skinType} است.`;
      }
    } else {
      skinMatchStatus = "neutral";
    }
  } else {
    skinMatchStatus = "unknown";
  }

  return (
    <>
      <JsonLd product={product} />

      <div className="min-h-screen bg-white pb-24 lg:pb-12">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div
            className="text-sm text-gray-500 mb-6 flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-2"
            dir="rtl"
          >
            <Link href="/" className="hover:text-primary">
              خانه
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-primary">
              محصولات
            </Link>
            <span>/</span>
            {product.category && (
              <>
                <Link
                  href={`/categories/${product.category.slug}`}
                  className="hover:text-primary"
                >
                  {product.category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* --- ستون راست: گالری تصاویر --- */}
            <div className="lg:col-span-5">
              <div className="sticky top-4 space-y-4">
                <div className="aspect-square relative bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[selectedImage]?.url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[102%]"
                      priority
                    />
                  ) : (
                    <ImagePlaceholder />
                  )}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {hasDiscount && (
                      <Badge
                        variant="destructive"
                        className="text-sm px-3 py-1 shadow-sm"
                      >
                        {discountPercentage.toLocaleString("fa-IR")}%
                      </Badge>
                    )}
                    {product.stock <= 5 && product.stock > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-white/90 text-amber-600 border-amber-200 shadow-sm"
                      >
                        فقط {product.stock} عدد مانده
                      </Badge>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 flex flex-col gap-2 lg:hidden">
                    <WishlistButton
                      productId={product.id}
                      productName={product.name}
                    />
                    <ShareButton
                      productName={product.name}
                      productSlug={product.slug}
                    />
                  </div>
                </div>

                {product.images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center lg:justify-start">
                    {product.images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImage(index)}
                        className={cn(
                          "relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0",
                          selectedImage === index
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-transparent hover:border-gray-300"
                        )}
                      >
                        <Image
                          src={image.url}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* --- ستون چپ: اطلاعات محصول --- */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {product.brand && (
                    <Link
                      href={`/brands/${product.brand.slug}`}
                      className="text-primary font-semibold hover:underline text-sm bg-primary/5 px-3 py-1 rounded-full flex items-center gap-1"
                    >
                      <span>{product.brand.name}</span>

                      {product.brand.englishName && (
                        <>
                          <span className="text-gray-300">|</span>
                          <span className="font-sans text-xs font-medium pt-0.5">
                            {product.brand.englishName}
                          </span>
                        </>
                      )}
                    </Link>
                  )}

                  <div className="hidden lg:flex items-center gap-1">
                    <WishlistButton
                      productId={product.id}
                      productName={product.name}
                    />
                    <ShareButton
                      productName={product.name}
                      productSlug={product.slug}
                    />
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                    {product.name}
                  </h1>
                  {/* ✅ نمایش نام انگلیسی محصول */}
                  {product.englishName && (
                    <h2 className="text-xl md:text-2xl text-gray-500 font-medium dir-ltr font-sans">
                      {product.englishName}
                    </h2>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  {product.skin_type?.map((type) => (
                    <Badge
                      key={type}
                      variant="secondary"
                      className="text-xs font-normal"
                    >
                      پوست {type}
                    </Badge>
                  ))}
                  {product.concern?.map((c) => (
                    <Badge
                      key={c}
                      variant="outline"
                      className="text-xs font-normal border-gray-300 text-gray-600"
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* --- باکس هوشمند تطبیق پوست --- */}
              {skinMatchStatus !== "unknown" && (
                <div
                  className={cn(
                    "rounded-xl p-4 border flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2",
                    skinMatchStatus === "match"
                      ? "bg-green-50 border-green-200"
                      : skinMatchStatus === "warning"
                      ? "bg-amber-50 border-amber-200"
                      : "bg-gray-50 border-gray-200"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-full shrink-0",
                      skinMatchStatus === "match"
                        ? "bg-green-100 text-green-600"
                        : skinMatchStatus === "warning"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-gray-200 text-gray-500"
                    )}
                  >
                    {skinMatchStatus === "match" ? (
                      <Sparkles className="w-5 h-5" />
                    ) : skinMatchStatus === "warning" ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-right">
                    <h4
                      className={cn(
                        "font-bold text-sm mb-1",
                        skinMatchStatus === "match"
                          ? "text-green-800"
                          : skinMatchStatus === "warning"
                          ? "text-amber-800"
                          : "text-gray-700"
                      )}
                    >
                      آنالیز هوشمند پوست شما
                    </h4>
                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                      {skinMatchMessage ||
                        "برای مشاهده تطابق، لطفا اطلاعات پروفایل پوستی خود را تکمیل کنید."}
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              {/* --- کانتینر قیمت و خدمات (دسکتاپ) --- */}
              <div className="hidden lg:flex flex-row items-stretch gap-4 w-full">
                {/* 1. باکس قیمت و دکمه خرید */}
                <div className="flex-1 flex flex-col gap-5 bg-white p-5 rounded-xl border border-gray-200 shadow-sm max-w-[24rem]">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium text-sm">
                      قیمت مصرف کننده:
                    </span>
                    <div className="text-left">
                      {hasDiscount ? (
                        <div className="flex flex-col items-end">
                          <span className="text-gray-400 line-through text-xs">
                            {product.price.toLocaleString("fa-IR")}
                          </span>
                          <div className="flex items-center gap-2 text-red-600">
                            <span className="text-2xl font-bold">
                              {product.discount_price?.toLocaleString("fa-IR")}
                            </span>
                            <span className="text-sm font-medium">تومان</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-900">
                          <span className="text-2xl font-bold">
                            {product.price.toLocaleString("fa-IR")}
                          </span>
                          <span className="text-sm font-medium">تومان</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* استفاده از کامپوننت جدید */}
                  <div className="mt-auto">
                    <AddToCartButton product={product} size="lg" />
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-md border border-dashed border-gray-200">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    <span>تضمین اصالت و سلامت فیزیکی کالا</span>
                  </div>
                </div>

                {/* 2. باکس خدمات */}
                <div className="flex-1 bg-gray-50 rounded-xl border border-gray-100 p-5 flex flex-col justify-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm text-primary">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">
                        ارسال سریع
                      </p>
                      <p className="text-xs text-gray-500">
                        تحویل در کوتاه‌ترین زمان ممکن
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm text-primary">
                      <RefreshCcw className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">
                        ۷ روز ضمانت بازگشت
                      </p>
                      <p className="text-xs text-gray-500">
                        در صورت عدم رضایت یا خرابی
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm text-primary">
                      <Info className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">
                        مشاوره تخصصی رایگان
                      </p>
                      <p className="text-xs text-gray-500">
                        پاسخگویی به تمام سوالات شما
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ویژگی‌های کلیدی (Grid) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <FeatureItem
                  icon={Globe}
                  label="کشور سازنده"
                  value={product.country_of_origin}
                />
                <FeatureItem
                  icon={Package}
                  label="حجم / وزن"
                  value={
                    product.volume ? `${product.volume} ${product.unit}` : null
                  }
                />
                <FeatureItem
                  icon={FlaskConical}
                  label="شکل محصول"
                  value={product.product_form}
                />
                <FeatureItem
                  icon={CheckCircle2}
                  label="مناسب برای"
                  value={product.skin_type?.[0] || "انواع پوست"}
                />
              </div>

              {/* تب‌های توضیحات بهبود یافته */}
              <div className="mt-16">
                <Tabs defaultValue="description" className="w-full" dir="rtl">
                  {/* --- اصلاح ۱: استایل جدید برای لیست تب‌ها --- */}
                  <div className="border-b border-gray-200 mb-8">
                    <TabsList className="w-full flex justify-start bg-transparent p-0 gap-8 overflow-x-auto scrollbar-hide h-auto rounded-none">
                      <TabsTrigger
                        value="description"
                        className="relative pb-4 text-base font-medium text-gray-500 transition-colors hover:text-primary 
                        data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-none bg-transparent
                        after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-primary after:scale-x-0 after:transition-transform after:duration-300 
                        data-[state=active]:after:scale-x-100 rounded-none"
                      >
                        توضیحات کامل
                      </TabsTrigger>
                      <TabsTrigger
                        value="ingredients"
                        className="relative pb-4 text-base font-medium text-gray-500 transition-colors hover:text-primary 
                        data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-none bg-transparent
                        after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-primary after:scale-x-0 after:transition-transform after:duration-300 
                        data-[state=active]:after:scale-x-100 rounded-none"
                      >
                        ترکیبات
                      </TabsTrigger>
                      <TabsTrigger
                        value="how_to_use"
                        className="relative pb-4 text-base font-medium text-gray-500 transition-colors hover:text-primary 
                        data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-none bg-transparent
                        after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-primary after:scale-x-0 after:transition-transform after:duration-300 
                        data-[state=active]:after:scale-x-100 rounded-none"
                      >
                        نحوه استفاده
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* --- اصلاح ۲: اضافه کردن min-h-[400px] برای جلوگیری از پرش صفحه --- */}
                  <div className="min-h-[400px]">
                    <TabsContent
                      value="description"
                      className="text-gray-700 leading-8 text-justify prose max-w-none animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                      <p>{product.description || "توضیحاتی ثبت نشده است."}</p>
                    </TabsContent>

                    <TabsContent
                      value="ingredients"
                      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                      {product.ingredients && product.ingredients.length > 0 ? (
                        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FlaskConical className="w-5 h-5 text-primary" />
                            مواد تشکیل دهنده:
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {product.ingredients.map((ing, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1.5 bg-white text-gray-700 rounded-lg text-sm border border-gray-200 shadow-sm"
                              >
                                {ing}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          اطلاعات ترکیبات ثبت نشده است.
                        </p>
                      )}
                    </TabsContent>

                    <TabsContent
                      value="how_to_use"
                      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-5 h-5 text-blue-600" />
                            <h4 className="font-bold text-gray-900">
                              راهنمای مصرف:
                            </h4>
                          </div>
                          <p className="text-gray-700 leading-loose">
                            {product.how_to_use ||
                              "دستور مصرف خاصی ثبت نشده است."}
                          </p>
                        </div>

                        {product.caution && (
                          <div className="bg-amber-50/30 p-6 rounded-2xl border border-amber-100">
                            <div className="flex items-center gap-2 mb-3">
                              <AlertTriangle className="w-5 h-5 text-amber-600" />
                              <h4 className="font-bold text-gray-900">
                                هشدارها:
                              </h4>
                            </div>
                            <p className="text-gray-700 leading-loose">
                              {product.caution}
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Sticky Bottom Bar برای موبایل --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 px-4 lg:hidden z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe safe-area-bottom">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                <span className="text-xs text-gray-400 line-through text-right">
                  {product.price.toLocaleString("fa-IR")}
                </span>
                <div className="flex items-center gap-1 text-red-600">
                  <span className="font-bold text-lg">
                    {product.discount_price?.toLocaleString("fa-IR")}
                  </span>
                  <span className="text-xs">تومان</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1 text-gray-900">
                <span className="font-bold text-lg">
                  {product.price.toLocaleString("fa-IR")}
                </span>
                <span className="text-xs">تومان</span>
              </div>
            )}
          </div>

          {/* استفاده از کامپوننت جدید برای موبایل */}
          <div className="flex-1 max-w-[180px]">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>

      {/* محصولات مرتبط */}
      {relatedProducts.length > 0 && (
        <div className="bg-gray-50 py-12 border-t">
          <div className="container mx-auto px-4">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-8 text-center">
              محصولات مشابه
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

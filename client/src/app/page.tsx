"use client";

import HomeBannerCarousel from "@/components/layout/home/HomeBannerCarousel";
import { Button } from "@/components/ui/button";
import { useHomepageStore } from "@/store/useHomepageStore";
import { Product } from "@/store/useProductStore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function ProductCard({ product }: { product: Product }) {
  const router = useRouter();

  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0].url
      : "/placeholder.png";

  return (
    <div
      onClick={() => router.push(`/products/${product.slug}`)}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[3/4] mb-3 bg-gray-100 overflow-hidden rounded-lg">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button className="bg-white text-black hover:bg-gray-100">
            مشاهده محصول
          </Button>
        </div>
      </div>
      <h3 className="font-semibold text-sm text-gray-800">{product.name}</h3>
      <p className="text-xs text-gray-500">{product.brand?.name}</p>
      <p className="font-bold mt-1 text-gray-900">
        {product.price.toLocaleString("fa-IR")} تومان
      </p>
    </div>
  );
}

function HomePage() {
  const { sections, fetchSections } = useHomepageStore();

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  return (
    <div className="min-h-screen bg-white">
      <HomeBannerCarousel />

      <div className="py-12 lg:py-16 space-y-12 lg:space-y-16">
        {sections &&
          sections.map((section) => (
            <section key={section.id} className="container mx-auto px-4">
              <h2 className="text-center text-2xl lg:text-3xl font-bold mb-2 text-gray-900">
                {section.title}
              </h2>
              <p className="text-center text-gray-500 mb-8">
                جدیدترین محصولات در این بخش
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                {section.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}

export default HomePage;

"use client";

import HomeBannerCarousel from "@/components/layout/home/HomeBannerCarousel";
import ProductCard from "@/components/products/ProductCard";
import { ProductCardSkeleton } from "@/components/products/ProductCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

import { useHomepageStore } from "@/store/useHomepageStore";
import { useEffect } from "react";

function HomePage() {
  const { sections, fetchSections, isLoading } = useHomepageStore();

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  return (
    <div className="min-h-screen bg-white">
      <HomeBannerCarousel />

      <div className="py-12 lg:py-16 space-y-12 lg:space-y-16">
        {isLoading && (!sections || sections.length === 0) && (
          // نمایش اسکلتون در هنگام بارگذاری اولیه داده‌ها
          <section className="container mx-auto px-4">
            <div className="text-center mb-10">
              <Skeleton className="h-8 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {Array.from({ length: 8 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          </section>
        )}

        {!isLoading &&
          sections &&
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

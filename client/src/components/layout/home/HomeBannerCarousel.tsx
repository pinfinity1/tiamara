"use client";

import React from "react";
import { FeatureBanner, useHomepageStore } from "@/store/useHomepageStore";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { BaseCarousel } from "@/components/user/BaseCarousel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HomeBannerCarouselProps {
  banners: FeatureBanner[];
}

const HomeBannerCarousel: React.FC<HomeBannerCarouselProps> = ({ banners }) => {
  const { trackClick } = useHomepageStore();

  const handleBannerClick = (bannerId: string) => {
    trackClick(bannerId);
  };

  if (!banners || banners.length === 0) {
    return <Skeleton className="w-full h-[280px] md:h-[420px]" />;
  }

  return (
    <BaseCarousel className="h-[280px] md:h-[420px]">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className="relative w-full h-full group overflow-hidden"
        >
          {/* لینک کل بنر */}
          <Link
            href={banner.linkUrl || "#"}
            className="absolute inset-0 z-10"
            onClick={() => handleBannerClick(banner.id)}
            aria-label={banner.altText || "Banner"}
          >
            <span className="sr-only">{banner.title}</span>
          </Link>

          {/* تصویر دسکتاپ */}
          <div className="hidden md:block absolute inset-0 w-full h-full">
            <Image
              src={banner.imageUrl}
              alt={banner.altText || "Banner Desktop"}
              fill
              className="object-cover w-full h-full"
              priority={index === 0}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-white/40 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* تصویر موبایل */}
          <div className="block md:hidden absolute inset-0 w-full h-full">
            <Image
              src={banner.imageUrlMobile || banner.imageUrl}
              alt={banner.altText || "Banner Mobile"}
              fill
              className="object-cover w-full h-full"
              priority={index === 0}
              sizes="100vw"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          </div>

          {/* محتوا (متن و دکمه) */}
          <div className="absolute inset-0 z-20 flex flex-col justify-end md:justify-center px-6 pb-6 md:pb-0 md:pr-20 pointer-events-none">
            <div
              className={cn(
                "space-y-2 md:space-y-4 transition-all duration-500",
                // استایل موبایل
                "w-full mx-auto text-center md:text-right md:mx-0 md:w-auto md:max-w-[45%]",
                // رنگ متن
                "text-white md:text-[var(--text-color)]"
              )}
              style={
                {
                  "--text-color": banner.textColor || "#000000",
                } as React.CSSProperties
              }
            >
              {/* تیتر */}
              {banner.title && (
                <h2 className="text-lg md:text-4xl font-extrabold drop-shadow-md md:drop-shadow-none leading-tight">
                  {banner.title}
                </h2>
              )}

              {/* توضیحات */}
              {banner.description && (
                <p className="hidden md:block text-sm md:text-lg font-medium opacity-90 line-clamp-2">
                  {banner.description}
                </p>
              )}

              {/* دکمه */}
              {banner.buttonText && (
                <div className="pt-1 md:pt-2 flex justify-center md:justify-start">
                  <Button
                    size="sm"
                    className={cn(
                      "pointer-events-auto font-bold px-6 rounded-full shadow-lg h-8 md:h-11 text-xs md:text-sm transition-transform active:scale-95 border-none",

                      // --- استایل موبایل (همیشه ثابت و خوانا) ---
                      "bg-white text-black hover:bg-gray-200 hover:text-black",

                      // --- استایل دسکتاپ (بر اساس رنگ متن انتخابی) ---
                      // اگر متن بنر سفید است -> دکمه سفید، متن دکمه مشکی
                      banner.textColor === "#ffffff"
                        ? "md:bg-white md:text-black md:hover:bg-gray-200 md:hover:text-black"
                        : // اگر متن بنر مشکی است -> دکمه مشکی، متن دکمه سفید (هاور: نوک مدادی)
                          "md:bg-black md:text-white md:hover:bg-zinc-800 md:hover:text-white"
                    )}
                    asChild
                  >
                    <Link
                      href={banner.linkUrl || "#"}
                      onClick={() => handleBannerClick(banner.id)}
                    >
                      {banner.buttonText}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </BaseCarousel>
  );
};

export default HomeBannerCarousel;

"use client";

import React, { useEffect } from "react";
import { useHomepageStore } from "@/store/useHomepageStore";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { BaseCarousel } from "@/components/user/BaseCarousel";

interface HomeBannerCarouselProps {
  group: string;
}

const HomeBannerCarousel: React.FC<HomeBannerCarouselProps> = ({ group }) => {
  const { clientBanners, isLoading, fetchBannersForClient, trackClick } =
    useHomepageStore();

  useEffect(() => {
    if (group) {
      fetchBannersForClient(group);
    }
  }, [group, fetchBannersForClient]);

  const handleBannerClick = (bannerId: string) => {
    trackClick(bannerId);
  };

  if (isLoading) {
    return <Skeleton className="w-full h-[280px] lg:h-[420px] rounded-lg" />;
  }

  if (!clientBanners || clientBanners.length === 0) {
    return null;
  }

  return (
    <BaseCarousel>
      {clientBanners.map((banner, index) => (
        <Link
          key={banner.id}
          href={banner.linkUrl || "#"}
          className="h-full w-full block relative"
          onClick={() => handleBannerClick(banner.id)}
        >
          <picture className="w-full h-full">
            {banner.imageUrlMobile && (
              <source
                media="(max-width: 768px)"
                srcSet={banner.imageUrlMobile}
              />
            )}
            <source media="(min-width: 769px)" srcSet={banner.imageUrl} />
            <Image
              src={banner.imageUrl}
              alt={banner.altText || "Tiamara Banner"}
              fill
              className="w-full h-full object-cover"
              priority={index === 0}
            />
          </picture>
        </Link>
      ))}
    </BaseCarousel>
  );
};

export default HomeBannerCarousel;

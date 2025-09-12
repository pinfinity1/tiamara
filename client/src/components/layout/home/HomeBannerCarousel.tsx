"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { FeatureBanner } from "@/store/useHomepageStore";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function HomeBannerCarousel({ banners }: { banners: FeatureBanner[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      direction: "rtl",
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onDotButtonClick = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const activeBanners = banners.filter((b) => b.isActive);

  if (!activeBanners || activeBanners.length === 0) {
    return null;
  }

  return (
    <section className="group home-banner-carousel h-[280px] lg:h-[420px] w-full overflow-hidden relative">
      <div className="embla w-full h-full">
        <div className="embla__viewport" ref={emblaRef}>
          <div className="embla__container">
            {activeBanners.map((banner) => (
              <div className="embla__slide" key={banner.id}>
                <Link
                  href={banner.linkUrl || "#"}
                  className="h-full w-full block relative"
                >
                  <Image
                    src={banner.imageUrl}
                    alt={banner.altText || "Tiamara Banner"}
                    fill
                    className="w-full h-full object-cover"
                    priority={banner.order === 0}
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>
        <div className="embla__dots absolute left-1/2 -translate-x-1/2 bottom-2 w-fit bg-black/15 backdrop-blur-xl px-2 py-1 rounded-full">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={`embla__dot ${
                index === selectedIndex ? "embla__dot--selected" : ""
              }`}
            />
          ))}
        </div>
      </div>
      <div className="hidden lg:flex gap-2 absolute bottom-6 right-10 z-10 opacity-0 bg-black/15 backdrop-blur-xl p-1 rounded-full group-hover:opacity-100 transition-opacity duration-300">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full h-10 w-10"
          onClick={scrollPrev}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full h-10 w-10"
          onClick={scrollNext}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
    </section>
  );
}

export default HomeBannerCarousel;

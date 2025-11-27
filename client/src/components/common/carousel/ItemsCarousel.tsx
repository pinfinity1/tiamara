"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type PropType = {
  children: React.ReactNode;
};

const ItemsCarousel: React.FC<PropType> = ({ children }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    direction: "rtl",
    loop: false,
    align: "center",
    containScroll: "trimSnaps",
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full h-full group/carousel">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full md:-mr-2 touch-pan-y">
          {React.Children.map(children, (child, index) => (
            <div
              className={`embla__slide 
              h-full flex-shrink-0 
              w-[75%] sm:w-[240px] md:w-[256px] 
              pl-2 ${index === 0 ? "first-slide-conditional" : ""}`}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* دکمه راست (قبلی) */}
      <Button
        variant="secondary"
        size="icon"
        className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-1 rounded-full shadow-md bg-white/90 hover:bg-white z-30 transition-opacity duration-300 disabled:opacity-0"
        onClick={scrollPrev}
        disabled={!canScrollPrev}
      >
        <ChevronRight className="h-5 w-5 text-gray-700" />
      </Button>

      {/* دکمه چپ (بعدی) */}
      <Button
        variant="secondary"
        size="icon"
        className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-1 rounded-full shadow-md bg-white/90 hover:bg-white z-30 transition-opacity duration-300  disabled:opacity-0"
        onClick={scrollNext}
        disabled={!canScrollNext} // اگر اسکرول به چپ ممکن نباشد، غیرفعال می‌شود
      >
        <ChevronLeft className="h-5 w-5 text-gray-700" />
      </Button>
    </div>
  );
};

export default ItemsCarousel;

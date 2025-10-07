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
    align: "start",
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
    <div className="relative w-full h-full">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full md:-mr-2">
          {React.Children.map(children, (child, index) => (
            <div
              // ✅ تغییر کلیدی: اضافه کردن کلاس شرطی به اولین اسلاید
              className={`embla__slide p-1 h-full flex-shrink-0 w-[256px] ${
                index === 0 ? "first-slide-conditional" : ""
              }`}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="secondary"
        size="icon"
        className="absolute top-1/2 -translate-y-1/2 -right-2 rounded-full shadow-gray-400 z-10 transition-opacity duration-300 disabled:opacity-0"
        onClick={scrollPrev}
        disabled={!canScrollPrev}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className="absolute top-1/2 -translate-y-1/2 -left-2 rounded-full shadow-gray-400 z-10 transition-opacity duration-300 disabled:opacity-0"
        onClick={scrollNext}
        disabled={!canScrollNext}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ItemsCarousel;

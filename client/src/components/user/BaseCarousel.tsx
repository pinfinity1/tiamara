"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel, { EmblaCarouselType } from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BaseCarouselProps {
  children: React.ReactNode;
  options?: Parameters<typeof useEmblaCarousel>[0];
  autoplayDelay?: number;
  showArrows?: boolean;
  showDots?: boolean;
  className?: string;
}

export const BaseCarousel: React.FC<BaseCarouselProps> = ({
  children,
  options = { loop: true, direction: "rtl" },
  autoplayDelay = 5000,
  showArrows = true,
  showDots = true,
  className = "h-[280px] lg:h-[420px]", // Default height
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [
    Autoplay({ delay: autoplayDelay, stopOnInteraction: false }),
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const onDotButtonClick = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback((api: EmblaCarouselType) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect).on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const slideCount = React.Children.count(children);

  return (
    <section
      className={`group home-banner-carousel w-full overflow-hidden relative ${className}`}
    >
      <div className="embla w-full h-full">
        <div className="embla__viewport" ref={emblaRef}>
          <div className="embla__container">
            {React.Children.map(children, (child, index) => (
              <div className="embla__slide" key={index}>
                {child}
              </div>
            ))}
          </div>
        </div>

        {showDots && slideCount > 1 && (
          <div className="embla__dots absolute left-1/2 -translate-x-1/2 bottom-2 w-fit bg-black/15 backdrop-blur-xl px-2 py-1 rounded-full">
            {Array.from({ length: slideCount }).map((_, index) => (
              <button
                key={index}
                onClick={() => onDotButtonClick(index)}
                className={`embla__dot ${
                  index === selectedIndex ? "embla__dot--selected" : ""
                }`}
              />
            ))}
          </div>
        )}
      </div>
      {showArrows && slideCount > 1 && (
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
      )}
    </section>
  );
};

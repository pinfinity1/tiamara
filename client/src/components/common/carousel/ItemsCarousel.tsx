"use client";

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import ProductCard from "@/components/products/ProductCard";
import { Product } from "@/store/useProductStore";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PropType = {
  products: Product[];
};

const ItemsCarousel: React.FC<PropType> = ({ products }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    direction: "rtl",
    loop: false, // لوپ غیرفعال است
    align: "start",
  });

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  return (
    // این کانتینر اصلی، دکمه‌ها را نسبت به خودش موقعیت‌دهی می‌کند
    <div className="relative w-full h-full">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {products.map((product) => (
            <div
              key={product.id}
              className="embla__slide basis-1/2 sm:basis-1/3 lg:basis-1/4 p-2 h-full flex-shrink-0"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* دکمه‌های ناوبری با استایل و جایگاه اختصاصی که بیرون کادر اسلایدها هستند */}
      <button
        className="absolute top-1/2 -translate-y-1/2 -right-4 bg-white/90 hover:bg-white rounded-full p-2 z-10 shadow-lg transition-opacity disabled:opacity-30"
        onClick={scrollPrev}
        disabled={!emblaApi || !emblaApi.canScrollPrev()}
      >
        <ChevronRight className="h-6 w-6 text-gray-800" />
      </button>
      <button
        className="absolute top-1/2 -translate-y-1/2 left-1 bg-white/90 hover:bg-white rounded-full p-2 z-10 shadow-lg transition-opacity disabled:opacity-30"
        onClick={scrollNext}
        disabled={!emblaApi || !emblaApi.canScrollNext()}
      >
        <ChevronLeft className="h-6 w-6 text-gray-800" />
      </button>
    </div>
  );
};

export default ItemsCarousel;

// client/src/components/layout/home/VideoShowcase.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react"; // **<-- اینجا اصلاح شد**
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType as CarouselApi } from "embla-carousel";

import { VideoShowcaseItem } from "@/store/useHomepageStore";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/store/useCartStore";

interface VideoShowcaseProps {
  items: VideoShowcaseItem[];
}

const VideoShowcase: React.FC<VideoShowcaseProps> = ({ items }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    containScroll: "trimSnaps",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { toast } = useToast();
  const addToCart = useCartStore((state) => state.addToCart);

  const onSelect = useCallback((emblaApi: CarouselApi) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  if (!items || items.length === 0) {
    return null;
  }

  const currentItem = items[selectedIndex];

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const product = currentItem.product;
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.discount_price || product.price,
      image: product.images?.[0]?.url || "/images/placeholder.png",
      quantity: 1,
      stock: product.stock,
    });
    toast({
      title: "محصول به سبد خرید اضافه شد.",
      description: product.name,
    });
  };

  return (
    <section className="w-full py-8 md:py-12 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Embla Carousel Viewport */}
        <div className="embla" ref={emblaRef}>
          <div className="embla__container h-[400px] md:h-[550px] items-center">
            {items.map((item, index) => (
              <div
                className={cn(
                  "embla__slide transition-all duration-300 ease-in-out cursor-pointer",
                  index === selectedIndex ? "scale-100" : "scale-90 opacity-60"
                )}
                key={item.id}
                onClick={() => scrollTo(index)}
              >
                <div className="relative aspect-[9/16] h-full mx-auto bg-black rounded-lg overflow-hidden shadow-lg pointer-events-none">
                  {item.videoUrl ? (
                    <video
                      src={item.videoUrl}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <Image
                      src={item.product.images?.[0]?.url || "/placeholder.png"}
                      alt={`نمایش محصول ${item.product.name}`}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Info Card */}
        {currentItem && (
          <div className="mt-6 max-w-sm mx-auto">
            <div className="bg-white p-3 rounded-lg shadow-md flex items-center gap-3">
              <Link
                href={`/products/${currentItem.product.slug}`}
                className="relative w-14 h-14 rounded-md overflow-hidden block flex-shrink-0"
              >
                <Image
                  src={
                    currentItem.product.images?.[0]?.url ||
                    "/images/placeholder.png"
                  }
                  alt={currentItem.product.name}
                  fill
                  className="object-cover"
                />
              </Link>
              <div className="flex-1 text-right min-w-0">
                <Link
                  href={`/products/${currentItem.product.slug}`}
                  className="font-semibold text-sm hover:text-primary transition-colors truncate block"
                >
                  {currentItem.product.name}
                </Link>
                <div className="text-xs text-gray-700">
                  <span>
                    {currentItem.product.price.toLocaleString("fa-IR")} تومان
                  </span>
                </div>
              </div>
              <Button
                size="icon"
                onClick={handleAddToCart}
                className="rounded-full flex-shrink-0"
              >
                <ShoppingCart className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* استایل‌های مربوط به عرض اسلایدها */}
      <style jsx global>{`
        .embla {
          overflow: hidden;
        }
        .embla__container {
          display: flex;
        }
        .embla__slide {
          flex: 0 0 70%; /* عرض اسلاید در موبایل */
          min-width: 0;
          padding: 0 10px;
        }
        @media (min-width: 768px) {
          .embla__slide {
            flex: 0 0 33.33%; /* عرض اسلاید در دسکتاپ */
          }
        }
      `}</style>
    </section>
  );
};

export default VideoShowcase;

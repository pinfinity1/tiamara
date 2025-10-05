// client/src/components/layout/home/VideoShowcase.tsx

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { EmblaCarouselType, EmblaEventType } from "embla-carousel";
import { VideoShowcaseItem } from "@/store/useHomepageStore";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/store/useCartStore";
import styles from "./VideoShowcase.module.css";
import { LazyLoadVideo } from "./LazyLoadVideo"; // کامپوننت جدید را ایمپورت کنید

// فاکتور انیمیشن را کمی ملایم‌تر می‌کنیم
const TWEEN_FACTOR_BASE = 0.5;

const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max);

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
  const tweenFactor = useRef(0);

  // --- State برای Lazy Load ---
  const [slidesInView, setSlidesInView] = useState<number[]>([]);

  const { toast } = useToast();
  const addToCart = useCartStore((state) => state.addToCart);

  // --- منطق Opacity ---
  const setTweenFactor = useCallback((emblaApi: EmblaCarouselType) => {
    tweenFactor.current = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length;
  }, []);

  const tweenOpacity = useCallback(
    (emblaApi: EmblaCarouselType, eventName?: EmblaEventType) => {
      const engine = emblaApi.internalEngine();
      const scrollProgress = emblaApi.scrollProgress();
      const slidesInView = emblaApi.slidesInView();
      const isScrollEvent = eventName === "scroll";

      emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
        let diffToTarget = scrollSnap - scrollProgress;
        const slidesInSnap = engine.slideRegistry[snapIndex];

        slidesInSnap.forEach((slideIndex) => {
          if (isScrollEvent && !slidesInView.includes(slideIndex)) return;

          if (engine.options.loop) {
            engine.slideLooper.loopPoints.forEach((loopItem) => {
              const target = loopItem.target();
              if (slideIndex === loopItem.index && target !== 0) {
                const sign = Math.sign(target);
                if (sign === -1)
                  diffToTarget = scrollSnap - (1 + scrollProgress);
                if (sign === 1)
                  diffToTarget = scrollSnap + (1 - scrollProgress);
              }
            });
          }

          const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor.current);
          const opacity = numberWithinRange(tweenValue, 0, 1).toString();
          // مستقیم استایل را به نود اصلی اسلاید اعمال می‌کنیم
          emblaApi.slideNodes()[slideIndex].style.opacity = opacity;
        });
      });
    },
    []
  );

  // --- منطق Lazy Load ---
  const updateSlidesInView = useCallback((emblaApi: EmblaCarouselType) => {
    setSlidesInView((prevSlidesInView) => {
      if (prevSlidesInView.length === emblaApi.slideNodes().length) {
        emblaApi.off("slidesInView", updateSlidesInView);
      }
      const inView = emblaApi
        .slidesInView()
        .filter((index) => !prevSlidesInView.includes(index));
      return prevSlidesInView.concat(inView);
    });
  }, []);

  // --- ترکیب useEffect ها برای همه رویدادها ---
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    // راه‌اندازی هر دو قابلیت
    updateSlidesInView(emblaApi);
    setTweenFactor(emblaApi);
    tweenOpacity(emblaApi);
    onSelect();

    // ثبت رویدادها
    emblaApi.on("select", onSelect);
    emblaApi.on("slidesInView", updateSlidesInView); // برای Lazy Load
    emblaApi.on("reInit", () => {
      updateSlidesInView(emblaApi);
      setTweenFactor(emblaApi);
      tweenOpacity(emblaApi);
      onSelect();
    });
    emblaApi.on("scroll", tweenOpacity); // برای Opacity
    emblaApi.on("slideFocus", tweenOpacity); // برای Opacity

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("slidesInView", updateSlidesInView);
    };
  }, [emblaApi, updateSlidesInView, setTweenFactor, tweenOpacity]);

  if (!items || items.length === 0) {
    return null;
  }

  const currentItem = items[selectedIndex];

  // این تابع بدون تغییر باقی می‌ماند
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
        <div className={styles.embla} ref={emblaRef}>
          <div
            className={`${styles.embla__container} h-[400px] md:h-[550px] items-center`}
          >
            {items.map((item, index) => (
              <div
                className={cn(styles.embla__slide, "cursor-pointer")}
                key={item.id}
                onClick={() => emblaApi && emblaApi.scrollTo(index)}
              >
                <div className="relative aspect-[9/16] h-full mx-auto bg-black rounded-lg overflow-hidden shadow-lg pointer-events-none">
                  <LazyLoadVideo
                    key={item.id}
                    videoSrc={item.videoUrl}
                    inView={slidesInView.includes(index)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* بخش کارت اطلاعات محصول بدون تغییر باقی می‌ماند */}
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
    </section>
  );
};

export default VideoShowcase;

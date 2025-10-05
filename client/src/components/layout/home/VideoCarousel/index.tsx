"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEmblaCarouselSetup } from "./useEmblaCarouselSetup";
import { VideoSlide } from "./VideoSlide";
import { ProductCard } from "./ProductCard";
import styles from "./VideoCarousel.module.css";

// تایپ آیتم‌ها و محصول را با ساختار داده واقعی خود هماهنگ کنید
interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  images?: { url: string }[];
}

interface CarouselItem {
  id: string;
  videoUrl: string;
  product: Product;
}

interface VideoCarouselProps {
  items: CarouselItem[];
}

const VideoCarousel: React.FC<VideoCarouselProps> = ({ items }) => {
  const {
    emblaRef,
    selectedIndex,
    scrollPrev,
    scrollNext,
    prevBtnDisabled,
    nextBtnDisabled,
  } = useEmblaCarouselSetup();

  const handleAddToCart = (product: Product) => {
    // منطق اضافه کردن به سبد خرید را در اینجا پیاده‌سازی کنید
    console.log("Added to cart:", product.name);
    // toast({ title: "محصول به سبد خرید اضافه شد." });
  };

  if (!items || items.length === 0) {
    return null;
  }

  const currentItem = items[selectedIndex];

  return (
    <section className={styles.carousel_section}>
      <div className={styles.embla}>
        <div className={styles.embla__viewport} ref={emblaRef}>
          <div className={styles.embla__container}>
            {items.map((item, index) => (
              <VideoSlide
                key={item.id}
                videoSrc={item.videoUrl}
                isActive={index === selectedIndex}
              />
            ))}
          </div>
        </div>

        <button
          className={`${styles.embla__button} ${styles.embla__button__prev}`}
          onClick={scrollPrev}
          disabled={prevBtnDisabled}
        >
          <ChevronRight size={24} />
        </button>
        <button
          className={`${styles.embla__button} ${styles.embla__button__next}`}
          onClick={scrollNext}
          disabled={nextBtnDisabled}
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <ProductCard
        product={currentItem.product}
        onAddToCart={handleAddToCart}
      />
    </section>
  );
};

export default VideoCarousel;

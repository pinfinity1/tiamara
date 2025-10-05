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

  if (!items || items.length === 0) {
    return null;
  }

  const currentItem = items[selectedIndex];

  return (
    <section className="video-carousel-section">
      <div className="video-carousel-embla">
        <div className="video-carousel-embla__viewport" ref={emblaRef}>
          <div className="video-carousel-embla__container">
            {items.map((item, index) => (
              <VideoSlide
                key={item.id}
                videoSrc={item.videoUrl}
                isActive={index === selectedIndex}
                currentItem={currentItem}
              />
            ))}
          </div>
        </div>

        <button
          className="video-carousel-embla__button video-carousel-embla__button__prev"
          onClick={scrollPrev}
          disabled={prevBtnDisabled}
        >
          <ChevronRight size={24} />
        </button>
        <button
          className="video-carousel-embla__button video-carousel-embla__button__next"
          onClick={scrollNext}
          disabled={nextBtnDisabled}
        >
          <ChevronLeft size={24} />
        </button>
      </div>
    </section>
  );
};

export default VideoCarousel;

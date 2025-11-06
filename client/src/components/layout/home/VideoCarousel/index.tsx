// client/src/components/layout/home/VideoCarousel/index.tsx (نسخه صحیح)
"use client";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEmblaCarouselSetup } from "./useEmblaCarouselSetup";
import { VideoSlide } from "./VideoSlide";
import type { Product } from "@/store/useProductStore";

interface CarouselItem {
  id: string;
  videoUrl: string;
  product: Product;
}

interface VideoCarouselProps {
  items: CarouselItem[];
}

const VideoCarousel: React.FC<VideoCarouselProps> = ({ items }) => {
  const { emblaRef, emblaApi, selectedIndex, scrollPrev, scrollNext } =
    useEmblaCarouselSetup();

  const [isMuted, setIsMuted] = useState(true);
  const toggleMute = () => setIsMuted((prev) => !prev);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="video-carousel-section">
      <div className="video-carousel-embla">
        <div className="video-carousel-embla__viewport" ref={emblaRef}>
          <div className="video-carousel-embla__container">
            {items.map((item, index) => (
              <div
                className="video-carousel-embla__slide"
                key={item.id}
                onClick={() => emblaApi && emblaApi.scrollTo(index)}
              >
                <div className="video-carousel-embla__slide__transformer">
                  <VideoSlide
                    video={item}
                    isSelected={index === selectedIndex}
                    onEnded={scrollNext}
                    isMuted={isMuted}
                    onToggleMute={toggleMute}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          className="video-carousel-embla__button video-carousel-embla__button__prev"
          onClick={scrollPrev}
        >
          <ChevronRight size={24} />
        </button>
        <button
          className="video-carousel-embla__button video-carousel-embla__button__next"
          onClick={scrollNext}
        >
          <ChevronLeft size={24} />
        </button>
      </div>
    </section>
  );
};

export default VideoCarousel;

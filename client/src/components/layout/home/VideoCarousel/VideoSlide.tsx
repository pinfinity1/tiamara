// client/src/components/layout/home/VideoCarousel/VideoSlide.tsx

import React, { useRef, useEffect, useState } from "react";
import { ProductCard, type Product } from "./ProductCard"; // تایپ Product را از اینجا وارد می‌کنیم
import { Volume2, VolumeX } from "lucide-react";

interface VideoSlideProps {
  videoSrc: string;
  isActive: boolean;
  product: Product;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const VideoSlide: React.FC<VideoSlideProps> = ({
  videoSrc,
  isActive,
  product,
  isMuted,
  onToggleMute,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isActive]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <div className="video-carousel-embla__slide">
      <div className="video-carousel-video_wrapper">
        <video
          className="video-carousel-embla__slide__video"
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted={isMuted}
          playsInline
        />
        <button className="video-carousel-mute_button" onClick={onToggleMute}>
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      <div className="product-card-overlay">
        <ProductCard product={product} isActiveSlide={isActive} />
      </div>
    </div>
  );
};

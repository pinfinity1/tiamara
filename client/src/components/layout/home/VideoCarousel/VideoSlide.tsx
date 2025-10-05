import React, { useRef, useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { ProductCard } from "./ProductCard";

interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  images?: { url: string }[];
}

interface VideoSlideProps {
  videoSrc: string;
  isActive: boolean;
  currentItem: any;
}

export const VideoSlide: React.FC<VideoSlideProps> = ({
  videoSrc,
  isActive,
  currentItem,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      if (isActive) {
        videoElement.play().catch((error) => {
          console.error("Video play failed:", error);
        });
      } else {
        videoElement.pause();
        videoElement.currentTime = 0;
      }
    }
  }, [isActive]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted((prev) => !prev);
  };

  const handleAddToCart = (product: Product) => {
    // منطق اضافه کردن به سبد خرید را در اینجا پیاده‌سازی کنید
    console.log("Added to cart:", product.name);
    // toast({ title: "محصول به سبد خرید اضافه شد." });
  };

  return (
    <div className="video-carousel-embla__slide">
      <div className="video-carousel-video_wrapper">
        <video
          ref={videoRef}
          src={videoSrc}
          muted={isMuted}
          playsInline
          loop
          className="video-carousel-embla__slide__video "
        />
        <button onClick={toggleMute} className="video-carousel-mute_button">
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
      <ProductCard
        product={currentItem.product}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

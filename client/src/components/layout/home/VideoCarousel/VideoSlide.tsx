// client/src/components/layout/home/VideoCarousel/VideoSlide.tsx (نسخه اصلاح شده)

import React, { useRef, useEffect } from "react";
import { ProductCard, type Product } from "./ProductCard";
import { Volume2, VolumeX } from "lucide-react";

// Props ها کمی تغییر کرده تا با VideoCarousel هماهنگ شود
interface VideoSlideProps {
  video: {
    id: string;
    videoUrl: string;
    product: Product;
  };
  isSelected: boolean;
  onEnded: () => void;
  // این دو prop دیگر لازم نیستند و از VideoCarousel مدیریت می‌شوند
  isMuted: boolean;
  onToggleMute: () => void;
}

export const VideoSlide: React.FC<VideoSlideProps> = ({
  video,
  isSelected,
  onEnded,
  isMuted,
  onToggleMute,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      if (isSelected) {
        videoElement.play().catch(console.error);
      } else {
        videoElement.pause();
        videoElement.currentTime = 0; // ویدیو از اول شروع شود
      }
    }
  }, [isSelected]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <>
      <div className="video-carousel-video_wrapper">
        <video
          className="video-carousel-embla__slide__video"
          ref={videoRef}
          src={video.videoUrl}
          loop={false} // onEnded فقط وقتی کار می‌کند که loop نباشد
          muted // ویدیوها همیشه Mute هستند
          playsInline
          onEnded={onEnded} // وقتی ویدیو تمام شد، اسلاید بعدی
        />
        <button className="video-carousel-mute_button" onClick={onToggleMute}>
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      <div className="product-card-overlay">
        <ProductCard product={video.product} isActiveSlide={isSelected} />
      </div>
    </>
  );
};

import React, { useRef, useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import styles from "./VideoCarousel.module.css";

interface VideoSlideProps {
  videoSrc: string;
  isActive: boolean;
}

export const VideoSlide: React.FC<VideoSlideProps> = ({
  videoSrc,
  isActive,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  console.log(videoSrc);
  console.log(isActive);

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

  return (
    <div className={styles.embla__slide}>
      <div className={styles.video_wrapper}>
        <video
          ref={videoRef}
          src={videoSrc}
          muted={isMuted}
          playsInline
          loop
          className={styles.embla__slide__video}
        />
        <button onClick={toggleMute} className={styles.mute_button}>
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
    </div>
  );
};

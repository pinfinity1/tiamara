import React, { useState, useCallback, useEffect } from "react";

type PropType = {
  videoSrc: string;
  inView: boolean;
};

export const LazyLoadVideo: React.FC<PropType> = (props) => {
  const { videoSrc, inView } = props;
  const [hasLoaded, setHasLoaded] = useState(false);

  const setLoaded = useCallback(() => {
    if (inView) setHasLoaded(true);
  }, [inView]);

  const [src, setSrc] = useState("");
  useEffect(() => {
    if (inView && !src) {
      setSrc(videoSrc);
    }
  }, [inView, src, videoSrc]);

  return (
    <div className="embla__lazy-load">
      {!hasLoaded && <span className="embla__lazy-load__spinner" />}
      <video
        key={src}
        className="embla__slide__video embla__lazy-load__video"
        onCanPlay={setLoaded}
        playsInline
        muted
        loop
      >
        {src && <source src={src} type="video/mp4" />}
      </video>
    </div>
  );
};

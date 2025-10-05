import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { EmblaCarouselType, EmblaEventType } from "embla-carousel";
import Autoplay from "embla-carousel-autoplay";

const TWEEN_FACTOR = 1.2;

const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max);

export const useEmblaCarouselSetup = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      direction: "rtl",
    },
    [Autoplay({ playOnInit: true, delay: 5000, stopOnInteraction: true })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  const tweenStyles = useCallback((emblaApi: EmblaCarouselType) => {
    const engine = emblaApi.internalEngine();
    const scrollProgress = emblaApi.scrollProgress();

    emblaApi.scrollSnapList().forEach((scrollSnap, index) => {
      let diffToTarget = scrollSnap - scrollProgress;
      const slidesInSnap = engine.slideRegistry[index];

      slidesInSnap.forEach((slideIndex) => {
        if (engine.options.loop) {
          engine.slideLooper.loopPoints.forEach((loopItem) => {
            const target = loopItem.target();
            if (slideIndex === loopItem.index && target !== 0) {
              const sign = Math.sign(target);
              if (sign === -1) diffToTarget = scrollSnap - (1 + scrollProgress);
              if (sign === 1) diffToTarget = scrollSnap + (1 - scrollProgress);
            }
          });
        }

        const tweenValue = 1 - Math.abs(diffToTarget * TWEEN_FACTOR);
        const scale = numberWithinRange(tweenValue, 0.85, 1).toString();
        const opacity = numberWithinRange(tweenValue, 0.5, 1).toString();
        const slideNode = emblaApi.slideNodes()[slideIndex];
        slideNode.style.transform = `scale(${scale})`;
        slideNode.style.opacity = opacity;
      });
    });
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    tweenStyles(emblaApi);

    emblaApi.on("select", onSelect);
    emblaApi.on("scroll", tweenStyles);
    emblaApi.on("reInit", (api) => {
      onSelect(api);
      tweenStyles(api);
    });

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("scroll", tweenStyles);
    };
  }, [emblaApi, onSelect, tweenStyles]);

  return {
    emblaRef,
    emblaApi,
    selectedIndex,
    scrollPrev,
    scrollNext,
    prevBtnDisabled,
    nextBtnDisabled,
  };
};

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/useSettingsStore";
import Autoplay from "embla-carousel-autoplay";

function HomeBannerCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { banners, featuredProducts, fetchFeaturedProducts, fetchBanners } =
    useSettingsStore();

  useEffect(() => {
    fetchBanners();
    fetchFeaturedProducts();
  }, [fetchBanners, fetchFeaturedProducts]);

  useEffect(() => {
    const bannerTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(bannerTimer);
  }, [banners.length]);
  // console.log(banners, featuredProducts);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: false,
      direction: "rtl",
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onDotButtonClick = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
      setSelectedIndex(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <>
      {banners && (
        <section className="home-banner-carousel h-[280px] lg:h-[360px] w-full overflow-hidden ">
          <div className="embla w-full h-full">
            <div className="embla__viewport" ref={emblaRef}>
              <div className="embla__container">
                {banners.map((banner) => (
                  <div className="embla__slide" key={banner.id}>
                    <div className="h-full w-full">
                      <Image
                        src={banner.imageUrl}
                        alt={"banner"}
                        fill
                        className="w-full h-full object-cover"
                        priority={banner.id === "1"}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="embla__dots absolute left-1/2 -translate-x-1/2 bottom-2 w-fit bg-black/15 backdrop-blur-xl px-1 py-0.5 rounded">
              {banners?.map((_, index) => (
                <button
                  key={index}
                  onClick={() => onDotButtonClick(index)}
                  className={`embla__dot ${
                    index === selectedIndex ? "embla__dot--selected" : ""
                  } `}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default HomeBannerCarousel;

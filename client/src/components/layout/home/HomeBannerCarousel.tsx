import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/useSettingsStore";
import Autoplay from "embla-carousel-autoplay";

const sampleBanners = [
  {
    id: "1",
    imageUrl: "/images/banner2.jpg",
    title: "NEW ARRIVALS",
    subtitle: "Discover the latest trends in fashion.",
  },
  {
    id: "2",
    imageUrl: "/images/banner.webp",
    title: "SUMMER SALE",
    subtitle: "Up to 50% off on selected items.",
  },
  {
    id: "3",
    imageUrl: "/images/login-banner.webp",
    title: "VINTAGE COLLECTION",
    subtitle: "Timeless pieces for a classic look.",
  },
];

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
    <section className="home-banner-carousel h-[280px] lg:h-[360px] w-full overflow-hidden ">
      <div className="embla w-full h-full">
        <div className="embla__viewport" ref={emblaRef}>
          <div className="embla__container">
            {sampleBanners.map((banner) => (
              <div className="embla__slide" key={banner.id}>
                <div className="embla__slide__content">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    className="embla__slide__img object-cover"
                    priority={banner.id === "1"}
                  />
                  <div className="embla__slide__overlay">
                    <div className="text-white text-center space-y-4 p-4">
                      <span className="text-sm uppercase tracking-wider">
                        {banner.subtitle}
                      </span>
                      <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                        {banner.title}
                      </h1>
                      <Button className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg">
                        SHOP NOW
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="embla__dots flex items-center justify-center absolute right-[50%] bottom-2 left-[50%] gap-[5px]">
          {sampleBanners?.map((_, index) => (
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
  );
}

export default HomeBannerCarousel;

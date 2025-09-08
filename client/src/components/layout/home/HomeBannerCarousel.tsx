import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useHomepageStore } from "@/store/useHomepageStore";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";

function HomeBannerCarousel() {
  const { banners, fetchBanners } = useHomepageStore();

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      direction: "rtl",
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onDotButtonClick = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
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
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <>
      {banners && banners.length > 0 && (
        <section className="home-banner-carousel h-[280px] lg:h-[420px] w-full overflow-hidden ">
          <div className="embla w-full h-full">
            <div className="embla__viewport" ref={emblaRef}>
              <div className="embla__container">
                {banners
                  .filter((b) => b.isActive)
                  .map((banner) => (
                    <div className="embla__slide" key={banner.id}>
                      <Link
                        href={banner.linkUrl || "#"}
                        className="h-full w-full block relative"
                      >
                        <Image
                          src={banner.imageUrl}
                          alt={banner.altText || "Tiamara Banner"}
                          fill
                          className="w-full h-full object-cover"
                          priority={banner.order === 0}
                        />
                      </Link>
                    </div>
                  ))}
              </div>
            </div>

            <div className="embla__dots absolute left-1/2 -translate-x-1/2 bottom-2 w-fit bg-black/15 backdrop-blur-xl px-2 py-1 rounded-full">
              {banners
                .filter((b) => b.isActive)
                .map((_, index) => (
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

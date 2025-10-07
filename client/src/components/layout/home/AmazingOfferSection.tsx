import { useState, useEffect } from "react";
import ItemsCarousel from "@/components/common/carousel/ItemsCarousel";
import AmazingOfferProductCard from "@/components/products/AmazingOfferProductCard";
import AmazingOfferIntroSlide from "./AmazingOfferIntroSlide";
import Image from "next/image";
import { ProductCollection } from "@/store/useHomepageStore";
import StaticOfferCard from "@/components/common/carousel/StatixOfferCard";
import { Skeleton } from "@/components/ui/skeleton";

interface AmazingOfferSectionProps {
  collection: ProductCollection;
}

export default function AmazingOfferSection({
  collection,
}: AmazingOfferSectionProps) {
  if (!collection || !collection.products || collection.products.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 my-12">
      <div className="relative rounded-lg overflow-hidden w-full group">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src={collection.imageUrl || "/images/abstract-design-1.png"}
            alt={collection.title || "Amazing Offer Background"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-primary/80 via-primary/50 to-transparent" />
        </div>

        <div className="md:hidden relative z-10 p-3">
          <AmazingOfferIntroSlide />
        </div>

        <div className="relative z-10 w-full h-[380px] px-3 py-1 flex items-center ">
          <ItemsCarousel>
            <AmazingOfferIntroSlide />

            {collection.products.map((product) => (
              <AmazingOfferProductCard key={product.id} product={product} />
            ))}

            <StaticOfferCard />
          </ItemsCarousel>
        </div>
      </div>
    </section>
  );
}

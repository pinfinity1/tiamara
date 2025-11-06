// client/src/components/layout/home/VideoCarousel/ProductCard.tsx

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, ShoppingCart } from "lucide-react";
import { useProductModalStore } from "@/store/useProductModalStore";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import type { Product } from "@/store/useProductStore";

interface ProductCardProps {
  product: Product;
  isActiveSlide: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isActiveSlide,
}) => {
  const openModal = useProductModalStore((state) => state.onOpen);

  if (!product) return null;

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    openModal(product);
  };

  return (
    <div
      className={`product-card-container ${isActiveSlide ? "is-active" : ""}`}
    >
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem
          value="product-info"
          className="rounded-xl bg-white/80 shadow-md backdrop-blur-sm border-none "
          disabled={!isActiveSlide}
        >
          {/* این div اصلی، flex container است */}
          <div className="flex items-center p-3">
            {/* 1. این قسمت اصلی حالا یک لینک است */}
            <Link
              href={`/products/${product.slug}`}
              target="_blank"
              className="flex flex-grow items-center gap-3 text-right min-w-0"
            >
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
                <Image
                  src={product.images?.[0]?.url || "/images/placeholder.png"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-grow min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {product.name}
                </p>
                {product.brand && (
                  <>
                    <p className="text-xs ">
                      برند
                      <span className="text-xs font-semibold text-gray-700 mr-2">
                        {product.brand.name}
                      </span>
                    </p>
                  </>
                )}
              </div>
            </Link>

            <AccordionTrigger className="flex-shrink-0 p-2 hover:no-underline [&[data-state=open]>svg]:rotate-180"></AccordionTrigger>
          </div>

          {/* محتوای آکاردئون */}
          <AccordionContent className="px-3 pt-0 pb-3">
            <div className="flex items-center justify-between border-t pt-2">
              <p className="font-semibold text-gray-800">
                {product.price.toLocaleString("fa")} تومان
              </p>

              <Button
                size="sm"
                variant="outline"
                onClick={handleOpenModal}
                className="rounded-full"
              >
                <Plus className="size-3" />
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

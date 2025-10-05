import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // مسیر کامپوننت دکمه را تنظیم کنید
import { ShoppingCart } from "lucide-react";
import styles from "./VideoCarousel.module.css";

// فرض می‌کنیم تایپ محصول به این شکل است. آن را با تایپ واقعی خود جایگزین کنید
interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  images?: { url: string }[];
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
}) => {
  if (!product) return null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <div className="video-carousel-product_card_wrapper">
      <div className="video-carousel-product_card">
        <Link
          href={`/products/${product.slug}`}
          className="video-carousel-product_image_link"
        >
          <Image
            src={product.images?.[0]?.url || "/images/placeholder.png"}
            alt={product.name}
            fill
            style={{ objectFit: "cover" }}
          />
        </Link>
        <div className="video-carousel-product_info">
          <Link href={`/products/${product.slug}`}>
            <span className="video-carousel-product_name">{product.name}</span>
          </Link>
          <p className="video-carousel-product_price">
            {product.price.toLocaleString()} تومان
          </p>
        </div>
        <Button
          size="icon"
          onClick={handleAddToCart}
          className="rounded-full flex-shrink-0"
        >
          <ShoppingCart className="size-4" />
        </Button>
      </div>
    </div>
  );
};

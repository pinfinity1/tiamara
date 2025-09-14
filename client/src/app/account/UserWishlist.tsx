"use client";

import { useEffect, useState } from "react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useProductStore, Product } from "@/store/useProductStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import WishlistProductCard from "@/components/products/WishlistProductCard";

export default function UserWishlist() {
  const { wishlistItems, fetchWishlist } = useWishlistStore();
  const { fetchProductsByIds, isLoading } = useProductStore();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  useEffect(() => {
    if (wishlistItems.length > 0) {
      const getProducts = async () => {
        const products = await fetchProductsByIds(wishlistItems);
        if (products) {
          setWishlistProducts(products);
        }
      };
      getProducts();
    } else {
      setWishlistProducts([]);
    }
  }, [wishlistItems, fetchProductsByIds]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>لیست علاقه‌مندی‌های من</CardTitle>
        <CardDescription>
          محصولاتی که دوست داشتید را اینجا ذخیره کنید تا بعداً به راحتی پیدا
          کنید.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>در حال بارگذاری...</p>
        ) : wishlistProducts.length === 0 ? (
          <div className="text-center p-4 bg-gray-50 rounded-md">
            <p>لیست علاقه‌مندی‌های شما خالی است.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {wishlistProducts.map((product) => (
              <WishlistProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

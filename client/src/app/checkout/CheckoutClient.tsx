// client/src/app/checkout/CheckoutClient.tsx

"use client";

import { useCartStore } from "@/store/useCartStore";
import { useEffect } from "react";
import CheckoutView from "@/components/checkout/CheckoutView";
import CheckoutSummary from "@/components/checkout/CheckoutSummary";
import CartView from "@/components/checkout/CartView";
import CheckoutSkeleton from "./checkoutSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CheckoutClientProps {
  isUserLoggedIn: boolean;
}

export default function CheckoutClient({
  isUserLoggedIn,
}: CheckoutClientProps) {
  // اطلاعات سبد خرید رو از استور Zustand می‌گیریم
  const { items, isLoading, fetchCart } = useCartStore();

  useEffect(() => {
    // وقتی کامپوننت لود شد، محتویات سبد خرید رو از سرور می‌گیریم
    fetchCart();
  }, [fetchCart]);

  if (isLoading) {
    return <CheckoutSkeleton />;
  }

  // اگر سبد خرید خالی بود، کامپوننت CartView رو نشون می‌دیم که پیام خالی بودن سبد رو نمایش می‌ده
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <CartView />
      </div>
    );
  }

  // اگر سبد خرید آیتم داشت، نمای اصلی پرداخت رو نشون می‌دیم
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">تکمیل خرید</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <CheckoutView />
            <Card>
              <CardHeader>
                <CardTitle>خلاصه سبد خرید</CardTitle>
              </CardHeader>
              <CardContent>
                <CartView />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1 sticky top-24">
            <CheckoutSummary isUserLoggedIn={isUserLoggedIn} />
          </div>
        </div>
      </div>
    </div>
  );
}

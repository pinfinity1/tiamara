// client/src/app/checkout/CheckoutClient.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useShallow } from "zustand/react/shallow";
import CartView from "@/components/checkout/CartView";
import CheckoutView from "@/components/checkout/CheckoutView";
import CheckoutSkeleton from "./checkoutSkeleton";
import CheckoutSummary from "@/components/checkout/CheckoutSummary";

interface CheckoutClientProps {
  isUserLoggedIn: boolean;
}

export default function CheckoutClient({
  isUserLoggedIn,
}: CheckoutClientProps) {
  const router = useRouter();

  // Use a simple selector, no need for useShallow if selecting single properties
  const { items: cartItems, initializeCart, isLoading } = useCartStore();

  useEffect(() => {
    // ✅ ALWAYS fetch the latest cart state when the checkout page is loaded.
    initializeCart();
  }, [initializeCart]);

  // This effect handles redirecting if the cart becomes empty AFTER initialization
  useEffect(() => {
    if (!isLoading && cartItems.length === 0) {
      router.replace("/products");
    }
  }, [isLoading, cartItems, router]);

  if (isLoading || cartItems.length === 0) {
    return <CheckoutSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          سبد خرید و پرداخت
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <CartView />
            {isUserLoggedIn && <CheckoutView />}
          </div>
          <div className="lg:col-span-1 lg:sticky top-3">
            <CheckoutSummary isUserLoggedIn={isUserLoggedIn} />
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const {
    items: cartItems,
    isInitialized,
    initializeCart,
  } = useCartStore(
    useShallow((state) => ({
      items: state.items,
      isInitialized: state.isInitialized,
      initializeCart: state.initializeCart,
    }))
  );

  useEffect(() => {
    if (!isInitialized) {
      initializeCart();
    }
  }, [isInitialized, initializeCart]);

  useEffect(() => {
    if (isInitialized && cartItems.length === 0) {
      router.replace("/products");
    }
  }, [isInitialized, cartItems, router]);

  if (!isInitialized || (isInitialized && cartItems.length === 0)) {
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

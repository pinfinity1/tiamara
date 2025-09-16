"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useAddressStore } from "@/store/useAddressStore";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import CartView from "@/components/checkout/CartView";
import CheckoutView from "@/components/checkout/CheckoutView";
import { Button } from "@/components/ui/button";

interface CheckoutClientProps {
  initialCartItems: any[];
  initialAddresses: any[];
  isUserLoggedIn: boolean;
}

export default function CheckoutClient({
  initialCartItems,
  initialAddresses,
  isUserLoggedIn,
}: CheckoutClientProps) {
  useEffect(() => {
    useCartStore.getState().setItems(initialCartItems);
    useAddressStore.getState().setAddresses(initialAddresses);
  }, [initialCartItems, initialAddresses]);

  const openModal = useAuthModalStore((state) => state.openModal);

  return (
    <div>
      <CartView />
      <div className="mt-8 border-t pt-8">
        {isUserLoggedIn ? (
          <CheckoutView />
        ) : (
          initialCartItems.length > 0 && (
            <div className="text-center bg-gray-100 p-8 rounded-lg">
              <h2 className="text-xl font-semibold">برای ادامه وارد شوید</h2>
              <p className="text-gray-600 mt-2">
                برای انتخاب آدرس و نهایی کردن خرید، لطفاً وارد حساب کاربری خود
                شوید.
              </p>
              <Button
                size="lg"
                className="mt-4"
                onClick={() => openModal("login")}
              >
                ورود یا ثبت‌نام
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useAddressStore } from "@/store/useAddressStore";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import CartView from "@/components/checkout/CartView";
import CheckoutView from "@/components/checkout/CheckoutView";
import ShippingMethodSelection, {
  ShippingMethod,
} from "@/components/checkout/ShippingMethodSelection";
import FinalReviewView from "@/components/checkout/FinalReviewView";
import CheckoutSummary from "@/components/checkout/CheckoutSummary";
import { Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

interface CheckoutClientProps {
  isUserLoggedIn: boolean;
  initialShippingMethods: ShippingMethod[];
}

export default function CheckoutClient({
  isUserLoggedIn,
  initialShippingMethods,
}: CheckoutClientProps) {
  const { items, isLoading, fetchCart } = useCartStore();
  const { selectedAddress } = useAddressStore();
  const { shippingMethod } = useCheckoutStore();
  const { onOpen: openAuthModal } = useAuthModalStore();

  const [step, setStep] = useState(1);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleNextStep = () => {
    // اعتبارسنجی مرحله ۱
    if (step === 1) {
      if (!isUserLoggedIn) {
        openAuthModal();
        return;
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // اعتبارسنجی مرحله ۲
    if (step === 2) {
      if (!selectedAddress) {
        toast({
          title: "آدرس را انتخاب کنید",
          description: "برای ارسال کالا نیاز به انتخاب یا افزودن آدرس دارید.",
          variant: "destructive",
        });
        return;
      }

      if (!shippingMethod) {
        toast({
          title: "روش ارسال",
          description: "لطفاً نحوه ارسال سفارش را مشخص کنید.",
          variant: "destructive",
        });
        return;
      }

      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p>در حال بارگذاری سبد خرید...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-dashed">
        <ShoppingBag className="w-20 h-20 text-gray-200 mb-6" />
        <h2 className="text-2xl font-bold text-gray-800">
          سبد خرید شما خالی است
        </h2>
        <Button
          asChild
          className="mt-8 px-8 h-12 text-lg shadow-lg shadow-primary/20"
        >
          <Link href="/products">شروع خرید شگفت‌انگیز</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <CheckoutStepper currentStep={step} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ستون اصلی محتوا */}
        <div className="lg:col-span-8 space-y-6">
          {/* ✅ اصلاح مهم: استفاده از شرط برای رندر کردن (Mount/Unmount) */}

          {/* مرحله ۱: سبد خرید */}
          {step === 1 && (
            <div className="block space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <CartView />
            </div>
          )}

          {/* مرحله ۲: آدرس و ارسال */}
          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <section>
                <CheckoutView />
              </section>
              <section>
                <ShippingMethodSelection methods={initialShippingMethods} />
              </section>
            </div>
          )}

          {/* مرحله ۳: بازبینی نهایی */}
          {step === 3 && (
            <div className="block animate-in slide-in-from-right-8 duration-500">
              <FinalReviewView onEditStep={(s) => setStep(s)} />
            </div>
          )}
        </div>

        {/* ستون کناری: خلاصه فاکتور */}
        <div className="lg:col-span-4 relative">
          <CheckoutSummary
            step={step}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            isUserLoggedIn={isUserLoggedIn}
          />
        </div>
      </div>
    </div>
  );
}

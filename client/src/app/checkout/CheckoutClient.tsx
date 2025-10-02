"use client";

import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import { useEffect, useState } from "react";
import CheckoutSkeleton from "./checkoutSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CartView from "@/components/checkout/CartView";
import CheckoutView from "@/components/checkout/CheckoutView";
import CheckoutSummary from "@/components/checkout/CheckoutSummary";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import ShippingMethodSelection from "./ShippingMethodSelection";
import CheckoutStepper from "./CheckoutStepper";
import FinalReviewView from "@/components/checkout/FinalReviewView";

// Props برای کامپوننت اصلی
interface CheckoutClientProps {
  isUserLoggedIn: boolean;
}

export default function CheckoutClient({
  isUserLoggedIn,
}: CheckoutClientProps) {
  const { items, isLoading, fetchCart } = useCartStore();
  const { onOpen: openAuthModal } = useAuthModalStore();

  // گام ۱: بازبینی سبد خرید
  // گام ۲: انتخاب آدرس
  // گام ۳: روش ارسال
  // گام ۴: بازبینی نهایی و پرداخت
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleNextStep = () => {
    if (!isUserLoggedIn && step === 1) {
      // اگر کاربر لاگین نکرده و در مرحله اول است، مودال ورود را باز کن
      openAuthModal();
    } else {
      // در غیر این صورت به مرحله بعد برو
      setStep((s) => s + 1);
    }
  };

  // تابع جدید برای بازگشت به مرحله قبل
  const handlePrevStep = () => {
    setStep((s) => Math.max(1, s - 1)); // Math.max از رفتن به مرحله کمتر از 1 جلوگیری می‌کند
  };

  if (isLoading) {
    return <CheckoutSkeleton />;
  }

  // اگر سبد خرید خالی بود، فقط سبد را نمایش بده
  if (!isLoading && items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">سبد خرید</h1>
        <CartView />
      </div>
    );
  }

  // محتوای اصلی بر اساس مرحله فعلی
  const renderStepContent = () => {
    // برای تمام کاربران (مهمان و لاگین کرده)
    if (step === 1) {
      return <CartView />;
    }

    // فقط برای کاربران لاگین کرده
    if (isUserLoggedIn) {
      switch (step) {
        case 2:
          return <CheckoutView />; // انتخاب آدرس
        case 3:
          return <ShippingMethodSelection />; // انتخاب روش ارسال
        case 4:
          return <FinalReviewView />;
        default:
          return <CartView />;
      }
    }

    return null; // اگر کاربر لاگین نیست و از مرحله ۱ گذشته، چیزی نشان نده
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {step === 1 ? "سبد خرید شما" : "تکمیل خرید"}
        </h1>

        {/* Stepper فقط در مراحل بعد از لاگین نمایش داده می‌شود */}
        {isUserLoggedIn && step > 1 && (
          <div className="max-w-4xl mx-auto mb-8">
            <CheckoutStepper currentStep={step} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">{renderStepContent()}</div>
          <div className="lg:col-span-1 sticky top-24">
            {/* کامپوننت خلاصه، منطق دکمه‌ها را مدیریت خواهد کرد */}
            <CheckoutSummary
              isUserLoggedIn={isUserLoggedIn}
              currentStep={step}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep} // ارسال تابع جدید به عنوان prop
            />
          </div>
        </div>
      </div>
    </div>
  );
}

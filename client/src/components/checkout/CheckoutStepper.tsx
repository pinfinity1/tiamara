// client/src/components/checkout/CheckoutStepper.tsx
"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckoutStepperProps {
  currentStep: number;
}

const CheckoutStepper = ({ currentStep }: CheckoutStepperProps) => {
  const steps = [
    { id: 1, label: "سبد خرید" },
    { id: 2, label: "اطلاعات ارسال" },
    { id: 3, label: "پرداخت" },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 px-4">
      <div className="relative flex justify-between items-center">
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className="flex flex-col items-center px-2">
              <div
                className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 bg-white",
                  isActive
                    ? "bg-primary text-primary-foreground scale-110 shadow-lg ring-4 ring-primary/20 backdrop-blur-md"
                    : isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-gray-300 text-gray-400"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <span className="font-bold text-sm sm:text-base">
                    {step.id}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs sm:text-sm font-medium transition-colors duration-300 absolute sm:static translate-y-10 sm:translate-y-0 w-24 text-center",
                  isActive ? "text-primary font-bold" : "text-gray-500",
                  // در موبایل فقط مرحله فعال نمایش داده شود تا شلوغ نشود
                  !isActive && "hidden sm:block"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      {/* فضای خالی برای متن‌های موبایل که absolute هستند */}
      <div className="h-6 sm:hidden" />
    </div>
  );
};

export default CheckoutStepper;

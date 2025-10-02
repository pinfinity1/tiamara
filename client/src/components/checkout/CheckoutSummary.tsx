// client/src/components/checkout/CheckoutSummary.tsx (نسخه اصلاح‌شده)

"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useUserStore } from "@/store/useUserStore";
import { useAddressStore } from "@/store/useAddressStore";
import { useToast } from "@/hooks/use-toast";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import axiosAuth from "@/lib/axios";
import { useCheckoutStore } from "@/store/useCheckoutStore";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  Loader2,
  PercentSquare,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface AppliedCoupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
}

interface CheckoutSummaryProps {
  isUserLoggedIn: boolean;
  currentStep: number;
  onNextStep: () => void;
  onPrevStep: () => void;
}

export default function CheckoutSummary({
  isUserLoggedIn,
  currentStep,
  onNextStep,
  onPrevStep,
}: CheckoutSummaryProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { onOpen: openAuthModal } = useAuthModalStore();
  const { items: cartItems } = useCartStore();
  const { createFinalOrder, isLoading: isPaymentProcessing } = useOrderStore();
  const { userProfile, fetchProfile } = useUserStore();
  const selectedAddressId = useAddressStore(
    (state) =>
      state.addresses.find((a) => a.isDefault)?.id || state.addresses[0]?.id
  );
  const { shippingMethod } = useCheckoutStore();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    null
  );
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCouponLoading, setIsCouponLoading] = useState(false);

  const shippingCost = useMemo(() => {
    if (currentStep >= 3 && shippingMethod) {
      return shippingMethod.cost;
    }
    return 0;
  }, [currentStep, shippingMethod]);

  useEffect(() => {
    if (isUserLoggedIn && !userProfile) {
      fetchProfile();
    }
  }, [isUserLoggedIn, userProfile, fetchProfile]);

  const cartTotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cartItems]
  );

  const finalTotal = useMemo(() => {
    let total = cartTotal;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === "FIXED") {
        total = Math.max(0, total - appliedCoupon.discountValue);
      } else {
        const discountAmount = total * (appliedCoupon.discountValue / 100);
        total = Math.round(total - discountAmount);
      }
    }
    return total + shippingCost;
  }, [cartTotal, appliedCoupon, shippingCost]);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsCouponLoading(true);
    setCouponError(null);
    try {
      const response = await axiosAuth.post("/coupon/validate", {
        code: couponCode,
      });
      if (response.data.isValid) {
        setAppliedCoupon(response.data.coupon);
        toast({ title: "کد تخفیف با موفقیت اعمال شد." });
      } else {
        setCouponError(response.data.message || "کد تخفیف نامعتبر است.");
        setAppliedCoupon(null);
      }
    } catch (error: any) {
      setCouponError(error.response?.data?.message || "کد تخفیف نامعتبر است.");
      setAppliedCoupon(null);
    } finally {
      setIsCouponLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast({
        title: "لطفاً یک آدرس را برای ارسال انتخاب کنید.",
        variant: "destructive",
      });
      return;
    }
    if (!shippingMethod) {
      toast({
        title: "لطفاً روش ارسال را انتخاب کنید.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      addressId: selectedAddressId,
      couponId: appliedCoupon?.id,
      shippingMethodId: shippingMethod.code,
    };

    const result = await createFinalOrder(orderData);

    if (result.success && result.paymentUrl) {
      toast({ title: "در حال انتقال به صفحه پرداخت..." });
      window.location.href = result.paymentUrl;
    } else {
      toast({
        title: "خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
    }
  };

  const getButtonText = () => {
    switch (currentStep) {
      case 1:
        return "ادامه و انتخاب آدرس";
      case 2:
        return "ادامه و انتخاب روش ارسال";
      case 3:
        return "ادامه و بازبینی نهایی";
      default:
        return "پرداخت و ثبت نهایی";
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold">خلاصه پرداخت</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>جمع کل</span>
          <span>{cartTotal.toLocaleString("fa-IR")} تومان</span>
        </div>

        {appliedCoupon && (
          <div className="flex justify-between text-sm text-green-600 font-medium">
            <span>تخفیف ({appliedCoupon.code})</span>
            <span>
              -{" "}
              {(cartTotal - finalTotal + shippingCost).toLocaleString("fa-IR")}{" "}
              تومان
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm text-gray-600">
          <span>هزینه ارسال</span>
          <span>
            {currentStep < 3
              ? "در مرحله بعد محاسبه می‌شود"
              : shippingCost > 0
              ? `${shippingCost.toLocaleString("fa-IR")} تومان`
              : "رایگان"}
          </span>
        </div>

        <Separator />

        <div className="flex justify-between font-bold text-lg">
          <span>مبلغ نهایی</span>
          <span>{finalTotal.toLocaleString("fa-IR")} تومان</span>
        </div>
      </CardContent>

      {isUserLoggedIn && currentStep > 1 && (
        <CardContent className="border-t pt-4">
          <div className="space-y-2">
            <Label htmlFor="coupon" className="flex items-center gap-2">
              <PercentSquare className="w-4 h-4" />
              کد تخفیف دارید؟
            </Label>
            <div className="flex gap-2">
              <Input
                id="coupon"
                placeholder="کد تخفیف"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={!!appliedCoupon || isCouponLoading}
              />
              <Button
                onClick={handleApplyCoupon}
                disabled={isCouponLoading || !!appliedCoupon}
                className="px-6"
              >
                {isCouponLoading ? (
                  <Loader2 className="animate-spin" />
                ) : appliedCoupon ? (
                  <CheckCircle />
                ) : (
                  "اعمال"
                )}
              </Button>
            </div>
            {couponError && (
              <p className="text-xs text-red-500 mt-1">{couponError}</p>
            )}
          </div>
        </CardContent>
      )}

      <CardFooter className="flex-col gap-2 pt-4">
        {isUserLoggedIn ? (
          <>
            {currentStep < 4 ? (
              <Button className="w-full h-12 text-lg" onClick={onNextStep}>
                {getButtonText()}
                <ChevronLeft className="mr-2 h-5 w-5" />
              </Button>
            ) : (
              <Button
                className="w-full h-12 text-lg font-bold"
                onClick={handlePlaceOrder}
                disabled={isPaymentProcessing}
              >
                {isPaymentProcessing ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "پرداخت و ثبت نهایی"
                )}
              </Button>
            )}

            {currentStep > 1 && currentStep <= 4 && (
              <Button
                variant="ghost"
                className="w-full text-gray-600"
                onClick={onPrevStep}
              >
                <ChevronRight className="ml-2 h-5 w-5" />
                بازگشت به مرحله قبل
              </Button>
            )}
          </>
        ) : (
          <Button className="w-full h-12 text-lg" onClick={onNextStep}>
            ورود برای ادامه خرید
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

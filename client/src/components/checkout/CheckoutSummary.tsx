"use client";

import { useState, useMemo } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useAddressStore } from "@/store/useAddressStore";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { useToast } from "@/hooks/use-toast";
import axiosAuth from "@/lib/axios";

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
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Ticket,
  ShieldCheck,
} from "lucide-react"; // ArrowRight اضافه شد

interface AppliedCoupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
}

interface CheckoutSummaryProps {
  isUserLoggedIn: boolean;
  step: number;
  onNext: () => void;
  onPrev: () => void; // ✅ اضافه شد
}

export default function CheckoutSummary({
  isUserLoggedIn,
  step,
  onNext,
  onPrev, // ✅ دریافت پراپ
}: CheckoutSummaryProps) {
  const { toast } = useToast();
  const { items: cartItems } = useCartStore();
  const { createFinalOrder, isLoading: isPaymentProcessing } = useOrderStore();
  const { selectedAddress: selectedAddressId } = useAddressStore();
  const { shippingMethod } = useCheckoutStore();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    null
  );
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCouponLoading, setIsCouponLoading] = useState(false);

  // محاسبات مالی
  const itemsTotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cartItems]
  );

  const shippingCost = step >= 2 && shippingMethod ? shippingMethod.cost : 0;

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === "FIXED")
      return appliedCoupon.discountValue;
    return Math.round(itemsTotal * (appliedCoupon.discountValue / 100));
  }, [itemsTotal, appliedCoupon]);

  const finalTotal = Math.max(0, itemsTotal + shippingCost - discountAmount);

  // هندل کردن کد تخفیف
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
        toast({
          title: "کد تخفیف اعمال شد",
          className: "bg-green-600 text-white",
        });
      } else {
        setCouponError("کد نامعتبر است");
      }
    } catch (error: any) {
      setCouponError(error.response?.data?.message || "خطا در بررسی کد");
    } finally {
      setIsCouponLoading(false);
    }
  };

  // هندل کردن پرداخت نهایی
  const handlePlaceOrder = async () => {
    if (!selectedAddressId || !shippingMethod) {
      toast({ title: "اطلاعات ارسال ناقص است", variant: "destructive" });
      return;
    }

    const result = await createFinalOrder({
      addressId: selectedAddressId,
      couponId: appliedCoupon?.id,
      shippingMethodId: shippingMethod.code,
    });

    if (result.success && result.paymentUrl) {
      window.location.href = result.paymentUrl;
    } else {
      toast({ title: "خطا در ایجاد سفارش", variant: "destructive" });
    }
  };

  const handleMainAction = () => {
    if (step === 3) handlePlaceOrder();
    else onNext();
  };

  // متن دکمه اصلی بر اساس مرحله
  const getButtonContent = () => {
    if (step === 3 && isPaymentProcessing)
      return <Loader2 className="animate-spin" />;
    if (!isUserLoggedIn) return "ورود برای ادامه خرید";
    if (step === 1) return "ثبت سفارش و ارسال";
    if (step === 2) return "تایید و بازبینی نهایی";
    return "پرداخت آنلاین";
  };

  return (
    <Card className="shadow-lg border-0 sticky top-24 overflow-hidden">
      <CardHeader className="bg-gray-50/50 border-b pb-4">
        <CardTitle className="text-base font-bold text-gray-800">
          فاکتور نهایی
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>قیمت کالاها ({cartItems.length})</span>
            <span className="font-medium">
              {itemsTotal.toLocaleString("fa-IR")} تومان
            </span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span>هزینه ارسال</span>
            <span className="font-medium">
              {step < 2
                ? "محاسبه در مرحله بعد"
                : shippingCost === 0
                ? "رایگان"
                : `${shippingCost.toLocaleString("fa-IR")} تومان`}
            </span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between text-green-600 bg-green-50 p-2 rounded animate-in fade-in">
              <span>تخفیف کد</span>
              <span>{discountAmount.toLocaleString("fa-IR")}- تومان</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <span className="font-bold text-gray-800">مبلغ قابل پرداخت</span>
          <span className="font-bold text-xl text-primary">
            {finalTotal.toLocaleString("fa-IR")} تومان
          </span>
        </div>

        {/* بخش کد تخفیف */}
        {isUserLoggedIn && step > 1 && (
          <div className="pt-2 animate-in slide-in-from-top-2">
            <div className="relative flex items-center">
              <Ticket className="absolute right-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="کد تخفیف دارید؟"
                className="pr-9 h-10 text-sm bg-gray-50 focus:bg-white transition-colors"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={!!appliedCoupon}
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute left-1 h-8 text-xs font-bold text-primary hover:text-primary/80 hover:bg-transparent"
                onClick={handleApplyCoupon}
                disabled={isCouponLoading || !couponCode || !!appliedCoupon}
              >
                {isCouponLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  "ثبت"
                )}
              </Button>
            </div>
            {couponError && (
              <p className="text-xs text-red-500 mt-1 mr-1">{couponError}</p>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-3 bg-gray-50/30 p-4 border-t">
        {/* دکمه اصلی (بعدی) */}
        <Button
          className="w-full h-12 text-base shadow-md shadow-primary/20 hover:shadow-primary/40 transition-all"
          onClick={handleMainAction}
          disabled={step === 3 && isPaymentProcessing}
        >
          {getButtonContent()}
          {step < 3 && <ArrowLeft className="mr-2 w-4 h-4" />}
        </Button>

        {/* ✅ دکمه جدید بازگشت به مرحله قبل */}
        {step > 1 && (
          <Button
            variant="outline"
            className="w-full h-10 text-sm text-gray-600 hover:text-gray-900 border-gray-300"
            onClick={onPrev}
            disabled={isPaymentProcessing}
          >
            <ArrowRight className="ml-2 w-4 h-4" />
            بازگشت به مرحله قبل
          </Button>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-1">
          <ShieldCheck className="w-3 h-3" />
          <span>تضمین امنیت پرداخت و اصالت کالا</span>
        </div>
      </CardFooter>
    </Card>
  );
}

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
import { CheckCircle, Loader2, PercentSquare } from "lucide-react";

interface AppliedCoupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
}

export default function CheckoutSummary({
  isUserLoggedIn,
}: {
  isUserLoggedIn: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { onOpen: openAuthModal } = useAuthModalStore();
  const { items: cartItems, clearCart } = useCartStore();
  const { createFinalOrder, isLoading: isPaymentProcessing } = useOrderStore();
  const { userProfile, fetchProfile } = useUserStore();
  const selectedAddressId = useAddressStore(
    (state) =>
      state.addresses.find((a) => a.isDefault)?.id || state.addresses[0]?.id
  );

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    null
  );
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCouponLoading, setIsCouponLoading] = useState(false);

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
    if (appliedCoupon) {
      if (appliedCoupon.discountType === "FIXED") {
        return Math.max(0, cartTotal - appliedCoupon.discountValue);
      }
      const discountAmount = cartTotal * (appliedCoupon.discountValue / 100);
      return Math.round(cartTotal - discountAmount);
    }
    return cartTotal;
  }, [cartTotal, appliedCoupon]);

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

    const orderData = {
      addressId: selectedAddressId,
      couponId: appliedCoupon?.id,
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
              - {(cartTotal - finalTotal).toLocaleString("fa-IR")} تومان
            </span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>مبلغ نهایی</span>
          <span>{finalTotal.toLocaleString("fa-IR")} تومان</span>
        </div>
      </CardContent>

      {isUserLoggedIn && (
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

      <CardFooter>
        {isUserLoggedIn ? (
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
        ) : (
          <Button className="w-full h-12 text-lg" onClick={openAuthModal}>
            ورود برای ادامه خرید
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useAddressStore, Address } from "@/store/useAddressStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useUserStore } from "@/store/useUserStore";
import { useToast } from "@/hooks/use-toast";
import axiosAuth from "@/lib/axios";
import { useShallow } from "zustand/react/shallow";

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
import { MapPin, Tag, CheckCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { Label } from "@/components/ui/label";

const AddressCard = ({
  address,
  isSelected,
  onSelect,
}: {
  address: Address;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <div
    onClick={onSelect}
    className={`p-4 border rounded-lg cursor-pointer transition-all ${
      isSelected
        ? "border-primary ring-2 ring-primary"
        : "hover:border-gray-400"
    }`}
  >
    <p className="font-semibold">
      {address.name}{" "}
      {address.isDefault && (
        <span className="text-xs text-primary">(پیش‌فرض)</span>
      )}
    </p>
    <p className="text-sm text-gray-600 mt-1">
      {address.address}, {address.city}
    </p>
    <p className="text-sm text-gray-600 mt-1">
      کدپستی: {address.postalCode} | تلفن: {address.phone}
    </p>
  </div>
);

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();

  const { cartItems, clearCart } = useCartStore(
    useShallow((state) => ({
      cartItems: state.items,
      clearCart: state.clearCart,
    }))
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cartItems]
  );

  const { addresses, fetchAddresses } = useAddressStore();
  const { userProfile, fetchProfile } = useUserStore();
  const { createFinalOrder, isPaymentProcessing } = useOrderStore();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent: number;
    id: string;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCouponLoading, setIsCouponLoading] = useState(false);

  // ۱. منطق redirect به داخل useEffect منتقل شده است
  useEffect(() => {
    // اگر سبد خرید خالی است و در حال پردازش پرداخت نیستیم، کاربر را به صفحه سبد خرید برگردان
    if (cartItems.length === 0 && !isPaymentProcessing) {
      router.push("/cart");
    }
  }, [cartItems, isPaymentProcessing, router]);

  useEffect(() => {
    fetchAddresses();
    if (!userProfile) fetchProfile();
  }, [fetchAddresses, fetchProfile, userProfile]);

  useEffect(() => {
    const defaultAddress = addresses.find((a) => a.isDefault);
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
    } else if (addresses.length > 0) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses]);

  const finalTotal = useMemo(() => {
    if (appliedCoupon) {
      const discountAmount = cartTotal * (appliedCoupon.discountPercent / 100);
      return cartTotal - discountAmount;
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
      if (response.data.success) {
        setAppliedCoupon(response.data.coupon);
        toast({ title: "کد تخفیف با موفقیت اعمال شد." });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "خطایی رخ داد.";
      setCouponError(message);
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
    if (!userProfile?.id) {
      toast({ title: "خطا در شناسایی کاربر.", variant: "destructive" });
      return;
    }

    const orderData = {
      userId: userProfile.id,
      addressId: selectedAddressId,
      items: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        productName: item.name,
        productCategory: "Default",
      })),
      couponId: appliedCoupon?.id,
      total: finalTotal,
    };

    const result = await createFinalOrder(orderData);

    if (result.success && result.paymentUrl) {
      toast({ title: "در حال انتقال به صفحه پرداخت..." });
      await clearCart();
      console.log("Redirecting to payment URL:", result.paymentUrl);
      router.push(`/order-success?orderId=${result.order?.id}`);
    } else {
      toast({
        title: "خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
    }
  };

  // ۲. در حین رندر اولیه، یک اسکلت لودینگ یا null نمایش می‌دهیم تا useEffect فرصت اجرا داشته باشد
  if (cartItems.length === 0 && !isPaymentProcessing) {
    return <div>در حال انتقال...</div>; // یا کامپوننت اسکلت لودینگ
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">نهایی‌سازی خرید</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="text-primary" />
                  انتخاب آدرس ارسال
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    isSelected={selectedAddressId === addr.id}
                    onSelect={() => setSelectedAddressId(addr.id)}
                  />
                ))}
                <Button
                  variant="outline"
                  onClick={() => router.push("/account?tab=addresses")}
                >
                  مدیریت آدرس‌ها
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>خلاصه سفارش</CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 py-3 border-b last:border-b-0"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="rounded-md object-cover border"
                    />
                    <div className="flex-grow">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} عدد
                      </p>
                    </div>
                    <p className="font-semibold">
                      {(item.price * item.quantity).toLocaleString("fa-IR")}{" "}
                      تومان
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:sticky top-36">
            <Card>
              <CardHeader>
                <CardTitle>خلاصه پرداخت</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>جمع کل سبد خرید</span>
                  <span>{cartTotal.toLocaleString("fa-IR")} تومان</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>تخفیف ({appliedCoupon.discountPercent}%)</span>
                    <span>
                      - {(cartTotal - finalTotal).toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>مبلغ قابل پرداخت</span>
                  <span>{finalTotal.toLocaleString("fa-IR")} تومان</span>
                </div>
                <div className="space-y-2 pt-4">
                  <Label htmlFor="coupon">کد تخفیف</Label>
                  <div className="flex gap-2">
                    <Input
                      id="coupon"
                      placeholder="کد تخفیف خود را وارد کنید"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={!!appliedCoupon}
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={isCouponLoading || !!appliedCoupon}
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
              <CardFooter>
                <Button
                  className="w-full h-12 text-lg"
                  onClick={handlePlaceOrder}
                  disabled={isPaymentProcessing}
                >
                  {isPaymentProcessing ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "ادامه و پرداخت"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useAddressStore, Address } from "@/store/useAddressStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useUserStore } from "@/store/useUserStore";
import { useToast } from "@/hooks/use-toast";

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
import { MapPin, CheckCircle, Loader2 } from "lucide-react";
import { Label } from "../ui/label";

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

export default function CheckoutView() {
  const router = useRouter();
  const { toast } = useToast();
  const { items: cartItems, clearCart } = useCartStore();
  const { addresses, fetchAddresses } = useAddressStore();
  const userProfile = useUserStore((state) => state.userProfile);
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

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  useEffect(() => {
    const defaultAddress = addresses.find((a) => a.isDefault);
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
    } else if (addresses.length > 0) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses]);

  const cartTotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cartItems]
  );
  const finalTotal = useMemo(() => {
    if (appliedCoupon) {
      const discountAmount = cartTotal * (appliedCoupon.discountPercent / 100);
      return cartTotal - discountAmount;
    }
    return cartTotal;
  }, [cartTotal, appliedCoupon]);

  const handleApplyCoupon = async () => {
    /* ... (code from previous step) ... */
  };
  const handlePlaceOrder = async () => {
    /* ... (code from previous step) ... */
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2">
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
      </div>
      <div className="lg:sticky top-36">
        <Card>
          <CardHeader>
            <CardTitle>خلاصه پرداخت</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>جمع کل</span>
              <span>{cartTotal.toLocaleString("fa-IR")} تومان</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-green-600">
                <span>تخفیف</span>
                <span>
                  - {(cartTotal - finalTotal).toLocaleString("fa-IR")} تومان
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>قابل پرداخت</span>
              <span>{finalTotal.toLocaleString("fa-IR")} تومان</span>
            </div>
            <div className="space-y-2 pt-4">
              <Label htmlFor="coupon">کد تخفیف</Label>
              <div className="flex gap-2">
                <Input
                  id="coupon"
                  placeholder="کد تخفیف"
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
                "پرداخت و ثبت نهایی"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

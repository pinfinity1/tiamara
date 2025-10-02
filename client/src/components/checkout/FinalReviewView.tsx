// client/src/components/checkout/FinalReviewView.tsx

"use client";

import { useAddressStore } from "@/store/useAddressStore";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CartView from "./CartView";
import { Home, Truck } from "lucide-react";

const FinalReviewView = () => {
  // دریافت آدرس انتخاب شده از استور آدرس
  const selectedAddress = useAddressStore(
    (state) => state.addresses.find((a) => a.isDefault) || state.addresses[0]
  );

  // دریافت روش ارسال انتخاب شده از استور پرداخت
  const { shippingMethod } = useCheckoutStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>بازبینی نهایی سفارش</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* بخش محصولات */}
        <div>
          <h3 className="font-semibold text-lg mb-3">محصولات</h3>
          {/* نمایش دوباره سبد خرید */}
          <CartView />
        </div>

        <Separator />

        {/* بخش اطلاعات ارسال */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-lg">آدرس ارسال</h3>
          </div>
          {selectedAddress ? (
            <div className="p-4 bg-gray-50 rounded-md border text-sm text-gray-700">
              <p className="font-medium">{selectedAddress.recipientName}</p>
              <p>{`${selectedAddress.province}, ${selectedAddress.city}, ${selectedAddress.fullAddress}`}</p>
              <p>کد پستی: {selectedAddress.postalCode}</p>
              <p>شماره تماس: {selectedAddress.phone}</p>
            </div>
          ) : (
            <p className="text-red-500">آدرسی انتخاب نشده است!</p>
          )}
        </div>

        <Separator />

        {/* بخش روش ارسال */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-lg">روش ارسال</h3>
          </div>
          {shippingMethod ? (
            <div className="p-4 bg-gray-50 rounded-md border text-sm text-gray-700">
              <p className="font-medium">{shippingMethod.name}</p>
              <p>{shippingMethod.description}</p>
            </div>
          ) : (
            <p className="text-red-500">روش ارسالی انتخاب نشده است!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinalReviewView;

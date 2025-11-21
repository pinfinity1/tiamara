// client/src/components/checkout/FinalReviewView.tsx
"use client";

import { useAddressStore } from "@/store/useAddressStore";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CartView from "./CartView";
import { MapPin, Truck, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// این کامپوننت باید قابلیت ویرایش هم داشته باشد (مثلا دکمه برگشت به مرحله قبل)
interface FinalReviewViewProps {
  onEditStep: (step: number) => void;
}

const FinalReviewView = ({ onEditStep }: FinalReviewViewProps) => {
  const selectedAddress = useAddressStore((state) =>
    state.addresses.find((a) => a.id === state.selectedAddress)
  );
  const { shippingMethod } = useCheckoutStore();

  return (
    <div className="space-y-6">
      {/* کارت‌های خلاصه وضعیت */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* آدرس */}
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between py-3 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
              <MapPin className="w-4 h-4" />
              آدرس تحویل گیرنده
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-primary hover:text-primary/80 hover:bg-primary/10"
              onClick={() => onEditStep(2)}
            >
              <Edit2 className="w-3 h-3 ml-1" />
              ویرایش
            </Button>
          </CardHeader>
          <CardContent className="text-sm space-y-1 pb-3">
            {selectedAddress ? (
              <>
                <p className="font-bold text-gray-800">
                  {selectedAddress.recipientName}
                </p>
                <p className="text-gray-600 leading-tight">
                  {selectedAddress.province}، {selectedAddress.city}،{" "}
                  {selectedAddress.fullAddress}
                </p>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>کدپستی: {selectedAddress.postalCode}</span>
                  <span>تلفن: {selectedAddress.phone}</span>
                </div>
              </>
            ) : (
              <p className="text-red-500">آدرس انتخاب نشده است</p>
            )}
          </CardContent>
        </Card>

        {/* روش ارسال */}
        <Card className="bg-blue-50/50 border-blue-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between py-3 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-700">
              <Truck className="w-4 h-4" />
              روش ارسال
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100"
              onClick={() => onEditStep(2)}
            >
              <Edit2 className="w-3 h-3 ml-1" />
              ویرایش
            </Button>
          </CardHeader>
          <CardContent className="text-sm space-y-1 pb-3">
            {shippingMethod ? (
              <>
                <p className="font-bold text-gray-800">{shippingMethod.name}</p>
                <p className="text-gray-600 text-xs">
                  {shippingMethod.description}
                </p>
                <p className="mt-2 font-medium text-blue-600">
                  هزینه:{" "}
                  {shippingMethod.cost > 0
                    ? `${shippingMethod.cost.toLocaleString("fa-IR")} تومان`
                    : "رایگان / پس‌کرایه"}
                </p>
              </>
            ) : (
              <p className="text-red-500">روش ارسال انتخاب نشده است</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* لیست محصولات (فقط خواندنی‌تر شده) */}
      <div className="opacity-90">
        <h3 className="font-bold text-lg mb-3 px-2">مرور کالاها</h3>
        <CartView />
      </div>
    </div>
  );
};

export default FinalReviewView;

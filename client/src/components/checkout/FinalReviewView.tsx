// client/src/components/checkout/FinalReviewView.tsx
"use client";

import { useAddressStore } from "@/store/useAddressStore";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CartView from "./CartView";
import { MapPin, Truck, Edit2, CreditCard, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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

      <Card className="bg-yellow-50/30 border-yellow-200 shadow-sm relative overflow-hidden">
        {/* نوار رنگی سمت راست برای جلب توجه */}
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-yellow-400" />

        <CardHeader className="flex flex-row items-center justify-between py-3 pb-2 border-b border-yellow-100 bg-yellow-50/50">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-800">
            <CreditCard className="w-4 h-4 text-yellow-600" />
            شیوه پرداخت
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 text-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-yellow-600 shadow-sm border border-yellow-100">
              <Image
                src="/images/Logo/zarinpallogo.svg"
                alt="زرین‌پال"
                width={40}
                height={40}
                className="object-contain w-full h-full"
              />
            </div>
            <div>
              <p className="font-bold text-gray-800">
                پرداخت اینترنتی (زرین‌‌پال)
              </p>
              <p className="text-[11px] text-gray-500">
                پرداخت امن به وسیله کلیه کارت های عضو شتاب
              </p>
            </div>
          </div>

          {/* ⚠️ بخش هشدار VPN */}
          <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-100/50 p-2.5 rounded-md border border-amber-200">
            <WifiOff className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">
              لطفاً برای جلوگیری از خطای بانکی، قبل از پرداخت{" "}
              <strong>فیلترشکن (VPN)</strong> خود را خاموش کنید.
            </p>
          </div>

          <div className="text-[10px] text-gray-400 text-center">
            انتقال امن به درگاه شاپرک
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinalReviewView;

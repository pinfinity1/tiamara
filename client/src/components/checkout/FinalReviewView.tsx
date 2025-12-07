"use client";

import { useAddressStore } from "@/store/useAddressStore";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CartView from "./CartView";
import { MapPin, Truck, Edit2, CreditCard, Wallet, Copy } from "lucide-react"; // آیکون‌ها
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // حتماً از شادسی‌ان ایمپورت شود
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast"; // برای کپی کردن شماره کارت

interface FinalReviewViewProps {
  onEditStep: (step: number) => void;
}

const FinalReviewView = ({ onEditStep }: FinalReviewViewProps) => {
  const selectedAddress = useAddressStore((state) =>
    state.addresses.find((a) => a.id === state.selectedAddress)
  );
  const { shippingMethod, paymentMethod, setPaymentMethod } =
    useCheckoutStore();
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "کپی شد" });
  };

  return (
    <div className="space-y-6">
      {/* ... (کارت آدرس و روش ارسال بدون تغییر می‌مانند) ... */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* کارت آدرس */}
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          {/* ... محتوای قبلی آدرس ... */}
          <CardHeader className="flex flex-row items-center justify-between py-3 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
              <MapPin className="w-4 h-4" />
              آدرس تحویل گیرنده
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(2)}>
              <Edit2 className="w-3 h-3 ml-1" /> ویرایش
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
              </>
            ) : (
              <p className="text-red-500">انتخاب نشده</p>
            )}
          </CardContent>
        </Card>

        {/* کارت روش ارسال */}
        <Card className="bg-blue-50/50 border-blue-100 shadow-sm">
          {/* ... محتوای قبلی روش ارسال ... */}
          <CardHeader className="flex flex-row items-center justify-between py-3 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-700">
              <Truck className="w-4 h-4" />
              روش ارسال
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1 pb-3">
            {shippingMethod ? (
              <p className="font-bold text-gray-800">
                {shippingMethod.name} -{" "}
                {shippingMethod.cost.toLocaleString("fa-IR")} تومان
              </p>
            ) : (
              <p className="text-red-500">انتخاب نشده</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="opacity-90">
        <h3 className="font-bold text-lg mb-3 px-2">مرور کالاها</h3>
        <CartView />
      </div>

      {/* ✅ بخش جدید: انتخاب روش پرداخت */}
      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="bg-gray-50 border-b py-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gray-600" />
            انتخاب روش پرداخت
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <RadioGroup
            value={paymentMethod}
            onValueChange={(val) =>
              setPaymentMethod(val as "CREDIT_CARD" | "CARD_TO_CARD")
            }
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* گزینه ۱: پرداخت آنلاین */}
            <div
              className={`relative flex items-center space-x-3 space-x-reverse rounded-xl border-2 p-4 cursor-pointer transition-all ${
                paymentMethod === "CREDIT_CARD"
                  ? "border-primary bg-primary/5"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <RadioGroupItem
                value="CREDIT_CARD"
                id="credit_card"
                className="mt-1"
              />
              <Label htmlFor="credit_card" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border shadow-sm">
                    <Image
                      src="/images/Logo/zarinpallogo.svg"
                      alt="زرین‌پال"
                      width={24}
                      height={24}
                    />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">پرداخت اینترنتی</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      پرداخت امن با کلیه کارت‌های عضو شتاب
                    </p>
                  </div>
                </div>
              </Label>
            </div>

            {/* گزینه ۲: کارت به کارت */}
            <div
              className={`relative flex items-center space-x-3 space-x-reverse rounded-xl border-2 p-4 cursor-pointer transition-all ${
                paymentMethod === "CARD_TO_CARD"
                  ? "border-primary bg-primary/5"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <RadioGroupItem
                value="CARD_TO_CARD"
                id="card_to_card"
                className="mt-1"
              />
              <Label htmlFor="card_to_card" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border shadow-sm text-gray-600">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">کارت به کارت</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      ثبت سفارش و آپلود فیش واریزی
                    </p>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {/* نمایش اطلاعات حساب اگر کارت به کارت انتخاب شده باشد */}
          {paymentMethod === "CARD_TO_CARD" && (
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
              <h4 className="text-sm font-bold text-amber-900 mb-3 text-center">
                اطلاعات حساب جهت واریز
              </h4>
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-sm flex items-center gap-3 min-w-[280px]">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">
                      شماره کارت (بانک ملت)
                    </p>
                    <p className="font-mono text-lg font-bold text-gray-800 tracking-wider">
                      ۶۱۰۴ ۳۳۷۸ ۱۲۳۴ ۵۶۷۸
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      به نام: تیامارا (فلانی)
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy("6104337812345678")}
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-amber-700/80 text-center mt-3">
                * لطفاً پس از واریز مبلغ نهایی، در مرحله بعد تصویر فیش واریزی را
                بارگذاری نمایید.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinalReviewView;

"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const orderId = searchParams.get("orderId");
  const refId = searchParams.get("refId");
  const message = searchParams.get("message");
  const { clearCart } = useCartStore();

  useEffect(() => {
    if (status === "success") {
      clearCart();
    }
  }, [status, clearCart]);

  const renderContent = () => {
    switch (status) {
      case "success":
        return (
          <div className="text-center text-green-600">
            <CheckCircle className="mx-auto h-16 w-16" />
            <h1 className="mt-4 text-2xl font-bold">پرداخت موفق</h1>
            <p className="mt-2 text-gray-700">
              سفارش شما با موفقیت ثبت شد و در حال پردازش است.
            </p>
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-semibold">شماره سفارش:</span> {orderId}
              </p>
              <p>
                <span className="font-semibold">کد رهگیری:</span> {refId}
              </p>
            </div>
          </div>
        );
      case "failed":
        return (
          <div className="text-center text-red-600">
            <XCircle className="mx-auto h-16 w-16" />
            <h1 className="mt-4 text-2xl font-bold">پرداخت ناموفق</h1>
            <p className="mt-2 text-gray-700">
              متاسفانه مشکلی در فرآیند پرداخت به وجود آمد.
            </p>
            <p className="mt-2 text-xs text-gray-500">
              علت: {message || "خطای نامشخص"}
            </p>
          </div>
        );
      case "cancelled":
        return (
          <div className="text-center text-yellow-600">
            <AlertTriangle className="mx-auto h-16 w-16" />
            <h1 className="mt-4 text-2xl font-bold">پرداخت لغو شد</h1>
            <p className="mt-2 text-gray-700">
              شما فرآیند پرداخت را لغو کردید. سفارش شما ناتمام باقی ماند.
            </p>
          </div>
        );
      default:
        return <p>در حال بررسی وضعیت پرداخت...</p>;
    }
  };

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-md">
        {renderContent()}
        <Button asChild className="mt-8 w-full">
          <Link href="/account?tab=orders">بازگشت به حساب کاربری</Link>
        </Button>
      </div>
    </div>
  );
}

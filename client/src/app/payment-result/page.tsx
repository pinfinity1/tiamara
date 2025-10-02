"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";

// کامپوننت اصلی که منطق را در خود دارد
const PaymentResultContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCartStore();

  const [status, setStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<string>(
    "در حال بررسی وضعیت پرداخت..."
  );
  const [orderId, setOrderId] = useState<string | null>(null);
  const [refId, setRefId] = useState<string | null>(null);

  useEffect(() => {
    const paymentStatus = searchParams.get("status");
    const paymentOrderId = searchParams.get("orderId");
    const paymentRefId = searchParams.get("refId");
    const paymentMessage = searchParams.get("message");

    setStatus(paymentStatus);
    setOrderId(paymentOrderId);
    setRefId(paymentRefId);

    if (paymentStatus === "success") {
      setMessage("پرداخت شما با موفقیت انجام شد. از خرید شما سپاسگزاریم.");
      clearCart();
    } else if (paymentStatus === "failed") {
      setMessage(
        paymentMessage === "Verification_failed"
          ? "تایید پرداخت با خطا مواجه شد. در صورت کسر وجه، مبلغ تا ۷۲ ساعت آینده به حساب شما باز خواهد گشت."
          : "پرداخت ناموفق بود. خطایی در فرآیند پرداخت رخ داد."
      );
    } else if (paymentStatus === "cancelled") {
      setMessage("شما از ادامه فرآیند پرداخت انصراف دادید.");
    } else {
      setMessage("وضعیت پرداخت نامشخص است.");
    }
  }, [searchParams, clearCart]);

  const renderIcon = () => {
    if (status === "success") {
      return <CheckCircle className="w-16 h-16 text-green-500" />;
    }
    if (status === "failed") {
      return <XCircle className="w-16 h-16 text-red-500" />;
    }
    if (status === "cancelled") {
      return <AlertTriangle className="w-16 h-16 text-yellow-500" />;
    }
    return <Loader2 className="w-16 h-16 animate-spin text-gray-500" />;
  };

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <CardTitle className="flex flex-col items-center gap-4">
            {renderIcon()}
            <span className="text-2xl font-bold">نتیجه پرداخت</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg">{message}</p>
          {orderId && (
            <div className="text-sm text-gray-600">
              <p>
                <span>شماره سفارش: </span>
                <span className="font-mono">{orderId}</span>
              </p>
            </div>
          )}
          {refId && (
            <div className="text-sm text-gray-600">
              <p>
                <span>شماره پیگیری: </span>
                <span className="font-mono">{refId}</span>
              </p>
            </div>
          )}
          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={() => router.push("/")}>
              بازگشت به صفحه اصلی
            </Button>
            {status === "success" && (
              <Button asChild variant="outline">
                <Link href="/account?tab=orders">مشاهده سفارشات</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const PaymentResultPage = () => {
  return (
    <Suspense
      fallback={<div className="text-center p-10">در حال بارگذاری...</div>}
    >
      <PaymentResultContent />
    </Suspense>
  );
};

export default PaymentResultPage;

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Check,
  X,
  AlertTriangle,
  Loader2,
  ArrowRight,
  ShoppingBag,
  RefreshCcw,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const PaymentResultContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCartStore();
  const { toast } = useToast();

  const [status, setStatus] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [refId, setRefId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const paymentStatus = searchParams.get("status");
    const paymentOrderId = searchParams.get("orderId");
    const paymentRefId = searchParams.get("refId");
    const paymentMessage = searchParams.get("message");

    setStatus(paymentStatus);
    setOrderId(paymentOrderId);
    setRefId(paymentRefId);

    // پاک کردن سبد خرید فقط در صورت موفقیت
    if (paymentStatus === "success") {
      clearCart();
      setMessage("سفارش شما با موفقیت ثبت شد و به زودی پردازش می‌شود.");
    } else if (paymentStatus === "failed") {
      setMessage(
        paymentMessage === "Verification_failed"
          ? "تایید پرداخت با خطا مواجه شد. اگر مبلغی کسر شده، تا ۷۲ ساعت به حساب شما برمی‌گردد."
          : "پرداخت ناموفق بود. لطفا مجددا تلاش کنید."
      );
    } else if (paymentStatus === "cancelled") {
      setMessage("شما از ادامه فرآیند پرداخت انصراف دادید.");
    }
  }, [searchParams, clearCart]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "کپی شد!", duration: 1500 });
  };

  // رندر کردن بر اساس وضعیت
  const renderContent = () => {
    if (!status) {
      return (
        <div className="flex flex-col items-center py-10">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-gray-500">در حال دریافت وضعیت پرداخت...</p>
        </div>
      );
    }

    const isSuccess = status === "success";
    const isFailed = status === "failed";

    return (
      <div className="text-center">
        {/* آیکون وضعیت با انیمیشن */}
        <div className="relative mb-6 inline-block">
          <div
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center mx-auto border-4",
              isSuccess
                ? "bg-green-50 border-green-100 text-green-600"
                : isFailed
                ? "bg-red-50 border-red-100 text-red-600"
                : "bg-yellow-50 border-yellow-100 text-yellow-600"
            )}
          >
            {isSuccess ? (
              <Check className="w-10 h-10" />
            ) : isFailed ? (
              <X className="w-10 h-10" />
            ) : (
              <AlertTriangle className="w-10 h-10" />
            )}
          </div>
          {/* افکت موج‌دار برای موفقیت */}
          {isSuccess && (
            <div className="absolute inset-0 rounded-full border-green-200 border-4 animate-ping opacity-20" />
          )}
        </div>

        {/* عنوان و پیام */}
        <h1
          className={cn(
            "text-2xl font-bold mb-2",
            isSuccess
              ? "text-green-700"
              : isFailed
              ? "text-red-700"
              : "text-yellow-700"
          )}
        >
          {isSuccess
            ? "پرداخت موفقیت‌آمیز بود"
            : isFailed
            ? "پرداخت ناموفق"
            : "پرداخت لغو شد"}
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed px-4">{message}</p>

        {/* جزئیات سفارش (کارت اطلاعات) */}
        <div className="bg-gray-50/80 rounded-xl border border-gray-100 p-4 mb-8 space-y-3 text-sm">
          {orderId && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500">شماره سفارش:</span>
              <div className="flex items-center gap-2 font-mono font-medium text-gray-800">
                {orderId}
                <button
                  onClick={() => copyToClipboard(orderId)}
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {refId && (
            <div className="flex justify-between items-center">
              <span className="text-gray-500">کد پیگیری بانکی:</span>
              <div className="flex items-center gap-2 font-mono font-medium text-gray-800">
                {refId}
                <button
                  onClick={() => copyToClipboard(refId)}
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-gray-200/60">
            <span className="text-gray-500">زمان تراکنش:</span>
            <span className="font-medium text-gray-800" dir="ltr">
              {new Date().toLocaleTimeString("fa-IR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* دکمه‌ها */}
        <div className="flex flex-col gap-3">
          {isSuccess ? (
            <>
              <Button
                asChild
                size="lg"
                className="w-full h-12 text-base shadow-md shadow-green-200"
              >
                <Link href="/account?tab=orders">
                  <ShoppingBag className="w-5 h-5 ml-2" />
                  پیگیری سفارش
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full h-12"
              >
                <Link href="/">بازگشت به فروشگاه</Link>
              </Button>
            </>
          ) : (
            <>
              <Button
                size="lg"
                onClick={() => router.push("/checkout")}
                className="w-full h-12 text-base"
              >
                <RefreshCcw className="w-5 h-5 ml-2" />
                تلاش مجدد پرداخت
              </Button>
              <Button asChild variant="ghost" size="lg" className="w-full h-12">
                <Link href="/">
                  <ArrowRight className="w-5 h-5 ml-2" />
                  بازگشت به صفحه اصلی
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="border-0 shadow-xl shadow-gray-100/50 w-full overflow-hidden relative">
      {/* نوار رنگی بالای کارت */}
      <div
        className={cn(
          "h-2 w-full absolute top-0 left-0 right-0",
          status === "success"
            ? "bg-green-500"
            : status === "failed"
            ? "bg-red-500"
            : "bg-yellow-500"
        )}
      />

      <CardContent className="pt-12 pb-8 px-6 md:px-10">
        {renderContent()}
      </CardContent>

      {/* پاورقی مربوط به ایمیل کاملاً حذف شد */}
    </Card>
  );
};

// رپ کردن در Suspense برای جلوگیری از خطای بیلد در نکست
const PaymentResultPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
};

export default PaymentResultPage;

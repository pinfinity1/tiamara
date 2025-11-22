"use client";

import { useEffect } from "react";
import { useOrderStore, Order } from "@/store/useOrderStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns-jalali";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Truck,
  CreditCard,
  Copy,
  Calendar,
  Package,
  ChevronLeft,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// --- هلپر برای وضعیت سفارش ---
const getStatusConfig = (status: Order["status"]) => {
  switch (status) {
    case "PENDING":
      return {
        label: "در انتظار پرداخت",
        color: "bg-gray-100 text-gray-600 border-gray-200",
        icon: Clock,
      };
    case "PROCESSING":
      return {
        label: "در حال پردازش",
        color: "bg-amber-50 text-amber-600 border-amber-200",
        icon: Package,
      };
    case "SHIPPED":
      return {
        label: "ارسال شده",
        color: "bg-blue-50 text-blue-600 border-blue-200",
        icon: Truck,
      };
    case "DELIVERED":
      return {
        label: "تحویل شده",
        color: "bg-green-50 text-green-600 border-green-200",
        icon: CheckCircle2,
      };
    default:
      return { label: status, color: "bg-gray-100", icon: Clock };
  }
};

// --- مودال جزئیات ---
const OrderDetailsModal = ({ order }: { order: Order }) => {
  const { toast } = useToast();

  const subtotal = order.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const couponDiscount = order.coupon ? subtotal - order.total : 0;
  // محاسبه هزینه ارسال با اطمینان از عدد بودن
  const shippingCost = order.shippingMethod?.cost || 0;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "کپی شد", duration: 1500 });
  };

  return (
    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl">
          جزئیات سفارش{" "}
          <span className="font-mono text-primary">#{order.orderNumber}</span>
        </DialogTitle>
      </DialogHeader>
      <div className="py-2 space-y-6">
        {/* وضعیت پرداخت */}
        <div
          className={cn(
            "p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4",
            order.paymentStatus === "COMPLETED"
              ? "bg-green-50 border-green-100"
              : "bg-red-50 border-red-100"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-full",
                order.paymentStatus === "COMPLETED"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              )}
            >
              {order.paymentStatus === "COMPLETED" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <p
                className={cn(
                  "font-bold",
                  order.paymentStatus === "COMPLETED"
                    ? "text-green-700"
                    : "text-red-700"
                )}
              >
                {order.paymentStatus === "COMPLETED"
                  ? "پرداخت موفق"
                  : "پرداخت ناموفق / در انتظار"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {order.paymentStatus === "COMPLETED"
                  ? "سفارش شما ثبت و تایید شده است."
                  : "سفارش هنوز پرداخت نشده است."}
              </p>
            </div>
          </div>
          {order.paymentRefId && (
            <div className="flex items-center gap-2 bg-white/60 p-2 rounded border border-black/5">
              <span className="text-xs text-gray-500">کد پیگیری:</span>
              <span className="font-mono font-bold text-gray-800 text-sm">
                {order.paymentRefId}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => copyToClipboard(order.paymentRefId!)}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {/* اطلاعات ارسال */}
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
            <Truck className="w-4 h-4 text-gray-500" />
            اطلاعات تحویل
          </h3>
          {order.address ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="block text-xs text-gray-400 mb-1">
                  گیرنده:
                </span>
                <span className="text-gray-800 font-medium">
                  {order.address.name}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-400 mb-1">
                  شماره تماس:
                </span>
                <span className="font-mono" dir="ltr">
                  {order.address.phone}
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="block text-xs text-gray-400 mb-1">آدرس:</span>
                <span>
                  {order.address.province}، {order.address.city}،{" "}
                  {order.address.address}
                </span>
              </div>
              <div className="md:col-span-2 flex gap-4 pt-2 border-t border-dashed mt-1">
                <span>
                  <span className="text-gray-400 text-xs">کد پستی:</span>{" "}
                  {order.address.postalCode}
                </span>
                <span>
                  <span className="text-gray-400 text-xs">روش ارسال:</span>{" "}
                  {order.shippingMethod?.name || "نامشخص"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-red-500 text-sm">آدرس یافت نشد.</p>
          )}
        </div>

        {/* لیست محصولات */}
        <div>
          <h3 className="font-bold text-gray-800 mb-3 text-sm">اقلام سفارش</h3>
          <div className="border rounded-lg divide-y">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 hover:bg-gray-50"
              >
                <div className="relative w-14 h-14 border rounded-md overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={
                      item.product?.images?.[0]?.url ||
                      "/images/placeholder.png"
                    }
                    alt={item.productName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-medium text-sm text-gray-800 truncate">
                    {item.productName}
                  </p>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                      x{item.quantity}
                    </span>
                    <span>فی: {item.price.toLocaleString("fa-IR")}</span>
                  </div>
                </div>
                <p className="font-bold text-sm text-gray-800">
                  {(item.quantity * item.price).toLocaleString("fa-IR")}{" "}
                  <span className="text-[10px] font-normal text-gray-500">
                    تومان
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* فاکتور نهایی */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>جمع کل کالاها</span>
            <span>{subtotal.toLocaleString("fa-IR")} تومان</span>
          </div>
          {couponDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>تخفیف کد ({order.coupon?.code})</span>
              <span>{couponDiscount.toLocaleString("fa-IR")}- تومان</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>هزینه ارسال</span>
            <span>
              {shippingCost > 0
                ? `${shippingCost.toLocaleString("fa-IR")} تومان`
                : "رایگان"}
            </span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between items-center font-bold text-lg text-gray-900">
            <span>مبلغ پرداخت شده</span>
            <span>{order.total.toLocaleString("fa-IR")} تومان</span>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

// --- کامپوننت کارت سفارش ---
const OrderCard = ({ order }: { order: Order }) => {
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  // نمایش حداکثر ۴ تصویر محصول
  const previewImages = order.items.slice(0, 4);
  const remainingCount = order.items.length - 4;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200 border-gray-200">
      {/* هدر کارت: شماره و وضعیت */}
      <div className="flex flex-wrap items-center justify-between p-4 bg-gray-50/50 border-b border-gray-100 gap-3">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-full", statusConfig.color)}>
            <StatusIcon className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">شماره سفارش</span>
            <span className="font-bold font-mono text-gray-800 text-lg">
              #{order.orderNumber}
            </span>
          </div>
        </div>
        <Badge variant="outline" className={cn("h-7 px-3", statusConfig.color)}>
          {statusConfig.label}
        </Badge>
      </div>

      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-4">
          {/* اطلاعات تاریخ و مبلغ */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>تاریخ ثبت:</span>
              <span className="text-gray-700 font-medium">
                {format(new Date(order.createdAt), "yyyy/MM/dd")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CreditCard className="w-4 h-4" />
              <span>مبلغ کل:</span>
              <span className="text-gray-700 font-bold">
                {order.total.toLocaleString("fa-IR")} تومان
              </span>
            </div>
          </div>

          {/* تصاویر محصولات (Preview) */}
          <div className="flex items-center gap-2">
            {previewImages.map((item) => (
              <div
                key={item.id}
                className="relative w-10 h-10 rounded-md border overflow-hidden bg-white shrink-0"
              >
                <Image
                  src={
                    item.product?.images?.[0]?.url || "/images/placeholder.png"
                  }
                  alt={item.productName}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
            {remainingCount > 0 && (
              <div className="w-10 h-10 rounded-md border bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                +{remainingCount}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="text-primary hover:text-primary hover:bg-primary/5 gap-1"
            >
              مشاهده جزئیات و فاکتور
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <OrderDetailsModal order={order} />
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default function UserOrders() {
  const { userOrders, getOrdersByUserId, isLoading } = useOrderStore();

  useEffect(() => {
    getOrdersByUserId();
  }, [getOrdersByUserId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-40 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (userOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white border border-dashed border-gray-300 rounded-xl text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-800">
          لیست سفارشات خالی است
        </h3>
        <p className="text-gray-500 mt-1 max-w-xs mx-auto text-sm">
          شما هنوز هیچ سفارشی ثبت نکرده‌اید. برای مشاهده محصولات به فروشگاه
          بروید.
        </p>
        <Button asChild className="mt-6" variant="outline">
          <a href="/products">مشاهده فروشگاه</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {userOrders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

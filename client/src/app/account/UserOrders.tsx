// client/src/app/account/UserOrders.tsx

"use client";

import { useEffect, useState } from "react";
import { useOrderStore, Order } from "@/store/useOrderStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Truck } from "lucide-react";

// تابع برای ترجمه و رنگ‌بندی وضعیت سفارش
const getStatusBadge = (status: Order["status"]) => {
  switch (status) {
    case "PENDING":
      return <Badge variant="secondary">در انتظار پرداخت</Badge>;
    case "PROCESSING":
      return <Badge className="bg-yellow-500 text-white">در حال پردازش</Badge>;
    case "SHIPPED":
      return <Badge className="bg-blue-500 text-white">ارسال شده</Badge>;
    case "DELIVERED":
      return <Badge className="bg-green-500 text-white">تحویل داده شده</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// کامپوننت جدید برای نمایش جزئیات سفارش در مودال
const OrderDetailsModal = ({ order }: { order: Order }) => {
  // محاسبه جمع مبلغ محصولات قبل از تخفیف
  const subtotal = order.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  // محاسبه مقدار تخفیف اعمال شده از کد تخفیف
  const couponDiscount = order.coupon ? subtotal - order.total : 0;

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>جزئیات سفارش #{order.orderNumber}</DialogTitle>
      </DialogHeader>
      <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Shipping Info */}
        <div>
          <h3 className="font-semibold mb-2">اطلاعات ارسال</h3>
          <div className="text-sm text-gray-700 space-y-3">
            {order.address ? (
              <div className="flex gap-4">
                <div>
                  <p className="font-medium">آدرس تحویل:</p>
                  <p>{order.address.name}</p>
                  <p>
                    {order.address.address}, {order.address.city}, کدپستی:{" "}
                    {order.address.postalCode}
                  </p>
                  <p>تلفن: {order.address.phone}</p>
                </div>
              </div>
            ) : (
              <p>آدرس برای این سفارش ثبت نشده است.</p>
            )}
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <p className="font-medium">نوع ارسال:</p>
              <p>{order.shippingMethod?.name || "نامشخص"}</p>
            </div>
          </div>
        </div>
        <Separator />
        {/* Items */}
        <div>
          <h3 className="font-semibold mb-2">محصولات</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <Image
                  src={
                    item.product?.images?.[0]?.url || "/images/placeholder.png"
                  }
                  alt={item.productName}
                  width={64}
                  height={64}
                  className="rounded-md border object-cover"
                />
                <div className="flex-grow">
                  <p className="font-medium text-sm">{item.productName}</p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} عدد × {item.price.toLocaleString("fa-IR")}{" "}
                    تومان
                  </p>
                </div>
                <p className="font-semibold text-sm">
                  {(item.quantity * item.price).toLocaleString("fa-IR")} تومان
                </p>
              </div>
            ))}
          </div>
        </div>
        <Separator />
        {/* Summary */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">جمع مبلغ محصولات:</span>
            <span>{subtotal.toLocaleString("fa-IR")} تومان</span>
          </div>
          {couponDiscount > 0 && order.coupon && (
            <div className="flex justify-between text-green-600">
              <span>تخفیف با کد ({order.coupon.code}):</span>
              <span>- {couponDiscount.toLocaleString("fa-IR")} تومان</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base pt-2">
            <span>مبلغ نهایی:</span>
            <span>{order.total.toLocaleString("fa-IR")} تومان</span>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

export default function UserOrders() {
  const { userOrders, getOrdersByUserId, isLoading } = useOrderStore();

  useEffect(() => {
    getOrdersByUserId();
  }, [getOrdersByUserId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>سفارشات من</CardTitle>
        <CardDescription>
          تاریخچه تمام سفارشات شما در اینجا قابل مشاهده است.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>در حال بارگذاری سفارشات...</p>
        ) : userOrders.length === 0 ? (
          <div className="text-center p-4 bg-gray-50 rounded-md">
            <p>شما هنوز هیچ سفارشی ثبت نکرده‌اید.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop View: Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>شماره سفارش</TableHead>
                    <TableHead>تاریخ</TableHead>
                    <TableHead>مبلغ کل</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead className="text-left">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">
                        #{order.orderNumber}
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.createdAt), "yyyy/MM/dd")}
                      </TableCell>
                      <TableCell>
                        {order.total.toLocaleString("fa-IR")} تومان
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-left">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              مشاهده جزئیات
                            </Button>
                          </DialogTrigger>
                          <OrderDetailsModal order={order} />
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile View: Cards */}
            <div className="md:hidden space-y-4">
              {userOrders.map((order) => (
                <Card key={order.id} className="bg-white">
                  <CardHeader className="flex flex-row justify-between items-center pb-2">
                    <CardTitle className="text-sm font-bold">
                      سفارش #{order.orderNumber}
                    </CardTitle>
                    {getStatusBadge(order.status)}
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>تاریخ:</span>
                      <span>
                        {format(new Date(order.createdAt), "yyyy/MM/dd")}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>مبلغ کل:</span>
                      <span>{order.total.toLocaleString("fa-IR")} تومان</span>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="secondary" className="w-full mt-2">
                          مشاهده جزئیات
                        </Button>
                      </DialogTrigger>
                      <OrderDetailsModal order={order} />
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

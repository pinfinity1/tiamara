// client/src/app/account/UserOrders.tsx

"use client";

import { useEffect } from "react";
import { useOrderStore, Order } from "@/store/useOrderStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns-jalali";

// یک تابع برای ترجمه و رنگ‌بندی وضعیت سفارش
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
          <Accordion type="single" collapsible className="w-full space-y-4">
            {userOrders.map((order) => (
              <AccordionItem
                value={order.id}
                key={order.id}
                className="border rounded-lg px-4 bg-white"
              >
                <AccordionTrigger>
                  <div className="flex justify-between w-full items-center text-sm">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">شماره سفارش:</span>
                      <span className="text-xs font-mono">
                        {order.id.substring(0, 8)}...
                      </span>
                    </div>
                    <div className="hidden sm:block">
                      {format(new Date(order.createdAt), "yyyy/MM/dd")}
                    </div>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="border-t pt-4 mt-2">
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center text-sm"
                        >
                          <p>
                            {item.productName}{" "}
                            <span className="text-gray-500 text-xs">
                              (x{item.quantity})
                            </span>
                          </p>
                          <p>{item.price.toLocaleString("fa-IR")} تومان</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end font-bold text-base mt-4 pt-2 border-t">
                      <p>
                        مبلغ کل: {order.total.toLocaleString("fa-IR")} تومان
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}

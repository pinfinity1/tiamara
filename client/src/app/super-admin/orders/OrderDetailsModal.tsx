"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useOrderStore,
  OrderStatus,
  statusTranslations,
  paymentStatusTranslations,
  getPaymentStatusVariant,
} from "@/store/useOrderStore";
import { useShallow } from "zustand/react/shallow";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns-jalali";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Copy, CreditCard } from "lucide-react";

export default function OrderDetailsModal() {
  const { selectedOrder, setSelectedOrder, updateOrderStatus, isLoading } =
    useOrderStore(
      useShallow((state) => ({
        selectedOrder: state.selectedOrder,
        setSelectedOrder: state.setSelectedOrder,
        updateOrderStatus: state.updateOrderStatus,
        isLoading: state.isLoading,
      }))
    );

  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const orderId = selectedOrder?.id;

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!orderId) return;
    setIsUpdating(true);
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      toast({
        title: "موفق",
        description: "وضعیت سفارش با موفقیت به‌روزرسانی شد.",
      });
    } else {
      toast({
        title: "خطا",
        description: "خطا در به‌روزرسانی وضعیت سفارش.",
        variant: "destructive",
      });
    }
    setIsUpdating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "کپی شد", duration: 1000 });
  };

  const isDataReady = selectedOrder && !isLoading;

  return (
    <Dialog
      open={!!selectedOrder}
      onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            جزئیات سفارش{" "}
            <span className="font-mono text-primary">
              #{selectedOrder?.orderNumber}
            </span>
          </DialogTitle>
          <DialogDescription>
            ثبت شده در تاریخ{" "}
            {selectedOrder
              ? format(new Date(selectedOrder.createdAt), "yyyy/MM/dd HH:mm")
              : "..."}
          </DialogDescription>
        </DialogHeader>

        {!isDataReady ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="grid gap-6 py-4">
            {/* ✅ بخش جدید: اطلاعات فنی تراکنش (مخصوص ادمین) */}
            <Card className="bg-yellow-50/50 border-yellow-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-yellow-800">
                  <CreditCard className="w-4 h-4" />
                  اطلاعات فنی تراکنش (ادمین)
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 text-xs">وضعیت پرداخت:</span>
                  <Badge
                    className={`w-fit ${getPaymentStatusVariant(
                      selectedOrder.paymentStatus
                    )}`}
                  >
                    {paymentStatusTranslations[selectedOrder.paymentStatus]}
                  </Badge>
                </div>

                {/* Authority */}
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 text-xs">
                    Authority (شناسه شروع):
                  </span>
                  <div className="flex items-center gap-2 bg-white border p-1 rounded px-2 font-mono text-xs">
                    <span className="truncate max-w-[200px]">
                      {selectedOrder.paymentAuthority || "---"}
                    </span>
                    {selectedOrder.paymentAuthority && (
                      <Copy
                        className="w-3 h-3 cursor-pointer text-gray-400 hover:text-black"
                        onClick={() =>
                          copyToClipboard(selectedOrder.paymentAuthority!)
                        }
                      />
                    )}
                  </div>
                </div>

                {/* RefID */}
                <div className="flex flex-col gap-1">
                  <span className="text-gray-500 text-xs">
                    RefID (کد پیگیری بانک):
                  </span>
                  <div className="flex items-center gap-2 bg-white border p-1 rounded px-2 font-mono text-xs font-bold text-gray-800">
                    <span>{selectedOrder.paymentRefId || "---"}</span>
                    {selectedOrder.paymentRefId && (
                      <Copy
                        className="w-3 h-3 cursor-pointer text-gray-400 hover:text-black"
                        onClick={() =>
                          copyToClipboard(selectedOrder.paymentRefId!)
                        }
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer & Address Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">اطلاعات مشتری</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>
                    <strong>نام:</strong> {selectedOrder.user.name}
                  </p>
                  <p>
                    <strong>ایمیل:</strong> {selectedOrder.user.email}
                  </p>
                  <p>
                    <strong>تلفن:</strong>{" "}
                    <span dir="ltr">
                      {selectedOrder.user.phone || "ثبت نشده"}
                    </span>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">آدرس ارسال</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p>{selectedOrder.address.address}</p>
                  <p>
                    استان {selectedOrder.address.country}، شهر{" "}
                    {selectedOrder.address.city}
                  </p>
                  <p>کد پستی: {selectedOrder.address.postalCode}</p>
                </CardContent>
              </Card>
            </div>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">اقلام سفارش</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">تصویر</TableHead>
                      <TableHead>نام محصول</TableHead>
                      <TableHead className="text-center">تعداد</TableHead>
                      <TableHead className="text-center">قیمت واحد</TableHead>
                      <TableHead className="text-left">جمع کل</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Image
                            src={
                              item.product?.images[0]?.url ||
                              "/images/placeholder.png"
                            }
                            alt={item.productName}
                            width={60}
                            height={60}
                            className="rounded-md object-cover"
                          />
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/products/${item.product?.slug || ""}`}
                            className="font-medium hover:underline"
                            target="_blank"
                          >
                            {item.productName}
                          </Link>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.price.toLocaleString("fa-IR")}
                        </TableCell>
                        <TableCell className="text-left font-semibold">
                          {(item.price * item.quantity).toLocaleString("fa-IR")}{" "}
                          تومان
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Financials & Status */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">خلاصه مالی</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span>جمع کل اقلام:</span>
                    <span>
                      {selectedOrder.total.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                  {selectedOrder.coupon && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>تخفیف ({selectedOrder.coupon.code}):</span>
                      <span>
                        -{" "}
                        {selectedOrder.coupon.discountValue.toLocaleString(
                          "fa-IR"
                        )}{" "}
                        تومان
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between items-center text-base font-bold">
                    <span>مبلغ نهایی پرداخت:</span>
                    <span>
                      {selectedOrder.total.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">مدیریت وضعیت</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <span>وضعیت فعلی:</span>
                    <Badge variant="outline">
                      {statusTranslations[selectedOrder.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="font-semibold whitespace-nowrap">
                      تغییر وضعیت:
                    </label>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(val: OrderStatus) =>
                        handleStatusChange(val)
                      }
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(statusTranslations).map((s) => (
                          <SelectItem key={s} value={s}>
                            {statusTranslations[s as OrderStatus]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

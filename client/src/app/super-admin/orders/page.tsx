"use client";

import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  useOrderStore,
  Order,
  OrderStatus,
  PaymentStatus,
  statusTranslations,
  paymentStatusTranslations,
  getPaymentStatusVariant,
} from "@/store/useOrderStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, Search, X } from "lucide-react";
import { format } from "date-fns-jalali";
import { useDebounce } from "@/hooks/use-debounce";
import OrderDetailsModal from "./OrderDetailsModal";

export default function AdminOrdersPage() {
  // --- START OF CHANGES ---
  const { adminOrders, isLoading, fetchOrdersForAdmin, setSelectedOrder } =
    useOrderStore(
      useShallow((state) => ({
        adminOrders: state.adminOrders, // Use the correct state property
        isLoading: state.isLoading,
        fetchOrdersForAdmin: state.fetchOrdersForAdmin, // Use the new function name
        setSelectedOrder: state.setSelectedOrder,
      }))
    );

  // --- END OF CHANGES ---

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    fetchOrdersForAdmin({
      status: statusFilter,
      paymentStatus: paymentStatusFilter,
      search: debouncedSearch,
    });
  }, [fetchOrdersForAdmin, statusFilter, paymentStatusFilter, debouncedSearch]);

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPaymentStatusFilter("");
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">مدیریت سفارشات</h1>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="جستجو (شماره سفارش، نام، ایمیل...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="وضعیت سفارش" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">همه وضعیت‌ها</SelectItem>
            {Object.keys(statusTranslations).map((s) => (
              <SelectItem key={s} value={s}>
                {statusTranslations[s as OrderStatus]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={paymentStatusFilter}
          onValueChange={setPaymentStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="وضعیت پرداخت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">همه وضعیت‌ها</SelectItem>
            {Object.keys(paymentStatusTranslations).map((s) => (
              <SelectItem key={s} value={s}>
                {paymentStatusTranslations[s as PaymentStatus]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" onClick={handleClearFilters}>
          <X className="h-4 w-4 mr-2" />
          پاک کردن فیلترها
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>شماره سفارش</TableHead>
              <TableHead>مشتری</TableHead>
              <TableHead>تاریخ</TableHead>
              <TableHead>مبلغ کل</TableHead>
              <TableHead>وضعیت پرداخت</TableHead>
              <TableHead>وضعیت سفارش</TableHead>
              <TableHead className="text-left">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  در حال بارگذاری...
                </TableCell>
              </TableRow>
            ) : adminOrders.length > 0 ? ( // Use adminOrders
              adminOrders.map(
                (
                  order // Use adminOrders
                ) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono">
                      #{order.orderNumber}
                    </TableCell>
                    <TableCell>{order.user.name || "کاربر مهمان"}</TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), "yyyy/MM/dd")}
                    </TableCell>
                    <TableCell>
                      {order.total.toLocaleString("fa-IR")} تومان
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getPaymentStatusVariant(order.paymentStatus)}
                      >
                        {paymentStatusTranslations[order.paymentStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {statusTranslations[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-left">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              )
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  سفارشی یافت نشد.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <OrderDetailsModal />
    </div>
  );
}

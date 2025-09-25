"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useDashboardStore } from "@/store/useDashboardStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Users,
  Package,
  CreditCard,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { format } from "date-fns-jalali";
import { Skeleton } from "@/components/ui/skeleton";

const StatCard = ({
  title,
  value,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  isLoading: boolean;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-3/4" />
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
    </CardContent>
  </Card>
);

function SuperAdminDashboard() {
  const { stats, isLoading, fetchDashboardStats } = useDashboardStore(
    useShallow((state) => ({
      stats: state.stats,
      isLoading: state.isLoading,
      fetchDashboardStats: state.fetchDashboardStats,
    }))
  );

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">داشبورد</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="مجموع درآمد"
          value={`${(stats?.totalRevenue || 0).toLocaleString("fa-IR")} تومان`}
          icon={CreditCard}
          isLoading={isLoading}
        />
        <StatCard
          title="تعداد کل سفارشات"
          value={(stats?.totalOrders || 0).toLocaleString("fa-IR")}
          icon={Package}
          isLoading={isLoading}
        />
        <StatCard
          title="تعداد مشتریان"
          value={(stats?.totalCustomers || 0).toLocaleString("fa-IR")}
          icon={Users}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              سفارشات اخیر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>مشتری</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead className="text-left">مبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-5 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-20" />
                        </TableCell>
                        <TableCell className="text-left">
                          <Skeleton className="h-5 w-16" />
                        </TableCell>
                      </TableRow>
                    ))
                  : stats?.recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="font-medium">
                            {order.user?.name || "کاربر مهمان"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(
                              new Date(order.createdAt),
                              "yyyy/MM/dd HH:mm"
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.status}</Badge>
                        </TableCell>
                        <TableCell className="text-left">
                          {order.total.toLocaleString("fa-IR")} تومان
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-amber-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              محصولات با موجودی کم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام محصول</TableHead>
                  <TableHead className="text-center">
                    موجودی باقی‌مانده
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                        <TableCell className="text-center">
                          <Skeleton className="h-5 w-10 mx-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  : stats?.lowStockProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell className="text-center font-bold text-red-600">
                          {product.stock}
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;

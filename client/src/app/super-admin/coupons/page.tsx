"use client";

import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useCouponStore } from "@/store/useCouponStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Edit } from "lucide-react";
import { format } from "date-fns-jalali";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import CouponForm from "./CouponForm";

export default function AdminCouponsPage() {
  const { coupons, isLoading, fetchCoupons, deleteCoupon, setSelectedCoupon } =
    useCouponStore(
      useShallow((state) => ({
        coupons: state.coupons,
        isLoading: state.isLoading,
        fetchCoupons: state.fetchCoupons,
        deleteCoupon: state.deleteCoupon,
        setSelectedCoupon: state.setSelectedCoupon,
      }))
    );

  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleDelete = async (id: string) => {
    const success = await deleteCoupon(id);
    if (success) {
      toast({ title: "موفق", description: "کوپن با موفقیت حذف شد." });
    } else {
      toast({
        title: "خطا",
        description: "خطا در حذف کوپن.",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (coupon: any) => {
    setSelectedCoupon(coupon);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setSelectedCoupon(null);
    setIsFormOpen(true);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">مدیریت کدهای تخفیف</h1>
        <Button onClick={handleAddClick}>
          <PlusCircle className="ml-2 h-4 w-4" />
          افزودن کوپن جدید
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>کد</TableHead>
              <TableHead>نوع تخفیف</TableHead>
              <TableHead>مقدار تخفیف</TableHead>
              <TableHead>تاریخ انقضا</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>استفاده شده / سقف</TableHead>
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
            ) : coupons.length > 0 ? (
              coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-semibold">
                    {coupon.code}
                  </TableCell>
                  <TableCell>
                    {coupon.discountType === "FIXED" ? "مبلغ ثابت" : "درصدی"}
                  </TableCell>
                  <TableCell>
                    {coupon.discountType === "FIXED"
                      ? `${coupon.discountValue.toLocaleString("fa-IR")} تومان`
                      : `${coupon.discountValue}%`}
                  </TableCell>
                  <TableCell>
                    {format(new Date(coupon.expireDate), "yyyy/MM/dd")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={coupon.isActive ? "default" : "destructive"}
                    >
                      {coupon.isActive ? "فعال" : "غیرفعال"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {coupon.usageCount} / {coupon.usageLimit}
                  </TableCell>
                  <TableCell className="text-left">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(coupon)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
                          <AlertDialogDescription>
                            این عمل قابل بازگشت نیست. با حذف این کوپن، دیگر کسی
                            قادر به استفاده از آن نخواهد بود.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>انصراف</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(coupon.id)}
                          >
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  هیچ کوپنی یافت نشد.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {useCouponStore.getState().selectedCoupon
                ? "ویرایش کوپن"
                : "افزودن کوپن جدید"}
            </DialogTitle>
          </DialogHeader>
          <CouponForm onFinished={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

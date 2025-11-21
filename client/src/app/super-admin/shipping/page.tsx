"use client";

import { useEffect, useState } from "react";
import { useShippingStore, ShippingMethod } from "@/store/useShippingStore";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Pencil, Trash2, Truck } from "lucide-react";
import { ShippingMethodForm } from "@/components/super-admin/shipping/ShippingMethodForm";

export default function ShippingManagementPage() {
  const {
    shippingMethods,
    isLoading,
    fetchShippingMethods,
    createShippingMethod,
    updateShippingMethod,
    deleteShippingMethod,
  } = useShippingStore();

  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(
    null
  );

  useEffect(() => {
    fetchShippingMethods();
  }, [fetchShippingMethods]);

  const handleAddNew = () => {
    setEditingMethod(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (method: ShippingMethod) => {
    setEditingMethod(method);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (values: any) => {
    let success;
    if (editingMethod) {
      success = await updateShippingMethod(editingMethod.id, values);
      if (success) toast({ title: "روش ارسال ویرایش شد" });
    } else {
      success = await createShippingMethod(values);
      if (success) toast({ title: "روش ارسال جدید ایجاد شد" });
    }

    if (success) {
      setIsDialogOpen(false);
    } else {
      toast({ title: "خطا در انجام عملیات", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteShippingMethod(id);
    if (success) {
      toast({ title: "حذف شد", description: "روش ارسال با موفقیت حذف گردید." });
    } else {
      toast({
        title: "خطا",
        description: "مشکلی در حذف رخ داد.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-bold">مدیریت روش‌های ارسال</h1>
        </div>
        <Button onClick={handleAddNew}>
          <PlusCircle className="ml-2 h-4 w-4" />
          افزودن روش جدید
        </Button>
      </div>

      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام روش</TableHead>
              <TableHead>کد (Code)</TableHead>
              <TableHead>هزینه ارسال</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>توضیحات</TableHead>
              <TableHead className="text-left">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-24 text-gray-500"
                >
                  در حال بارگذاری...
                </TableCell>
              </TableRow>
            ) : shippingMethods.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-24 text-gray-500"
                >
                  هیچ روش ارسالی تعریف نشده است.
                </TableCell>
              </TableRow>
            ) : (
              shippingMethods.map((method) => (
                <TableRow key={method.id}>
                  <TableCell className="font-medium">{method.name}</TableCell>
                  <TableCell className="font-mono text-xs text-gray-500">
                    {method.code}
                  </TableCell>
                  <TableCell>
                    {method.cost === 0 ? (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 hover:bg-green-100 border-0"
                      >
                        رایگان / پس‌کرایه
                      </Badge>
                    ) : (
                      `${method.cost.toLocaleString("fa-IR")} تومان`
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={method.isActive ? "default" : "destructive"}
                    >
                      {method.isActive ? "فعال" : "غیرفعال"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm max-w-xs truncate">
                    {method.description || "-"}
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(method)}
                      >
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              آیا مطمئن هستید؟
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              این روش ارسال ({method.name}) حذف خواهد شد. این
                              عملیات غیرقابل بازگشت است.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>انصراف</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDelete(method.id)}
                            >
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {editingMethod ? "ویرایش روش ارسال" : "افزودن روش ارسال جدید"}
            </DialogTitle>
          </DialogHeader>
          <ShippingMethodForm
            defaultValues={editingMethod}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            buttonText={editingMethod ? "ذخیره تغییرات" : "ایجاد روش"}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

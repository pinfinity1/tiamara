"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAddressStore, Address } from "@/store/useAddressStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  PlusCircle,
  Edit,
  Trash2,
  Home,
  User,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

const addressSchema = z.object({
  recipientName: z.string().min(3, "نام گیرنده الزامی است."),
  fullAddress: z.string().min(10, "آدرس کامل الزامی است."),
  city: z.string().min(2, "نام شهر الزامی است."),
  province: z.string().min(2, "نام استان الزامی است."),
  postalCode: z.string().regex(/^\d{10}$/, "کدپستی باید ۱۰ رقمی باشد."),
  phone: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست."),
  isDefault: z.boolean(),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface UserAddressesProps {
  isDialogMode?: boolean;
  onDialogClose?: () => void;
}

export default function UserAddresses({
  isDialogMode = false,
  onDialogClose,
}: UserAddressesProps) {
  const {
    addresses,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    isLoading,
  } = useAddressStore();
  const { toast } = useToast();

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      recipientName: "",
      fullAddress: "",
      city: "",
      province: "",
      postalCode: "",
      phone: "",
      isDefault: false,
    },
  });

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const { defaultAddress, otherAddresses } = useMemo(() => {
    const defaultAddr = addresses.find((addr) => addr.isDefault) || null;
    const otherAddrs = addresses.filter((addr) => !addr.isDefault);
    return { defaultAddress: defaultAddr, otherAddresses: otherAddrs };
  }, [addresses]);

  const handleAddNew = () => {
    setEditingAddress(null);
    reset({
      recipientName: "",
      fullAddress: "",
      city: "",
      province: "",
      postalCode: "",
      phone: "",
      isDefault: addresses.length === 0,
    });
    setIsFormDialogOpen(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    reset(address);
    setIsFormDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteAddress(id);
    if (success) {
      toast({ title: "آدرس با موفقیت حذف شد." });
    } else {
      toast({ title: "خطا در حذف آدرس.", variant: "destructive" });
    }
  };

  const handleSetDefault = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await setDefaultAddress(id);
    toast({ title: "آدرس پیش‌فرض با موفقیت تغییر کرد." });
  };

  const onSubmit = async (data: AddressFormData) => {
    const result = editingAddress
      ? await updateAddress(editingAddress.id, data)
      : await createAddress({
          ...data,
          isDefault: addresses.length === 0 || data.isDefault,
        });

    if (result) {
      toast({
        title: `آدرس با موفقیت ${editingAddress ? "ویرایش" : "ذخیره"} شد.`,
      });
      setIsFormDialogOpen(false);
      if (isDialogMode && onDialogClose) {
        onDialogClose();
      }
    } else {
      toast({
        title: `خطا در ${editingAddress ? "ویرایش" : "ذخیره"} آدرس.`,
        variant: "destructive",
      });
    }
  };

  const AddressCardComponent = ({
    address,
    isDefault = false,
  }: {
    address: Address;
    isDefault?: boolean;
  }) => (
    <div
      className={cn(
        "border p-4 rounded-lg transition-colors",
        isDefault && "bg-primary/5 border-primary/20"
      )}
    >
      {!isDefault && (
        <Button
          className="mb-4"
          variant="outline"
          size="sm"
          onClick={(e) => handleSetDefault(e, address.id)}
        >
          انتخاب به عنوان پیش‌فرض
        </Button>
      )}
      <div className="flex justify-between items-start mb-4">
        <p className="font-semibold text-lg flex items-center">
          <User className="w-5 h-5 ml-2 text-gray-600" />
          {address.recipientName}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(address)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    آیا از حذف این آدرس مطمئن هستید؟
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    این عمل غیرقابل بازگشت است.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>انصراف</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(address.id)}>
                    بله، حذف کن
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm text-gray-600">
        <div className="flex items-center">
          <strong className="whitespace-nowrap">استان / شهر:</strong>
          <span className="mr-2">
            {address.province} / {address.city}
          </span>
        </div>
        <div className="flex items-center">
          <strong className="whitespace-nowrap">کد پستی:</strong>
          <span className="mr-2">{address.postalCode}</span>
        </div>
        <div className="flex items-center">
          <strong className="whitespace-nowrap">شماره تماس:</strong>
          <span className="mr-2" dir="ltr">
            {address.phone}
          </span>
        </div>
        <div className="flex col-span-full">
          <strong className="whitespace-nowrap">آدرس کامل:</strong>
          <span className="mr-2">{address.fullAddress}</span>
        </div>
      </div>
    </div>
  );

  const mainContent = (
    <>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>آدرس‌های من</CardTitle>
        <Button onClick={handleAddNew}>
          <PlusCircle className="ml-2 h-4 w-4" /> افزودن آدرس جدید
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading && addresses.length === 0 ? (
          <p>در حال بارگذاری آدرس‌ها...</p>
        ) : addresses.length === 0 ? (
          <p>شما هنوز آدرسی ثبت نکرده‌اید.</p>
        ) : (
          <>
            {defaultAddress && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-semibold text-primary">
                  <Home className="h-4 w-4" />
                  آدرس پیش‌فرض
                </Label>
                <AddressCardComponent
                  address={defaultAddress}
                  isDefault={true}
                />
              </div>
            )}

            {otherAddresses.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                <Label className="font-semibold text-gray-700">
                  سایر آدرس‌ها
                </Label>
                {otherAddresses.map((addr) => (
                  <AddressCardComponent key={addr.id} address={addr} />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </>
  );

  const dialogOnlyContent = (
    <div className="pt-4">
      {isLoading ? (
        <p>در حال بارگذاری آدرس‌ها...</p>
      ) : addresses.length === 0 ? (
        <p className="text-center py-4">
          شما هنوز آدرسی ثبت نکرده‌اید. برای ادامه یک آدرس جدید اضافه کنید.
        </p>
      ) : null}
      <div className="flex justify-end">
        <Button onClick={handleAddNew}>
          <PlusCircle className="ml-2 h-4 w-4" /> افزودن آدرس جدید
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {isDialogMode ? (
        <div className="p-4">{dialogOnlyContent}</div>
      ) : (
        <Card>{mainContent}</Card>
      )}

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "ویرایش آدرس" : "افزودن آدرس جدید"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="recipientName">نام گیرنده</Label>
              <Input id="recipientName" {...register("recipientName")} />
              {errors.recipientName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.recipientName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="fullAddress">آدرس کامل</Label>
              <Input id="fullAddress" {...register("fullAddress")} />
              {errors.fullAddress && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.fullAddress.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">شهر</Label>
                <Input id="city" {...register("city")} />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.city.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="province">استان</Label>
                <Input id="province" {...register("province")} />
                {errors.province && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.province.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postalCode">کدپستی</Label>
                <Input id="postalCode" {...register("postalCode")} />
                {errors.postalCode && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.postalCode.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">شماره تماس</Label>
                <Input id="phone" {...register("phone")} dir="ltr" />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Controller
                control={control}
                name="isDefault"
                render={({ field }) => (
                  <Switch
                    id="isDefault"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    dir="ltr"
                  />
                )}
              />
              <Label htmlFor="isDefault">انتخاب به عنوان آدرس پیش‌فرض</Label>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  انصراف
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "در حال ذخیره..." : "ذخیره آدرس"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

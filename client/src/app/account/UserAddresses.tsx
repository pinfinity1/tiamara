"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { allProvinces, citiesOfProvince } from "iran-city";
import { useSession } from "next-auth/react";

import { useAddressStore, Address } from "@/store/useAddressStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const addressSchema = z.object({
  recipientName: z.string().min(3, "نام گیرنده باید حداقل ۳ حرف باشد."),
  province: z.string().min(1, "لطفاً استان را انتخاب کنید."),
  city: z.string().min(1, "لطفاً شهر را انتخاب کنید."),
  fullAddress: z.string().min(10, "آدرس پستی باید کامل و دقیق باشد."),
  postalCode: z.string().regex(/^\d{10}$/, "کد پستی باید دقیقاً ۱۰ رقم باشد."),
  phone: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست"),
  isDefault: z.boolean().optional(),
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
  const { data: session } = useSession();
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
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(
    null
  );

  const provincesList: any[] = useMemo(() => allProvinces(), []);

  const citiesList: any[] = useMemo(() => {
    if (!selectedProvinceId) return [];
    return citiesOfProvince(selectedProvinceId);
  }, [selectedProvinceId]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      recipientName: "",
      fullAddress: "",
      city: "",
      province: "",
      postalCode: "",
      phone: session?.user?.phone || "",
      isDefault: false,
    },
  });

  useEffect(() => {
    if (!isDialogMode) fetchAddresses();
  }, [fetchAddresses, isDialogMode]);

  // ✅ افکت جدید: اگر در حالت دیالوگ هستیم و آدرسی وجود ندارد، شماره کاربر را ست کن
  useEffect(() => {
    if (isDialogMode && addresses.length === 0 && session?.user?.phone) {
      reset({
        recipientName: "",
        fullAddress: "",
        city: "",
        province: "",
        postalCode: "",
        phone: session.user.phone,
        isDefault: true, // چون اولین آدرس است، پیش‌فرض باشد
      });
    }
  }, [isDialogMode, addresses.length, session, reset]);

  const { defaultAddress, otherAddresses } = useMemo(() => {
    const defaultAddr = addresses.find((addr) => addr.isDefault) || null;
    const otherAddrs = addresses.filter((addr) => !addr.isDefault);
    return { defaultAddress: defaultAddr, otherAddresses: otherAddrs };
  }, [addresses]);

  const handleAddNew = () => {
    setEditingAddress(null);
    setSelectedProvinceId(null);
    reset({
      recipientName: "",
      fullAddress: "",
      city: "",
      province: "",
      postalCode: "",
      // اینجا هم مطمئن می‌شویم که شماره ست شود
      phone: session?.user?.phone || "",
      isDefault: addresses.length === 0,
    });
    setIsFormDialogOpen(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    const prov = provincesList.find((p: any) => p.name === address.province);
    if (prov) setSelectedProvinceId(prov.id);
    reset({ ...address, postalCode: address.postalCode });
    setIsFormDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteAddress(id);
    if (success) toast({ title: "آدرس حذف شد." });
  };

  const handleSetDefault = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await setDefaultAddress(id);
    toast({ title: "آدرس پیش‌فرض شد." });
  };

  const onSubmit = async (data: AddressFormData) => {
    const payload = { ...data, isDefault: data.isDefault || false };
    const result = editingAddress
      ? await updateAddress(editingAddress.id, payload)
      : await createAddress({
          ...payload,
          isDefault: addresses.length === 0 || payload.isDefault,
        });

    if (result) {
      toast({ title: editingAddress ? "آدرس ویرایش شد." : "آدرس ثبت شد." });
      setIsFormDialogOpen(false);
      if (isDialogMode && onDialogClose) onDialogClose();
    }
  };

  // --- اجزای UI ---
  const AddressCard = ({
    address,
    isDefault = false,
  }: {
    address: Address;
    isDefault?: boolean;
  }) => (
    <div
      className={cn(
        "border p-4 rounded-lg transition-all hover:shadow-sm relative group",
        isDefault && "bg-primary/5 border-primary/30"
      )}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="font-bold text-gray-800">
            {address.recipientName}
          </span>
          {isDefault && (
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              پیش‌فرض
            </span>
          )}
        </div>
        <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
          {!isDefault && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-primary"
              title="پیش‌فرض"
              onClick={(e) => handleSetDefault(e, address.id)}
            >
              <Home className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-blue-600"
            onClick={() => handleEdit(address)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle>حذف آدرس</AlertDialogTitle>
                <AlertDialogDescription>
                  آیا مطمئن هستید؟
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>خیر</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600"
                  onClick={() => handleDelete(address.id)}
                >
                  بله، حذف کن
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div className="text-sm text-gray-600 space-y-1">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 mt-1 text-gray-400" />
          <span>
            {address.province}، {address.city}، {address.fullAddress}
          </span>
        </div>
        <div className="flex gap-4 pr-6">
          <span className="flex items-center gap-1">
            <Mail className="w-3 h-3" />
            {address.postalCode}
          </span>
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            <span dir="ltr">{address.phone}</span>
          </span>
        </div>
      </div>
    </div>
  );

  const dialogContent = (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>نام گیرنده</Label>
          <Input {...register("recipientName")} autoComplete="name" />
          <p className="text-red-500 text-xs">
            {errors.recipientName?.message}
          </p>
        </div>
        <div className="space-y-2">
          <Label>شماره موبایل</Label>
          <Input
            {...register("phone")}
            dir="ltr"
            type="tel"
            autoComplete="tel"
          />
          <p className="text-red-500 text-xs">{errors.phone?.message}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>استان</Label>
          <Controller
            control={control}
            name="province"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(val) => {
                  const p = provincesList.find((x: any) => x.name === val);
                  if (p) {
                    setSelectedProvinceId(p.id);
                    field.onChange(p.name);
                    setValue("city", "");
                  }
                }}
                autoComplete="address-level1"
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب استان" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {provincesList.map((p: any) => (
                    <SelectItem key={p.id} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-red-500 text-xs">{errors.province?.message}</p>
        </div>
        <div className="space-y-2">
          <Label>شهر</Label>
          <Controller
            control={control}
            name="city"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedProvinceId}
                autoComplete="address-level2"
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب شهر" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {citiesList.map((c: any) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-red-500 text-xs">{errors.city?.message}</p>
        </div>
      </div>
      <div className="space-y-2">
        <Label>آدرس کامل</Label>
        <Textarea {...register("fullAddress")} autoComplete="street-address" />
        <p className="text-red-500 text-xs">{errors.fullAddress?.message}</p>
      </div>

      <div className="space-y-2 md:w-1/2">
        <Label>کد پستی</Label>
        <Input
          {...register("postalCode")}
          placeholder="۱۰ رقم"
          dir="ltr"
          type="tel"
          inputMode="numeric"
          autoComplete="postal-code"
        />
        {errors.postalCode && (
          <p className="text-red-500 text-xs">{errors.postalCode.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Controller
          control={control}
          name="isDefault"
          render={({ field }) => (
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
        <Label>آدرس پیش‌فرض</Label>
      </div>
    </div>
  );

  if (isDialogMode) {
    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        {isLoading && addresses.length === 0 ? (
          <div className="flex justify-center p-4">
            <Loader2 className="animate-spin" />
          </div>
        ) : addresses.length === 0 || isFormDialogOpen ? (
          <>
            {" "}
            {dialogContent}{" "}
            <div className="flex justify-end gap-2 mt-4">
              {addresses.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormDialogOpen(false)}
                >
                  انصراف
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "..." : "ثبت"}
              </Button>
            </div>{" "}
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                آدرس ارسال را انتخاب یا ایجاد کنید.
              </p>
              <Button size="sm" onClick={handleAddNew}>
                <PlusCircle className="w-4 h-4 ml-1" /> جدید
              </Button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto px-1">
              {addresses.map((addr) => (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  isDefault={addr.isDefault}
                />
              ))}
            </div>
          </div>
        )}
      </form>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>آدرس‌های من</CardTitle>
          <Button onClick={handleAddNew}>
            <PlusCircle className="ml-2 h-4 w-4" /> افزودن آدرس
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : addresses.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              هنوز آدرسی ثبت نکرده‌اید.
            </p>
          ) : (
            <>
              {defaultAddress && (
                <AddressCard address={defaultAddress} isDefault={true} />
              )}
              {otherAddresses.map((addr) => (
                <AddressCard key={addr.id} address={addr} />
              ))}
            </>
          )}
        </CardContent>
      </Card>
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingAddress ? "ویرایش" : "افزودن"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            {dialogContent}
            <DialogFooter className="mt-4">
              <Button type="submit" disabled={isLoading}>
                ذخیره
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

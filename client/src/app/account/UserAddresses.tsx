// client/src/app/account/UserAddresses.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
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
import { PlusCircle, Edit, Trash2, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const initialFormState: Omit<Address, "id"> = {
  name: "",
  address: "",
  city: "",
  country: "ایران",
  postalCode: "",
  phone: "",
  isDefault: false,
};

const AddressCard = ({
  address,
  isDefault = false,
  onEdit,
  onDelete,
}: {
  address: Address;
  isDefault?: boolean;
  onEdit: (addr: Address) => void;
  onDelete: (id: string) => void;
}) => (
  <div
    className={cn(
      "border p-4 rounded-lg flex justify-between items-start transition-colors",
      isDefault && "bg-primary/5 border-primary/20"
    )}
  >
    <div className="space-y-2">
      <p className="font-semibold">{address.name}</p>
      <p className="text-sm text-gray-600">
        {address.address}, {address.city}
      </p>
      <p className="text-sm text-gray-600">
        کدپستی: {address.postalCode} | تلفن: {address.phone}
      </p>
    </div>
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" onClick={() => onEdit(address)}>
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
            <AlertDialogAction onClick={() => onDelete(address.id)}>
              بله، حذف کن
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>
);

export default function UserAddresses() {
  const {
    addresses,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    isLoading,
  } = useAddressStore();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState(initialFormState);

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
    setFormData(initialFormState);
    setIsDialogOpen(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      address: address.address,
      city: address.city,
      country: address.country,
      postalCode: address.postalCode,
      phone: address.phone,
      isDefault: address.isDefault,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteAddress(id);
    if (success) {
      toast({ title: "آدرس با موفقیت حذف شد." });
      fetchAddresses();
    } else {
      toast({ title: "خطا در حذف آدرس.", variant: "destructive" });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const result = editingAddress
      ? await updateAddress(editingAddress.id, formData)
      : await createAddress({
          ...formData,
          isDefault: addresses.length === 0 || formData.isDefault,
        });

    if (result) {
      toast({
        title: `آدرس با موفقیت ${editingAddress ? "ویرایش" : "ذخیره"} شد.`,
      });
      setIsDialogOpen(false);
    } else {
      toast({
        title: `خطا در ${editingAddress ? "ویرایش" : "ذخیره"} آدرس.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>آدرس‌های من</CardTitle>
        <Button onClick={handleAddNew}>
          <PlusCircle className="ml-2 h-4 w-4" /> افزودن آدرس جدید
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
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
                <AddressCard
                  address={defaultAddress}
                  isDefault={true}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            )}

            {otherAddresses.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                <Label className="font-semibold text-gray-700">
                  سایر آدرس‌ها
                </Label>
                {otherAddresses.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "ویرایش آدرس" : "افزودن آدرس جدید"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">عنوان آدرس (مثلا: خانه)</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="address">آدرس کامل</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">شهر</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="postalCode">کدپستی</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">شماره تماس</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                dir="ltr"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Switch
                id="isDefault"
                dir="ltr"
                checked={formData.isDefault}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isDefault: checked })
                }
              />
              <Label htmlFor="isDefault">انتخاب به عنوان آدرس پیش‌فرض</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                انصراف
              </Button>
            </DialogClose>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "در حال ذخیره..." : "ذخیره آدرس"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

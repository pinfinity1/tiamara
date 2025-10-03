"use client";

import { useEffect, useState } from "react";
import { useAddressStore } from "@/store/useAddressStore";
import UserAddresses from "@/app/account/UserAddresses";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { PlusCircle, User, MapPin, Mail, Phone } from "lucide-react";

const CheckoutView = () => {
  const {
    addresses,
    isLoading,
    fetchAddresses,
    selectedAddress,
    setSelectedAddress,
    setDefaultAddress,
  } = useAddressStore();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // 1. دریافت آدرس‌ها هنگام بارگذاری کامپوننت
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // 2. این بخش کلیدی منطق شماست
  // مودال فقط زمانی باز می‌شود که بارگذاری تمام شده (`!isLoading`) و هیچ آدرسی وجود نداشته باشد (`addresses.length === 0`)
  useEffect(() => {
    if (!isLoading && addresses.length === 0) {
      setIsAddressModalOpen(true);
    }
  }, [isLoading, addresses.length]);

  const handleSetDefault = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await setDefaultAddress(id);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>آدرس ارسال</CardTitle>
          {/* دکمه افزودن آدرس فقط زمانی نمایش داده می‌شود که کاربر آدرسی داشته باشد */}
          {addresses.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddressModalOpen(true)}
            >
              <PlusCircle className="ml-2 h-4 w-4" />
              افزودن آدرس
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>در حال بارگذاری آدرس‌ها...</p>
          ) : addresses.length > 0 ? (
            // اگر آدرس وجود دارد، لیست آن‌ها نمایش داده می‌شود
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedAddress === address.id
                      ? "border-primary ring-2 ring-primary"
                      : "hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedAddress(address.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <p className="font-semibold text-lg flex items-center">
                      <User className="w-5 h-5 ml-2 text-gray-600" />
                      {address.recipientName}
                    </p>
                    {address.isDefault ? (
                      <span className="text-xs font-semibold text-primary py-1 px-2.5 bg-primary/10 rounded-full">
                        پیش‌فرض
                      </span>
                    ) : (
                      selectedAddress === address.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleSetDefault(e, address.id)}
                        >
                          انتخاب به عنوان پیش‌فرض
                        </Button>
                      )
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 ml-2" />
                      <strong>استان / شهر:</strong>
                      <span className="mr-2">
                        {address.province} / {address.city}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 ml-2" />
                      <strong>کد پستی:</strong>
                      <span className="mr-2">{address.postalCode}</span>
                    </div>
                    <div className="flex items-center col-span-full">
                      <MapPin className="w-4 h-4 ml-2" />
                      <strong>آدرس کامل:</strong>
                      <span className="mr-2">{address.fullAddress}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 ml-2" />
                      <strong>شماره تماس:</strong>
                      <span className="mr-2" dir="ltr">
                        {address.phone}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // اگر آدرسی وجود ندارد، این پیام نمایش داده می‌شود
            <div className="text-center py-10">
              <p className="mb-4">برای ادامه، لطفا یک آدرس ارسال اضافه کنید.</p>
              {/* این دکمه مودالی را باز می‌کند که از قبل به خاطر نبود آدرس باز شده است */}
              <Button onClick={() => setIsAddressModalOpen(true)}>
                افزودن اولین آدرس
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* تنظیمات مودال */}
      <Dialog
        open={isAddressModalOpen}
        // اگر کاربر آدرسی داشته باشد، می‌تواند مودال را ببندد
        onOpenChange={addresses.length > 0 ? setIsAddressModalOpen : undefined}
      >
        <DialogContent
          className="max-w-3xl"
          // اگر کاربر هیچ آدرسی نداشته باشد، نمی‌تواند با کلیک بیرون یا دکمه Esc مودال را ببندد
          onPointerDownOutside={(e) => {
            if (addresses.length === 0) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (addresses.length === 0) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {addresses.length > 0
                ? "افزودن آدرس جدید"
                : "لطفا آدرس خود را وارد کنید"}
            </DialogTitle>
          </DialogHeader>
          <UserAddresses
            isDialogMode={true}
            onDialogClose={() => setIsAddressModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CheckoutView;

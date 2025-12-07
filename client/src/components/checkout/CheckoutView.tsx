"use client";

import { useEffect, useState } from "react";
import { useAddressStore } from "@/store/useAddressStore";
import UserAddresses from "@/app/account/UserAddresses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlusCircle, User, MapPin, Mail, Phone, Map } from "lucide-react";

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

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleSetDefault = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await setDefaultAddress(id);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>آدرس ارسال</CardTitle>

          {/* ✅ اصلاح شد: دکمه هدر فقط وقتی نمایش داده می‌شود که حداقل یک آدرس وجود داشته باشد */}
          {!isLoading && addresses.length > 0 && (
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
            <p className="text-center py-4 text-gray-500">
              در حال بارگذاری آدرس‌ها...
            </p>
          ) : addresses.length > 0 ? (
            // === حالت ۱: نمایش لیست آدرس‌ها ===
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedAddress === address.id
                      ? "border-primary ring-2 ring-primary bg-primary/5"
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
                          variant="ghost"
                          size="sm"
                          className="text-xs"
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
                      <span className="text-gray-500 ml-1">استان / شهر:</span>
                      <span>
                        {address.province} / {address.city}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 ml-2" />
                      <span className="text-gray-500 ml-1">کد پستی:</span>
                      <span className="font-mono">{address.postalCode}</span>
                    </div>
                    <div className="flex items-center col-span-full">
                      <MapPin className="w-4 h-4 ml-2" />
                      <span className="text-gray-500 ml-1">آدرس کامل:</span>
                      <span>{address.fullAddress}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 ml-2" />
                      <span className="text-gray-500 ml-1">شماره تماس:</span>
                      <span className="font-mono" dir="ltr">
                        {address.phone}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // === حالت ۲: لیست خالی (Empty State) ===
            // در این حالت فقط همین یک دکمه نمایش داده می‌شود
            <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <Map className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-900 font-medium mb-1">
                لیست آدرس‌ها خالی است
              </p>
              <p className="text-gray-500 text-sm mb-6">
                برای ادامه خرید، لطفا یک آدرس جدید ثبت کنید.
              </p>

              <Button
                onClick={() => setIsAddressModalOpen(true)}
                className="gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                افزودن اولین آدرس
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>افزودن آدرس جدید</DialogTitle>
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

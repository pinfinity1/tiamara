// client/src/app/checkout/ShippingMethodSelection.tsx

"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import axiosAuth from "@/lib/axios"; // استفاده از axios خودتان
import { Skeleton } from "@/components/ui/skeleton"; // برای نمایش حالت لودینگ

// اینترفیس را برای همخوانی با مدل دیتابیس به‌روز می‌کنیم
interface ShippingMethod {
  id: string;
  code: string;
  name: string;
  description: string | null;
  cost: number;
}

const ShippingMethodSelection = () => {
  const { shippingMethod, setShippingMethod } = useCheckoutStore();
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        setIsLoading(true);
        const response = await axiosAuth.get<ShippingMethod[]>("/shipping");
        setMethods(response.data);
        // اگر هیچ روشی انتخاب نشده بود، اولین مورد را به عنوان پیش‌فرض انتخاب کن
        if (!shippingMethod && response.data.length > 0) {
          setShippingMethod(response.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch shipping methods", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMethods();
  }, [shippingMethod, setShippingMethod]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>انتخاب روش ارسال</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {methods.map((method) => (
          <div
            key={method.id}
            onClick={() => setShippingMethod(method)}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              shippingMethod?.id === method.id
                ? "border-primary ring-2 ring-primary"
                : "hover:border-gray-400"
            }`}
          >
            <div className="flex justify-between font-semibold">
              <span>{method.name}</span>
              <span>
                {method.cost > 0
                  ? `${method.cost.toLocaleString("fa-IR")} تومان`
                  : "پس کرایه"}
              </span>
            </div>
            {method.description && (
              <p className="text-sm text-gray-500 mt-1">{method.description}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ShippingMethodSelection;

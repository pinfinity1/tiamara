"use client";

import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { Truck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ✅ نکته ۱: اضافه کردن export برای رفع خطای اول
export interface ShippingMethod {
  id: string;
  code: string;
  name: string;
  description: string | null;
  cost: number;
}

// ✅ نکته ۲: تعریف اینترفیس برای پراپ‌ها
interface Props {
  methods: ShippingMethod[];
}

// ✅ نکته ۳: دریافت پراپ methods برای رفع خطای دوم
const ShippingMethodSelection = ({ methods }: Props) => {
  const { shippingMethod, setShippingMethod } = useCheckoutStore();

  // انتخاب خودکار اولین روش، اگر هیچ روشی انتخاب نشده باشد
  useEffect(() => {
    if (!shippingMethod && methods && methods.length > 0) {
      setShippingMethod(methods[0]);
    }
  }, [methods, shippingMethod, setShippingMethod]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Truck className="w-5 h-5 text-primary" />
          انتخاب روش ارسال
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {/* بررسی خالی نبودن آرایه قبل از مپ کردن */}
        {methods && methods.length > 0 ? (
          methods.map((method) => {
            const isSelected = shippingMethod?.id === method.id;
            return (
              <div
                key={method.id}
                onClick={() => setShippingMethod(method)}
                className={cn(
                  "relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:bg-gray-50",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-gray-100 hover:border-gray-300"
                )}
              >
                {isSelected && (
                  <div className="absolute top-3 left-3 text-primary">
                    <CheckCircle2 className="w-5 h-5 fill-primary/10" />
                  </div>
                )}

                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-gray-800">{method.name}</span>
                </div>

                <p className="text-xs text-gray-500 mb-4 min-h-[20px]">
                  {method.description || "تحویل مطمئن"}
                </p>

                <div className="mt-auto pt-3 border-t border-gray-200/60 flex justify-between items-center">
                  <span className="text-xs text-gray-400">هزینه ارسال:</span>
                  <span
                    className={cn(
                      "font-bold",
                      method.cost === 0 ? "text-green-600" : "text-gray-800"
                    )}
                  >
                    {method.cost > 0
                      ? `${method.cost.toLocaleString("fa-IR")} تومان`
                      : "رایگان / پس‌کرایه"}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 col-span-2 text-center py-4">
            هیچ روش ارسالی یافت نشد.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ShippingMethodSelection;

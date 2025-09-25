"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns-jalali";
import { useCouponStore, Coupon } from "@/store/useCouponStore";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

// This is the corrected and simplified schema
const couponSchema = z.object({
  code: z.string().min(3, "کد باید حداقل ۳ کاراکتر باشد."),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.coerce.number().min(0, "مقدار تخفیف نمی‌تواند منفی باشد."),
  expireDate: z.date({
    required_error: "تاریخ انقضا الزامی است.",
    invalid_type_error: "فرمت تاریخ نامعتبر است.",
  }),
  usageLimit: z.coerce.number().int().min(1, "حداقل یکبار استفاده مجاز است."),
  isActive: z.boolean().default(true),
});

// This type is now correctly inferred
type CouponFormData = z.infer<typeof couponSchema>;

interface CouponFormProps {
  onFinished: () => void;
}

export default function CouponForm({ onFinished }: CouponFormProps) {
  const { createCoupon, updateCoupon, selectedCoupon } = useCouponStore();
  const { toast } = useToast();

  const isEditMode = !!selectedCoupon;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      discountType: "PERCENTAGE",
      discountValue: 10,
      usageLimit: 100,
      isActive: true,
      expireDate: new Date(new Date().setDate(new Date().getDate() + 30)),
    },
  });

  useEffect(() => {
    if (isEditMode && selectedCoupon) {
      reset({
        ...selectedCoupon,
        expireDate: new Date(selectedCoupon.expireDate),
      });
    } else {
      reset({
        code: "",
        discountType: "PERCENTAGE",
        discountValue: 10,
        usageLimit: 100,
        isActive: true,
        expireDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      });
    }
  }, [selectedCoupon, isEditMode, reset]);

  // The 'data' parameter now has the correct type, resolving the error
  const onSubmit = async (data: CouponFormData) => {
    const couponData = {
      ...data,
      expireDate: data.expireDate.toISOString(),
    };

    let success = false;
    if (isEditMode && selectedCoupon) {
      success = await updateCoupon(selectedCoupon.id, couponData);
    } else {
      success = await createCoupon(
        couponData as Omit<Coupon, "id" | "usageCount">
      );
    }

    if (success) {
      toast({
        title: "موفق",
        description: `کوپن با موفقیت ${isEditMode ? "ویرایش" : "ایجاد"} شد.`,
      });
      onFinished();
    } else {
      toast({
        title: "خطا",
        description: "عملیات با شکست مواجه شد.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <Label htmlFor="code">کد تخفیف</Label>
          <Input id="code" {...register("code")} />
          {errors.code && (
            <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>
          )}
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Label htmlFor="isActive">فعال</Label>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Switch
                id="isActive"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="discountType">نوع تخفیف</Label>
          <Controller
            name="discountType"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger id="discountType">
                  <SelectValue placeholder="انتخاب نوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">درصدی</SelectItem>
                  <SelectItem value="FIXED">مبلغ ثابت</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label htmlFor="discountValue">مقدار تخفیف</Label>
          <Input
            id="discountValue"
            type="number"
            {...register("discountValue")}
          />
          {errors.discountValue && (
            <p className="text-red-500 text-xs mt-1">
              {errors.discountValue.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>تاریخ انقضا</Label>
          <Controller
            name="expireDate"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-right font-normal"
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {field.value ? (
                      format(field.value, "yyyy/MM/dd")
                    ) : (
                      <span>یک تاریخ انتخاب کنید</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.expireDate && (
            <p className="text-red-500 text-xs mt-1">
              {errors.expireDate.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="usageLimit">سقف استفاده</Label>
          <Input id="usageLimit" type="number" {...register("usageLimit")} />
          {errors.usageLimit && (
            <p className="text-red-500 text-xs mt-1">
              {errors.usageLimit.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "در حال ذخیره..."
            : isEditMode
            ? "ویرایش کوپن"
            : "ایجاد کوپن"}
        </Button>
      </div>
    </form>
  );
}

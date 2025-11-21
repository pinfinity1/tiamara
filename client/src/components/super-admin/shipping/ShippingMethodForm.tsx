"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "نام روش ارسال الزامی است"),
  code: z.string().min(2, "کد سیستمی الزامی است (انگلیسی)"),
  // تبدیل ورودی به عدد
  cost: z.coerce.number().min(0, "هزینه نمی‌تواند منفی باشد"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

interface Props {
  defaultValues?: any;
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
  isLoading: boolean;
  buttonText: string;
}

export function ShippingMethodForm({
  defaultValues,
  onSubmit,
  isLoading,
  buttonText,
}: Props) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      cost: 0,
      description: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        name: defaultValues.name,
        code: defaultValues.code,
        cost: defaultValues.cost,
        description: defaultValues.description || "",
        isActive: defaultValues.isActive,
      });
    } else {
      form.reset({
        name: "",
        code: "",
        cost: 0,
        description: "",
        isActive: true,
      });
    }
  }, [defaultValues, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نام نمایشی (فارسی)</FormLabel>
                <FormControl>
                  {/* کست کردن به string برای اطمینان */}
                  <Input
                    placeholder="مثال: پست پیشتاز"
                    {...field}
                    value={field.value as string}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>کد سیستمی (انگلیسی)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="ex: pishtaz"
                    {...field}
                    dir="ltr"
                    value={field.value as string}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>هزینه ارسال (تومان)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0 برای رایگان/پس‌کرایه"
                  {...field}
                  // ✅ رفع خطا: تعیین تایپ صریح برای مقدار
                  value={field.value as number}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                />
              </FormControl>
              <FormDescription>
                عدد 0 به معنی رایگان یا پس‌کرایه است.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>توضیحات (برای کاربر)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="مثال: زمان تحویل ۳ تا ۵ روز کاری"
                  {...field}
                  value={(field.value as string) || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">وضعیت فعال</FormLabel>
                <FormDescription>
                  آیا این روش در صفحه پرداخت نمایش داده شود؟
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value as boolean}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            {buttonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}

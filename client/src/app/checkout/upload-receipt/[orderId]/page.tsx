"use client";

import { useState, use } from "react"; // تغییر: use اضافه شد برای پارامترها در Next.js 15
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  UploadCloud,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axiosAuth from "@/lib/axios";
import Image from "next/image";

// در Next.js 15 پارامترها پرامیس هستند
export default function UploadReceiptPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params); // آنپک کردن پارامتر
  const router = useRouter();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [userNote, setUserNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // اعتبارسنجی حجم (مثلاً ۵ مگابایت)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "حجم فایل زیاد است",
          description: "حداکثر حجم مجاز ۵ مگابایت است.",
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast({
        title: "لطفاً تصویر فیش را انتخاب کنید",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("orderId", orderId);
    formData.append("receipt", file); // نام فیلد باید با Multer در بک‌اند یکی باشد
    formData.append("userNote", userNote);

    try {
      const response = await axiosAuth.post(
        "/payment-receipt/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        setIsSuccess(true);
        toast({
          title: "فیش با موفقیت ثبت شد",
          className: "bg-green-600 text-white",
        });
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "خطا در آپلود فیش";
      toast({ title: "خطا", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8 shadow-lg border-green-100">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">دریافت شد!</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            فیش واریزی شما با موفقیت ثبت شد.
            <br />
            همکاران ما پس از بررسی و تایید فیش، وضعیت سفارش را به
            <strong className="text-green-700 mx-1">"در حال پردازش"</strong>
            تغییر خواهند داد.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push("/account?tab=orders")}
              className="w-full h-12 text-base"
            >
              پیگیری سفارش در پروفایل
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full h-12"
            >
              بازگشت به صفحه اصلی
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-lg">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 hover:bg-white/50"
        >
          <ArrowLeft className="ml-2 w-4 h-4" /> بازگشت / انصراف
        </Button>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center border-b bg-gray-50/50 pb-6">
            <CardTitle className="text-xl font-bold text-gray-800">
              ثبت فیش واریزی
            </CardTitle>
            <p className="text-sm text-gray-500 mt-2 font-mono bg-gray-200/50 py-1 px-3 rounded-full w-fit mx-auto">
              سفارش #{orderId.slice(-6).toUpperCase()}
            </p>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* باکس آپلود */}
            <div className="space-y-3">
              <Label className="text-base">
                تصویر فیش واریزی <span className="text-red-500">*</span>
              </Label>

              {!preview ? (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-primary/50 transition-all group"
                  onClick={() =>
                    document.getElementById("receipt-upload")?.click()
                  }
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-primary" />
                  </div>
                  <p className="text-sm text-gray-700 font-bold">
                    برای انتخاب تصویر کلیک کنید
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    فرمت‌های مجاز: JPG, PNG
                  </p>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-gray-200">
                  <div className="aspect-video relative bg-gray-100">
                    <Image
                      src={preview}
                      alt="پیش‌نمایش"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreview(null);
                      setFile(null);
                    }}
                    className="absolute top-2 left-2 shadow-md"
                  >
                    حذف و انتخاب مجدد
                  </Button>
                </div>
              )}

              <input
                id="receipt-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* توضیحات */}
            <div className="space-y-2">
              <Label>توضیحات / ۴ رقم آخر کارت (جهت تسریع تایید)</Label>
              <Textarea
                placeholder="مثال: واریز از کارت ۶۰۳۷... به نام علی علوی"
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                className="min-h-[100px] resize-none text-base"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading || !file}
              className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin ml-2" /> در حال ارسال...
                </>
              ) : (
                "ارسال نهایی فیش"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

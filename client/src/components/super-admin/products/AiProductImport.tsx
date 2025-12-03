"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Sparkles, Copy, Loader2, CheckCircle2, XCircle } from "lucide-react"; // آیکون‌های جدید
import { useToast } from "@/hooks/use-toast";
import axiosAuth from "@/lib/axios";
// توجه: چون عکس‌ها خارجی هستند، next/image ممکن است ارور hostname بدهد.
// برای پیش‌نمایش ادمین از تگ img معمولی استفاده می‌کنیم که امن‌تر است.

export default function AiProductImport({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);

  const [url, setUrl] = useState("");
  const [prompt, setPrompt] = useState("");

  // لیست لینک‌های خام
  const [scrapedImages, setScrapedImages] = useState<string[]>([]);
  // لیست لینک‌های انتخاب شده برای آپلود
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const [jsonInput, setJsonInput] = useState("");

  const handleAnalyze = async () => {
    if (!url) return;
    setIsLoading(true);
    try {
      const res = await axiosAuth.post("/products/prepare-from-url", { url });
      if (res.data.success) {
        const images = res.data.data.images || [];
        setScrapedImages(images);
        // به صورت پیش‌فرض همه را انتخاب کن (یا هیچکدام، بسته به سلیقه)
        setSelectedImages(images);

        setPrompt(res.data.data.prompt);
        setStep(2);
        toast({
          title: "تحلیل انجام شد!",
          description: "عکس‌ها را انتخاب و پرامپت را کپی کنید.",
        });
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "امکان خواندن لینک وجود ندارد.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleImageSelection = (imgUrl: string) => {
    if (selectedImages.includes(imgUrl)) {
      setSelectedImages((prev) => prev.filter((i) => i !== imgUrl));
    } else {
      setSelectedImages((prev) => [...prev, imgUrl]);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(prompt);
    toast({ title: "کپی شد!" });
  };

  const handleFinalSubmit = async () => {
    try {
      const parsedJson = JSON.parse(jsonInput);

      // ارسال دیتای جیسون + لیست عکس‌های منتخب (هنوز لینک خارجی هستند)
      const finalData = {
        ...parsedJson,
        selectedImages: selectedImages, // سرور این‌ها را آپلود خواهد کرد
      };

      setIsLoading(true);
      const res = await axiosAuth.post("/products/import-json", finalData);

      if (res.data.success) {
        toast({
          title: "محصول ساخته شد!",
          className: "bg-green-600 text-white",
        });
        setIsOpen(false);
        // ریست کردن فرم
        setStep(1);
        setUrl("");
        setJsonInput("");
        setScrapedImages([]);
        setSelectedImages([]);

        onSuccess(); // رفرش لیست محصولات
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "فرمت JSON اشتباه است یا سرور خطا داد.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          <Sparkles className="w-4 h-4" />
          افزودن هوشمند
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>دستیار هوشمند ورود محصول</DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100 leading-relaxed">
              لینک محصول را از سایت خارجی (مثل Sephora, Cult Beauty, TrendYol)
              وارد کنید.
              <br />
              ما عکس‌ها را برای انتخاب شما آماده می‌کنیم و متن را برای ترجمه
              استخراج می‌کنیم.
            </div>
            <div>
              <Label>لینک محصول</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  dir="ltr"
                />
                <Button onClick={handleAnalyze} disabled={isLoading || !url}>
                  {isLoading ? <Loader2 className="animate-spin" /> : "تحلیل"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* بخش ۱: انتخاب تصاویر */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <Label className="text-gray-700 font-bold">
                  ۱. انتخاب تصاویر ({selectedImages.length} انتخاب شده)
                </Label>
                <span className="text-xs text-gray-500">
                  روی عکس کلیک کنید تا انتخاب/حذف شود
                </span>
              </div>

              {scrapedImages.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-60 overflow-y-auto p-1">
                  {scrapedImages.map((img, idx) => {
                    const isSelected = selectedImages.includes(img);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleImageSelection(img)}
                        className={`relative group cursor-pointer aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          isSelected
                            ? "border-green-500 ring-2 ring-green-200"
                            : "border-gray-200 opacity-60 hover:opacity-100"
                        }`}
                      >
                        {/* استفاده از img معمولی برای نمایش لینک‌های خارجی */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover"
                        />

                        <div className="absolute top-1 right-1">
                          {isSelected ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 bg-white rounded-full" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-400 bg-white/50"></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-red-500 italic">
                  هیچ عکسی پیدا نشد.
                </p>
              )}
            </div>

            {/* بخش ۲: پرامپت */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-bold">
                ۲. دریافت اطلاعات (کپی در ChatGPT)
              </Label>
              <div className="relative">
                <Textarea
                  value={prompt}
                  readOnly
                  className="h-20 bg-gray-50 text-xs font-mono resize-none pr-24"
                  dir="ltr"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2 h-8 text-xs"
                  onClick={copyToClipboard}
                >
                  <Copy className="w-3 h-3 mr-1" /> کپی
                </Button>
              </div>
            </div>

            {/* بخش ۳: ورودی JSON */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-bold">
                ۳. ثبت نهایی (پیست کردن JSON)
              </Label>
              <Textarea
                placeholder="اینجا JSON را پیست کنید..."
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="h-40 font-mono text-sm dir-ltr"
                dir="ltr"
              />
            </div>

            <div className="flex justify-end gap-2 border-t pt-4 mt-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                بازگشت
              </Button>
              <Button
                onClick={handleFinalSubmit}
                disabled={isLoading || !jsonInput}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    در حال آپلود عکس‌ها و ثبت...
                  </>
                ) : (
                  "ثبت نهایی محصول"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

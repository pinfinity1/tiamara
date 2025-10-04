// client/src/app/super-admin/homepage/VideoShowcaseManager.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useHomepageStore } from "@/store/useHomepageStore";
import { useProductStore } from "@/store/useProductStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast"; // <-- ایمپورت کردن هوک useToast

const VideoShowcaseManager = () => {
  const {
    videoShowcaseItems,
    fetchVideoShowcaseItems,
    addVideoShowcaseItem,
    deleteVideoShowcaseItem,
    isLoading,
  } = useHomepageStore();

  const { products, fetchAllProductsForAdmin } = useProductStore();

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { toast } = useToast(); // <-- فراخوانی هوک

  useEffect(() => {
    fetchVideoShowcaseItems();
    if (products.length === 0) {
      fetchAllProductsForAdmin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !videoFile) {
      // ** استفاده از toast به جای alert **
      toast({
        title: "فرم ناقص است",
        description: "لطفاً هم محصول و هم فایل ویدیویی را انتخاب کنید.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("productId", selectedProductId);
    formData.append("video", videoFile);

    setUploadProgress(0);

    const onUploadProgress = (progressEvent: any) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      setUploadProgress(percentCompleted);
    };

    await addVideoShowcaseItem(formData, onUploadProgress);

    setSelectedProductId("");
    setVideoFile(null);
    setUploadProgress(0);
    const fileInput = document.getElementById(
      "video-upload"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>مدیریت اسلایدر ویدیویی صفحه اصلی</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <div>
            <label className="mb-2 block">انتخاب محصول</label>
            <Select
              onValueChange={setSelectedProductId}
              value={selectedProductId}
            >
              <SelectTrigger>
                <SelectValue placeholder="یک محصول را انتخاب کنید..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="video-upload" className="mb-2 block">
              آپلود ویدیو (فقط mp4)
            </label>
            <Input
              id="video-upload"
              type="file"
              accept="video/mp4"
              onChange={handleFileChange}
              required
            />
          </div>

          {/* نوار پیشرفت آپلود */}
          {isLoading && uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? `در حال آپلود... ${uploadProgress}%`
              : "افزودن آیتم جدید"}
          </Button>
        </form>

        <div className="space-y-4">
          <h3 className="font-bold">آیتم‌های فعلی:</h3>
          {videoShowcaseItems.length === 0 && !isLoading && (
            <p>هیچ آیتمی وجود ندارد.</p>
          )}
          {isLoading && videoShowcaseItems.length === 0 && (
            <p>در حال بارگذاری...</p>
          )}
          {videoShowcaseItems.map((item) => {
            if (!item.product) {
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-md bg-destructive/10"
                >
                  <p className="text-destructive text-sm font-medium">
                    محصول مرتبط با این آیتم یافت نشد (احتمالاً حذف شده است).
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteVideoShowcaseItem(item.id)}
                    disabled={isLoading}
                  >
                    حذف این آیتم
                  </Button>
                </div>
              );
            }
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 border rounded-md"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={
                      item.product.images?.[0]?.url || "/images/placeholder.png"
                    }
                    alt={item.product.name}
                    width={60}
                    height={60}
                    className="rounded-md object-cover"
                  />
                  <div>
                    <p className="font-semibold">{item.product.name}</p>
                    <a
                      href={item.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      مشاهده ویدیو
                    </a>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteVideoShowcaseItem(item.id)}
                  disabled={isLoading}
                >
                  حذف
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoShowcaseManager;

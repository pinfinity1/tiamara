"use client";

import { useEffect, useState, useRef, ChangeEvent } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Category, useCategoryStore } from "@/store/useCategoryStore";
import {
  Pencil,
  PlusCircle,
  Trash2,
  Upload,
  UploadCloud,
  LayoutGrid,
  Maximize,
  Grid,
  RectangleHorizontal,
} from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// تنظیمات اولیه فرم
const initialFormData = {
  name: "",
  englishName: "",
  metaTitle: "",
  metaDescription: "",
  gridSize: "SMALL" as "SMALL" | "MEDIUM" | "LARGE", // مقدار پیش‌فرض
};

function ManageCategoriesPage() {
  const {
    categories,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    uploadCategoriesFromExcel,
    isLoading,
  } = useCategoryStore();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState(initialFormData);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // هندل کردن پیش‌نمایش عکس
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  const resetForm = () => {
    setEditingCategory(null);
    setFormData(initialFormData);
    setImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    resetForm();
    setEditingCategory(category);
    setFormData({
      name: category.name,
      englishName: category.englishName || "",
      metaTitle: category.metaTitle || "",
      metaDescription: category.metaDescription || "",
      gridSize: category.gridSize || "SMALL",
    });
    setPreviewUrl(category.imageUrl || null);
    setIsDialogOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGridSizeChange = (size: "SMALL" | "MEDIUM" | "LARGE") => {
    setFormData((prev) => ({ ...prev, gridSize: size }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleExcelUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const result = await uploadCategoriesFromExcel(file);
      if (result.success) {
        toast({ title: "آپلود موفقیت‌آمیز بود." });
      } else {
        toast({
          title: "خطا در آپلود",
          description: result.error,
          variant: "destructive",
        });
      }
      if (excelInputRef.current) excelInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.englishName) {
      toast({
        title: "نام فارسی و انگلیسی الزامی است.",
        variant: "destructive",
      });
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("englishName", formData.englishName);
    data.append("metaTitle", formData.metaTitle);
    data.append("metaDescription", formData.metaDescription);
    data.append("gridSize", formData.gridSize);

    if (imageFile) {
      data.append("image", imageFile);
    } else if (editingCategory) {
      data.append("imageUrl", editingCategory.imageUrl || "");
    }

    const result = editingCategory
      ? await updateCategory(editingCategory.id, data)
      : await createCategory(data);

    if (result) {
      toast({
        title: `دسته‌بندی با موفقیت ${
          editingCategory ? "ویرایش" : "ایجاد"
        } شد.`,
      });
      setIsDialogOpen(false);
    } else {
      toast({
        title: "خطا در ذخیره‌سازی",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteCategory(id);
    if (success) {
      toast({ title: "دسته‌بندی آرشیو شد." });
    } else {
      toast({ title: "خطا در حذف.", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            مدیریت دسته‌بندی‌ها
          </h1>
          <p className="text-sm text-gray-500">
            مدیریت ساختار فروشگاه و نحوه نمایش در Bento Grid
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => excelInputRef.current?.click()}
            disabled={isLoading}
          >
            <Upload className="ml-2 h-4 w-4" /> اکسل
            <input
              type="file"
              ref={excelInputRef}
              className="hidden"
              accept=".xlsx, .xls, .csv"
              onChange={handleExcelUpload}
            />
          </Button>
          <Button onClick={handleAddNew}>
            <PlusCircle className="ml-2 h-4 w-4" /> افزودن دسته
          </Button>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>تصویر</TableHead>
              <TableHead>نام دسته‌بندی</TableHead>
              <TableHead>سایز نمایش</TableHead>
              <TableHead>سئو</TableHead>
              <TableHead className="text-left">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id} className="hover:bg-gray-50/50">
                <TableCell>
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border bg-gray-100">
                    {category.imageUrl ? (
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-300">
                        <LayoutGrid className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-bold text-gray-800">{category.name}</div>
                  <div className="text-xs text-gray-500 font-sans">
                    {category.englishName}
                  </div>
                </TableCell>
                <TableCell>
                  {/* نمایش بج برای سایز گرید */}
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] font-medium border",
                      category.gridSize === "LARGE" &&
                        "bg-purple-50 text-purple-700 border-purple-200",
                      category.gridSize === "MEDIUM" &&
                        "bg-blue-50 text-blue-700 border-blue-200",
                      category.gridSize === "SMALL" &&
                        "bg-gray-50 text-gray-600 border-gray-200"
                    )}
                  >
                    {category.gridSize === "LARGE" && "بزرگ (4x)"}
                    {category.gridSize === "MEDIUM" && "متوسط (2x)"}
                    {category.gridSize === "SMALL" && "کوچک (1x)"}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-gray-500 max-w-[150px] truncate">
                  {category.metaTitle || "-"}
                </TableCell>
                <TableCell className="text-left">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(category)}
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف دسته‌بندی</AlertDialogTitle>
                          <AlertDialogDescription>
                            آیا از آرشیو کردن این دسته‌بندی مطمئن هستید؟
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>لغو</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(category.id)}
                            className={buttonVariants({
                              variant: "destructive",
                            })}
                          >
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی جدید"}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="info" className="w-full mt-4" dir="rtl">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">اطلاعات پایه</TabsTrigger>
              <TabsTrigger value="visuals">ظاهر و گرید</TabsTrigger>
              <TabsTrigger value="seo">سئو</TabsTrigger>
            </TabsList>

            {/* تب اطلاعات پایه */}
            <TabsContent value="info" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نام فارسی *</Label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="مثال: مراقبت از پوست"
                  />
                </div>
                <div className="space-y-2">
                  <Label>نام انگلیسی (URL) *</Label>
                  <Input
                    name="englishName"
                    value={formData.englishName}
                    onChange={handleInputChange}
                    placeholder="Example: Skincare"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>توضیحات مختصر</Label>
                <Textarea
                  name="metaDescription" // استفاده موقت از فیلد دیسکریپشن برای UI
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  placeholder="توضیحی که در صفحه دسته‌بندی نمایش داده می‌شود..."
                />
              </div>
            </TabsContent>

            {/* تب ظاهر و گرید (Bento Grid Settings) */}
            <TabsContent value="visuals" className="space-y-6 py-4">
              {/* انتخابگر بصری سایز گرید */}
              <div className="space-y-3">
                <Label>سایز نمایش در صفحه (Bento Grid)</Label>
                <div className="grid grid-cols-3 gap-4">
                  {/* گزینه SMALL */}
                  <div
                    onClick={() => handleGridSizeChange("SMALL")}
                    className={cn(
                      "cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:bg-gray-50",
                      formData.gridSize === "SMALL"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200"
                    )}
                  >
                    <div className="w-8 h-8 bg-gray-300 rounded-md" />{" "}
                    {/* نماد مربع کوچک */}
                    <span className="text-xs font-bold">کوچک (1x1)</span>
                  </div>

                  {/* گزینه MEDIUM */}
                  <div
                    onClick={() => handleGridSizeChange("MEDIUM")}
                    className={cn(
                      "cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:bg-gray-50",
                      formData.gridSize === "MEDIUM"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    )}
                  >
                    <div className="w-16 h-8 bg-gray-300 rounded-md flex items-center justify-center">
                      <RectangleHorizontal className="w-4 h-4 text-gray-500" />
                    </div>{" "}
                    {/* نماد مستطیل */}
                    <span className="text-xs font-bold">متوسط (2x1)</span>
                  </div>

                  {/* گزینه LARGE */}
                  <div
                    onClick={() => handleGridSizeChange("LARGE")}
                    className={cn(
                      "cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:bg-gray-50",
                      formData.gridSize === "LARGE"
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200"
                    )}
                  >
                    <div className="w-16 h-16 bg-gray-300 rounded-md flex items-center justify-center">
                      <Maximize className="w-6 h-6 text-gray-500" />
                    </div>{" "}
                    {/* نماد مربع بزرگ */}
                    <span className="text-xs font-bold">بزرگ (2x2)</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500">
                  سایز "بزرگ" برای دسته‌بندی‌های اصلی (مثل مراقبت پوست) و سایز
                  "متوسط" برای بنرهای افقی مناسب است.
                </p>
              </div>

              {/* آپلود تصویر */}
              <div className="space-y-2">
                <Label>تصویر پس‌زمینه کارت</Label>
                <div
                  className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="space-y-1 text-center">
                    {previewUrl ? (
                      <div className="relative w-full h-40">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          className="object-contain rounded-md"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                          <span className="text-white text-sm font-medium">
                            تغییر تصویر
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 justify-center">
                          <span className="font-medium text-indigo-600 hover:text-indigo-500">
                            آپلود تصویر
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, WEBP (حداکثر 5MB)
                        </p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* تب سئو */}
            <TabsContent value="seo" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>عنوان متا (Meta Title)</Label>
                <Input
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  placeholder="عنوان جذاب برای گوگل..."
                />
              </div>
              <div className="space-y-2">
                <Label>توضیحات متا (Meta Description)</Label>
                <Textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  placeholder="توضیحاتی که در نتایج جستجو نمایش داده می‌شود..."
                  className="h-24"
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4 gap-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                انصراف
              </Button>
            </DialogClose>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ManageCategoriesPage;

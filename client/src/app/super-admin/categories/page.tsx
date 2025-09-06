"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { Category, useCategoryStore } from "@/store/useCategoryStore";
import { Pencil, PlusCircle, Trash2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";

/**
 * Admin page for managing product categories.
 * Allows creating, reading, updating, and deleting categories.
 */
function ManageCategoriesPage() {
  const {
    categories,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    isLoading,
  } = useCategoryStore();
  const { toast } = useToast();

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    metaTitle: "",
    metaDescription: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({ name: "", metaTitle: "", metaDescription: "" });
    setImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddNew = () => {
    resetForm();
    setIsFormDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    resetForm();
    setEditingCategory(category);
    setFormData({
      name: category.name,
      metaTitle: category.metaTitle || "",
      metaDescription: category.metaDescription || "",
    });
    setPreviewUrl(category.imageUrl || null);
    setIsFormDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("metaTitle", formData.metaTitle);
    data.append("metaDescription", formData.metaDescription);
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
      setIsFormDialogOpen(false);
    } else {
      toast({
        title: `خطا در ${editingCategory ? "ویرایش" : "ایجاد"} دسته‌بندی.`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteCategory(id);
    if (success) {
      toast({ title: "دسته‌بندی با موفقیت حذف شد." });
    } else {
      toast({ title: "خطا در حذف دسته‌بندی.", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">مدیریت دسته‌بندی‌ها</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="ml-2" /> افزودن دسته‌بندی جدید
        </Button>
      </div>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی جدید"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">نام دسته‌بندی</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="مثال: مراقبت از پوست"
              />
            </div>
            <div className="space-y-2">
              <Label>تصویر دسته‌بندی (اختیاری)</Label>
              <div
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-1 text-center">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={80}
                      height={80}
                      className="mx-auto h-20 w-20 object-contain"
                    />
                  ) : (
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600 justify-center">
                    <span className="relative rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                      <span>آپلود فایل</span>
                      <input
                        ref={fileInputRef}
                        id="image"
                        name="image"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept="image/*"
                      />
                    </span>
                    <p className="pr-1">یا فایل را اینجا بکشید</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WEBP - حداکثر ۵ مگابایت
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaTitle">عنوان متا (برای سئو)</Label>
              <Input
                id="metaTitle"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleInputChange}
                placeholder="مثال: محصولات مراقبت از پوست | فروشگاه تیامارا"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaDescription">توضیحات متا (برای سئو)</Label>
              <Input
                id="metaDescription"
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleInputChange}
                placeholder="توضیحات کوتاه برای نمایش در گوگل"
              />
            </div>
          </div>
          <DialogFooter>
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

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>تصویر</TableHead>
              <TableHead>نام دسته‌بندی</TableHead>
              <TableHead className="text-left">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      width={40}
                      height={40}
                      className="object-contain bg-gray-100"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-md" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-left">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(category)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          آیا کاملا مطمئن هستید؟
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          این عمل غیرقابل بازگشت است و دسته‌بندی را برای همیشه
                          حذف خواهد کرد.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>انصراف</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(category.id)}
                          className={buttonVariants({ variant: "destructive" })}
                        >
                          بله، حذف کن
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default ManageCategoriesPage;

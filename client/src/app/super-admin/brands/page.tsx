"use client";

import { useEffect, useState, useRef, ChangeEvent } from "react";
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
import { Brand, useBrandStore } from "@/store/useBrandStore";
import { Pencil, PlusCircle, Trash2, UploadCloud, Upload } from "lucide-react";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";

function ManageBrandsPage() {
  const {
    brands,
    fetchBrands,
    createBrand,
    updateBrand,
    deleteBrand,
    uploadBrandsFromExcel,
    isLoading,
  } = useBrandStore();
  const { toast } = useToast();

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    englishName: "",
    metaTitle: "",
    metaDescription: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  useEffect(() => {
    if (logoFile) {
      const url = URL.createObjectURL(logoFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [logoFile]);

  const resetForm = () => {
    setEditingBrand(null);
    setFormData({
      name: "",
      englishName: "",
      metaTitle: "",
      metaDescription: "",
    });
    setLogoFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddNew = () => {
    resetForm();
    setIsFormDialogOpen(true);
  };

  const handleEdit = (brand: Brand) => {
    resetForm();
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      englishName: brand.englishName || "", // مقداردهی فیلد جدید
      metaTitle: brand.metaTitle || "",
      metaDescription: brand.metaDescription || "",
    });
    setPreviewUrl(brand.logoUrl || null);
    setIsFormDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleExcelUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const result = await uploadBrandsFromExcel(file);
      if (result.success && result.data) {
        toast({
          title: "آپلود با موفقیت انجام شد",
          description: (
            <div>
              <p>{result.data.createdCount} برند جدید ایجاد شد.</p>
              {result.data.failedCount > 0 && (
                <p className="text-red-500">
                  {result.data.failedCount} مورد با خطا مواجه شد.
                </p>
              )}
            </div>
          ),
        });
      } else {
        toast({
          title: "خطا در آپلود",
          description: result.error,
          variant: "destructive",
        });
      }
      if (excelInputRef.current) {
        excelInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async () => {
    const data = new FormData();
    data.append("name", formData.name);
    data.append("englishName", formData.englishName); // ارسال فیلد جدید
    data.append("metaTitle", formData.metaTitle);
    data.append("metaDescription", formData.metaDescription);
    if (logoFile) {
      data.append("logo", logoFile);
    } else if (editingBrand) {
      data.append("logoUrl", editingBrand.logoUrl || "");
    }

    const result = editingBrand
      ? await updateBrand(editingBrand.id, data)
      : await createBrand(data);

    if (result) {
      toast({
        title: `برند با موفقیت ${editingBrand ? "ویرایش" : "ایجاد"} شد.`,
      });
      setIsFormDialogOpen(false);
    } else {
      toast({
        title: `خطا در ${editingBrand ? "ویرایش" : "ایجاد"} برند.`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteBrand(id);
    if (success) {
      toast({ title: "برند با موفقیت حذف شد." });
    } else {
      toast({ title: "خطا در حذف برند.", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">مدیریت برندها</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => excelInputRef.current?.click()}
            disabled={isLoading}
          >
            <Upload className="ml-2 h-4 w-4" /> ایمپورت از اکسل
            <input
              type="file"
              ref={excelInputRef}
              className="hidden"
              accept=".xlsx, .xls, .csv"
              onChange={handleExcelUpload}
            />
          </Button>
          <Button onClick={handleAddNew}>
            <PlusCircle className="ml-2" /> افزودن برند جدید
          </Button>
        </div>
      </div>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBrand ? "ویرایش برند" : "افزودن برند جدید"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">نام برند (فارسی)</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="مثال: اوردینری"
              />
            </div>
            {/* فیلد ورودی جدید برای نام انگلیسی */}
            <div className="space-y-2">
              <Label htmlFor="englishName">نام برند (انگلیسی)</Label>
              <Input
                id="englishName"
                name="englishName"
                value={formData.englishName}
                onChange={handleInputChange}
                placeholder="Example: The Ordinary"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>لوگوی برند (اختیاری)</Label>
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
                      className="mx-auto h-20 w-20 object-contain rounded-full"
                    />
                  ) : (
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600 justify-center">
                    <span className="relative rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                      <span>آپلود فایل</span>
                      <input
                        ref={fileInputRef}
                        id="logo"
                        name="logo"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept="image/*"
                      />
                    </span>
                    <p className="pr-1">یا فایل را اینجا بکشید</p>
                  </div>
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaDescription">توضیحات متا (برای سئو)</Label>
              <Input
                id="metaDescription"
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleInputChange}
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
              <TableHead>لوگو</TableHead>
              <TableHead>نام برند (فارسی)</TableHead>
              <TableHead>نام برند (انگلیسی)</TableHead>
              <TableHead className="text-left">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell>
                  {brand.logoUrl ? (
                    <Image
                      src={brand.logoUrl}
                      alt={brand.name}
                      width={40}
                      height={40}
                      className="rounded-full object-contain bg-gray-100"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-full" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{brand.name}</TableCell>
                <TableCell className="font-mono text-xs">
                  {brand.englishName}
                </TableCell>
                <TableCell className="text-left">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(brand)}
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
                          این عمل غیرقابل بازگشت است.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>انصراف</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(brand.id)}
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

export default ManageBrandsPage;

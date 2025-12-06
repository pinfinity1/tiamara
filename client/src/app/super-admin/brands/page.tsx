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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Brand, useBrandStore } from "@/store/useBrandStore";
import {
  Pencil,
  PlusCircle,
  Trash2,
  UploadCloud,
  Upload,
  Star,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";

// استیت اولیه فرم
const initialFormData = {
  name: "",
  englishName: "",
  metaTitle: "",
  metaDescription: "",
  isFeatured: false,
};

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

  // مدیریت فایل‌ها
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState(initialFormData);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  // ساخت پیش‌نمایش برای فایل‌های انتخاب شده
  useEffect(() => {
    if (logoFile) {
      const url = URL.createObjectURL(logoFile);
      setLogoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [logoFile]);

  useEffect(() => {
    if (coverFile) {
      const url = URL.createObjectURL(coverFile);
      setCoverPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [coverFile]);

  const resetForm = () => {
    setEditingBrand(null);
    setFormData(initialFormData);
    setLogoFile(null);
    setLogoPreview(null);
    setCoverFile(null);
    setCoverPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
    if (coverInputRef.current) coverInputRef.current.value = "";
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
      englishName: brand.englishName || "",
      metaTitle: brand.metaTitle || "",
      metaDescription: brand.metaDescription || "",
      isFeatured: brand.isFeatured || false,
    });
    setLogoPreview(brand.logoUrl || null);
    setCoverPreview(brand.coverImageUrl || null);
    setIsFormDialogOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // هندلر جنریک برای آپلود فایل
  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "cover"
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === "logo") setLogoFile(file);
      else setCoverFile(file);
    }
  };

  const handleExcelUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const result = await uploadBrandsFromExcel(file);
      if (result.success && result.data) {
        toast({
          title: "آپلود موفق",
          description: `${result.data.createdCount} برند ایجاد شد.`,
        });
      } else {
        toast({
          title: "خطا",
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
        title: "نام فارسی و انگلیسی الزامی است",
        variant: "destructive",
      });
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("englishName", formData.englishName);
    data.append("metaTitle", formData.metaTitle);
    data.append("metaDescription", formData.metaDescription);
    // تبدیل بولین به استرینگ برای ارسال فرم دیتا
    data.append("isFeatured", String(formData.isFeatured));

    if (logoFile) data.append("logo", logoFile);
    if (coverFile) data.append("coverImage", coverFile);

    // در حالت ویرایش، اگر عکسی انتخاب نشده باشد، کنترلر سرور عکس قبلی را نگه می‌دارد

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
        title: "خطا در عملیات",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteBrand(id);
    if (success) {
      toast({ title: "برند حذف (آرشیو) شد." });
    } else {
      toast({ title: "خطا در حذف برند.", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">مدیریت برندها</h1>
          <p className="text-sm text-gray-500">مدیریت هویت بصری و سئو برندها</p>
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
            <PlusCircle className="ml-2 h-4 w-4" /> برند جدید
          </Button>
        </div>
      </div>

      {/* جدول نمایش برندها */}
      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[80px]">لوگو</TableHead>
              <TableHead>نام برند</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>سئو (Meta Title)</TableHead>
              <TableHead className="text-left">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand.id} className="hover:bg-gray-50/50">
                <TableCell>
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border bg-gray-50 flex items-center justify-center">
                    {brand.logoUrl ? (
                      <Image
                        src={brand.logoUrl}
                        alt={brand.name}
                        width={48}
                        height={48}
                        className="object-contain p-1"
                      />
                    ) : (
                      <ImageIcon className="text-gray-300 w-6 h-6" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-bold text-gray-800">{brand.name}</div>
                  <div className="text-xs text-gray-500 font-sans">
                    {brand.englishName}
                  </div>
                </TableCell>
                <TableCell>
                  {brand.isFeatured && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                      <Star className="w-3 h-3 mr-1 fill-amber-700" />
                      ویژه
                    </span>
                  )}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-gray-500 text-sm">
                  {brand.metaTitle || "-"}
                </TableCell>
                <TableCell className="text-left">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(brand)}
                  >
                    <Pencil className="h-4 w-4 text-blue-600" />
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
                        <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
                        <AlertDialogDescription>
                          برند به آرشیو منتقل می‌شود و از سایت حذف می‌گردد.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>انصراف</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(brand.id)}
                          className={buttonVariants({ variant: "destructive" })}
                        >
                          حذف
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

      {/* مودال افزودن / ویرایش */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBrand ? "ویرایش برند" : "افزودن برند جدید"}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="info" className="w-full mt-4" dir="rtl">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">اطلاعات پایه</TabsTrigger>
              <TabsTrigger value="visuals">تصاویر</TabsTrigger>
              <TabsTrigger value="seo">تنظیمات سئو</TabsTrigger>
            </TabsList>

            {/* تب اطلاعات پایه */}
            <TabsContent value="info" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">نام فارسی برند *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="مثال: اوردینری"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="englishName">نام انگلیسی (برای URL) *</Label>
                  <Input
                    id="englishName"
                    name="englishName"
                    value={formData.englishName}
                    onChange={handleInputChange}
                    placeholder="Example: The Ordinary"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between bg-amber-50 p-4 rounded-lg border border-amber-100">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold text-amber-900">
                    برند ویژه (Featured)
                  </Label>
                  <p className="text-xs text-amber-700">
                    نمایش در بالای صفحه برندها با سایز بزرگتر. مناسب برای
                    برندهای پرفروش.
                  </p>
                </div>
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isFeatured: checked }))
                  }
                />
              </div>
            </TabsContent>

            {/* تب تصاویر */}
            <TabsContent value="visuals" className="space-y-6 py-4">
              {/* آپلود لوگو */}
              <div className="space-y-2">
                <Label>۱. لوگوی برند (مربعی - برای لیست‌ها)</Label>
                <div
                  className="flex items-center gap-4 border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => logoInputRef.current?.click()}
                >
                  <div className="relative w-16 h-16 bg-white rounded-full border shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                    {logoPreview ? (
                      <Image
                        src={logoPreview}
                        alt="Logo Preview"
                        fill
                        className="object-contain p-1"
                      />
                    ) : (
                      <UploadCloud className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      برای آپلود لوگو کلیک کنید
                    </p>
                    <p className="text-xs text-gray-500">
                      فرمت PNG یا JPG (شفاف بهتر است)
                    </p>
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, "logo")}
                  />
                </div>
              </div>

              {/* آپلود کاور */}
              <div className="space-y-2">
                <Label>۲. تصویر کاور (عریض - برای ویترین ویژه)</Label>
                <div
                  className="relative w-full h-40 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden group"
                  onClick={() => coverInputRef.current?.click()}
                >
                  {coverPreview ? (
                    <>
                      <Image
                        src={coverPreview}
                        alt="Cover Preview"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-medium">
                          تغییر تصویر
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <p className="text-sm">برای آپلود کاور کلیک کنید</p>
                      <p className="text-xs">(ابعاد پیشنهادی: 800x600)</p>
                    </div>
                  )}
                  <input
                    ref={coverInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, "cover")}
                  />
                </div>
              </div>
            </TabsContent>

            {/* تب سئو */}
            <TabsContent value="seo" className="space-y-4 py-4">
              <div className="bg-blue-50 p-3 rounded-md text-xs text-blue-800 mb-4">
                این اطلاعات برای دیده شدن برند در گوگل حیاتی هستند. اگر خالی
                بمانند، از نام برند استفاده می‌شود.
              </div>
              <div className="space-y-2">
                <Label>عنوان متا (Meta Title)</Label>
                <Input
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  placeholder={`${
                    formData.name || "نام برند"
                  } | خرید محصولات اورجینال`}
                />
                <p className="text-[10px] text-gray-400 text-left">
                  {formData.metaTitle.length}/60 کاراکتر
                </p>
              </div>
              <div className="space-y-2">
                <Label>توضیحات متا (Meta Description)</Label>
                <Textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  placeholder="توضیحات جذاب شامل کلمات کلیدی مثل خرید، قیمت، اورجینال..."
                  className="h-24"
                />
                <p className="text-[10px] text-gray-400 text-left">
                  {formData.metaDescription.length}/160 کاراکتر
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2 mt-4">
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

export default ManageBrandsPage;

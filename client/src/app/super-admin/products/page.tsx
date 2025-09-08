"use client";

import { useEffect, useState, ChangeEvent, FormEvent, useRef } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Product, useProductStore } from "@/store/useProductStore";
import { useBrandStore } from "@/store/useBrandStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import { Pencil, PlusCircle, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { concerns, skinTypes } from "@/utils/config";

// Initial state for the product form, matching the prisma schema
const initialFormState = {
  name: "",
  brandId: "",
  categoryId: "",
  description: "",
  how_to_use: "",
  caution: "",
  price: "",
  discount_price: "",
  stock: "",
  sku: "",
  barcode: "",
  volume: "",
  unit: "",
  expiry_date: "",
  manufacture_date: "",
  country_of_origin: "",
  product_form: "",
  ingredients: "",
  tags: "",
  metaTitle: "",
  metaDescription: "",
};

/**
 * A unified page for listing, creating, editing, and deleting products.
 */
function ManageProductsPage() {
  const { toast } = useToast();

  // Zustand Stores
  const {
    products,
    fetchAllProductsForAdmin,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductsFromExcel,
    isLoading,
  } = useProductStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { brands, fetchBrands } = useBrandStore();
  const { categories, fetchCategories } = useCategoryStore();

  // UI State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formState, setFormState] = useState(initialFormState);
  const [existingImages, setExistingImages] = useState<
    { id: string; url: string }[]
  >([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);

  useEffect(() => {
    fetchAllProductsForAdmin();
    fetchBrands();
    fetchCategories();
  }, [fetchAllProductsForAdmin, fetchBrands, fetchCategories]);

  // Form handlers
  const resetForm = () => {
    setEditingProduct(null);
    setFormState(initialFormState);
    setExistingImages([]);
    setImagesToDelete([]);
    setSelectedFiles([]);
    setSelectedSkinTypes([]);
    setSelectedConcerns([]);
  };

  const handleAddNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    resetForm();
    setEditingProduct(product);
    setFormState({
      name: product.name || "",
      brandId: product.brandId || "",
      categoryId: product.categoryId || "",
      description: product.description || "",
      how_to_use: product.how_to_use || "",
      caution: product.caution || "",
      price: product.price?.toString() || "",
      discount_price: product.discount_price?.toString() || "",
      stock: product.stock?.toString() || "",
      sku: product.sku || "",
      barcode: product.barcode || "",
      volume: product.volume?.toString() || "",
      unit: product.unit || "",
      expiry_date: product.expiry_date
        ? new Date(product.expiry_date).toISOString().split("T")[0]
        : "",
      manufacture_date: product.manufacture_date
        ? new Date(product.manufacture_date).toISOString().split("T")[0]
        : "",
      country_of_origin: product.country_of_origin || "",
      product_form: product.product_form || "",
      ingredients: product.ingredients?.join(", ") || "",
      tags: product.tags?.join(", ") || "",
      metaTitle: product.metaTitle || "",
      metaDescription: product.metaDescription || "",
    });
    setExistingImages(product.images || []);
    setSelectedSkinTypes(product.skin_type || []);
    setSelectedConcerns(product.concern || []);
    setIsDialogOpen(true);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (
    name: "brandId" | "categoryId",
    value: string
  ) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleFilter = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(event.target.files!)]);
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (imageId: string) => {
    setImagesToDelete((prev) => [...prev, imageId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleSubmit = async () => {
    const formDataToSend = new FormData();
    Object.entries(formState).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    formDataToSend.append("skin_type", selectedSkinTypes.join(","));
    formDataToSend.append("concern", selectedConcerns.join(","));

    if (editingProduct) {
      formDataToSend.append("imagesToDelete", imagesToDelete.join(","));
    }

    selectedFiles.forEach((file) => {
      formDataToSend.append("images", file);
    });

    if (!editingProduct && selectedFiles.length === 0) {
      toast({
        title: "لطفاً حداقل یک تصویر آپلود کنید.",
        variant: "destructive",
      });
      return;
    }

    if (!formState.brandId || !formState.categoryId) {
      toast({
        title: "لطفاً برند و دسته‌بندی را انتخاب کنید.",
        variant: "destructive",
      });
      return;
    }

    const result = editingProduct
      ? await updateProduct(editingProduct.id, formDataToSend)
      : await createProduct(formDataToSend);

    if (result) {
      toast({
        title: `محصول با موفقیت ${editingProduct ? "ویرایش" : "ایجاد"} شد.`,
      });
      setIsDialogOpen(false);
    } else {
      toast({
        title: `خطا در ${editingProduct ? "ویرایش" : "ایجاد"} محصول.`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteProduct(id);
    if (success) {
      toast({ title: "محصول با موفقیت حذف شد." });
    } else {
      toast({ title: "خطا در حذف محصول.", variant: "destructive" });
    }
  };

  const handleExcelUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const result = await uploadProductsFromExcel(file);

      if (result.success && result.data) {
        toast({
          title: "آپلود با موفقیت انجام شد",
          description: (
            <div>
              <p>{result.data.createdCount} محصول جدید ایجاد شد.</p>
              <p>{result.data.updatedCount} محصول به‌روزرسانی شد.</p>
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

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">مدیریت محصولات</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="ml-2 h-4 w-4" /> ایمپورت از اکسل
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xlsx, .xls, .csv"
              onChange={handleExcelUpload}
            />
          </Button>
          <Button onClick={handleAddNew}>
            <PlusCircle className="ml-2" /> افزودن محصول جدید
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "ویرایش محصول" : "افزودن محصول جدید"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Image Section */}
            <div className="p-4 border rounded-lg space-y-4">
              <Label className="text-lg font-medium">تصاویر محصول</Label>
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-8">
                <Label className="cursor-pointer text-center">
                  <Upload className="mx-auto h-10 w-10 text-gray-400" />
                  <span className="mt-2 block text-sm font-medium text-gray-700">
                    برای آپلود کلیک کنید
                  </span>
                  <input
                    type="file"
                    className="sr-only"
                    multiple
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </Label>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {existingImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <Image
                      src={image.url}
                      alt="Existing product image"
                      width={100}
                      height={100}
                      className="h-24 w-24 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100"
                      onClick={() => handleRemoveExistingImage(image.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      width={100}
                      height={100}
                      className="h-24 w-24 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100"
                      onClick={() => handleRemoveNewImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Basic Info Section */}
            <div className="p-4 border rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
              <h3 className="col-span-1 md:col-span-2 text-lg font-medium">
                اطلاعات اصلی
              </h3>
              <div>
                <Label htmlFor="name">نام محصول</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="نام محصول"
                  className="mt-1"
                  onChange={handleInputChange}
                  value={formState.name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="brandId">برند</Label>
                <Select
                  value={formState.brandId}
                  onValueChange={(value) =>
                    handleSelectChange("brandId", value)
                  }
                  name="brandId"
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="انتخاب برند" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="categoryId">دسته‌بندی</Label>
                <Select
                  value={formState.categoryId}
                  onValueChange={(value) =>
                    handleSelectChange("categoryId", value)
                  }
                  name="categoryId"
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="انتخاب دسته‌بندی" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">توضیحات محصول</Label>
                <Textarea
                  id="description"
                  name="description"
                  className="mt-1 min-h-[120px]"
                  placeholder="توضیحات کامل محصول"
                  onChange={handleInputChange}
                  value={formState.description}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="how_to_use">نحوه استفاده</Label>
                <Textarea
                  id="how_to_use"
                  name="how_to_use"
                  className="mt-1 min-h-[100px]"
                  placeholder="روش مصرف محصول"
                  onChange={handleInputChange}
                  value={formState.how_to_use}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="caution">هشدارها</Label>
                <Textarea
                  id="caution"
                  name="caution"
                  className="mt-1 min-h-[80px]"
                  placeholder="نکات و هشدارهای مصرف"
                  onChange={handleInputChange}
                  value={formState.caution}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="ingredients">ترکیبات (با کاما جدا کنید)</Label>
                <Textarea
                  id="ingredients"
                  name="ingredients"
                  className="mt-1"
                  placeholder="مثال: آب، گلیسیرین، ..."
                  onChange={handleInputChange}
                  value={formState.ingredients}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="tags">تگ‌ها (با کاما جدا کنید)</Label>
                <Input
                  id="tags"
                  name="tags"
                  className="mt-1"
                  placeholder="مثال: وگان، ارگانیک، ..."
                  value={formState.tags}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Price and Inventory Section */}
            <div className="p-4 border rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
              <h3 className="col-span-1 md:col-span-2 text-lg font-medium">
                قیمت و موجودی
              </h3>
              <div>
                <Label htmlFor="price">قیمت (تومان)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  className="mt-1"
                  placeholder="قیمت اصلی"
                  value={formState.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="discount_price">قیمت با تخفیف (اختیاری)</Label>
                <Input
                  id="discount_price"
                  name="discount_price"
                  type="number"
                  className="mt-1"
                  placeholder="قیمت پس از تخفیف"
                  value={formState.discount_price}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="stock">موجودی انبار</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  className="mt-1"
                  placeholder="تعداد موجود"
                  value={formState.stock}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  name="sku"
                  className="mt-1"
                  placeholder="شناسه انبار"
                  value={formState.sku}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="barcode">بارکد</Label>
                <Input
                  id="barcode"
                  name="barcode"
                  className="mt-1"
                  placeholder="بارکد محصول"
                  value={formState.barcode}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Additional Details Section */}
            <div className="p-4 border rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
              <h3 className="col-span-1 md:col-span-2 text-lg font-medium">
                جزئیات بیشتر
              </h3>
              <div>
                <Label htmlFor="volume">حجم / وزن</Label>
                <Input
                  id="volume"
                  name="volume"
                  type="number"
                  className="mt-1"
                  placeholder="عدد حجم یا وزن"
                  value={formState.volume}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="unit">واحد</Label>
                <Input
                  id="unit"
                  name="unit"
                  className="mt-1"
                  placeholder="مثال: ml, gr, oz"
                  value={formState.unit}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="product_form">شکل محصول</Label>
                <Input
                  id="product_form"
                  name="product_form"
                  className="mt-1"
                  placeholder="مثال: سرم، کرم، ژل"
                  value={formState.product_form}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="country_of_origin">کشور سازنده</Label>
                <Input
                  id="country_of_origin"
                  name="country_of_origin"
                  className="mt-1"
                  placeholder="مثال: کانادا"
                  value={formState.country_of_origin}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="manufacture_date">تاریخ تولید</Label>
                <Input
                  id="manufacture_date"
                  name="manufacture_date"
                  type="date"
                  className="mt-1"
                  value={formState.manufacture_date}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="expiry_date">تاریخ انقضا</Label>
                <Input
                  id="expiry_date"
                  name="expiry_date"
                  type="date"
                  className="mt-1"
                  value={formState.expiry_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Classification Section */}
            <div className="p-4 border rounded-lg space-y-4">
              <h3 className="text-lg font-medium">دسته‌بندی‌های تخصصی</h3>
              <div>
                <Label>نوع پوست</Label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 gap-y-4">
                  {skinTypes.map((type) => (
                    <div key={type} className="flex items-center gap-2">
                      <Checkbox
                        id={`skin-${type}`}
                        checked={selectedSkinTypes.includes(type)}
                        onCheckedChange={() =>
                          handleToggleFilter(setSelectedSkinTypes, type)
                        }
                      />
                      <Label
                        htmlFor={`skin-${type}`}
                        className="font-normal cursor-pointer"
                      >
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>نگرانی پوستی</Label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {concerns.map((concern) => (
                    <div key={concern} className="flex items-center gap-2">
                      <Checkbox
                        id={`concern-${concern}`}
                        checked={selectedConcerns.includes(concern)}
                        onCheckedChange={() =>
                          handleToggleFilter(setSelectedConcerns, concern)
                        }
                      />
                      <Label
                        htmlFor={`concern-${concern}`}
                        className="font-normal cursor-pointer"
                      >
                        {concern}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SEO Section */}
            <div className="p-4 border rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
              <h3 className="col-span-1 md:col-span-2 text-lg font-medium">
                بهینه‌سازی برای موتورهای جستجو (SEO)
              </h3>
              <div>
                <Label htmlFor="metaTitle">عنوان متا</Label>
                <Input
                  id="metaTitle"
                  name="metaTitle"
                  className="mt-1"
                  placeholder="عنوان برای نمایش در گوگل"
                  value={formState.metaTitle}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="metaDescription">توضیحات متا</Label>
                <Input
                  id="metaDescription"
                  name="metaDescription"
                  className="mt-1"
                  placeholder="توضیحات برای نمایش در گوگل"
                  value={formState.metaDescription}
                  onChange={handleInputChange}
                />
              </div>
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
              <TableHead>نام محصول</TableHead>
              <TableHead>برند</TableHead>
              <TableHead>دسته‌بندی</TableHead>
              <TableHead>قیمت</TableHead>
              <TableHead>موجودی</TableHead>
              <TableHead className="text-left">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Image
                    src={product.images[0]?.url || "/placeholder.png"}
                    alt={product.name}
                    width={40}
                    height={40}
                    className="rounded-md object-cover bg-gray-100"
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.brand?.name}</TableCell>
                <TableCell>{product.category?.name}</TableCell>
                <TableCell>
                  {product.price.toLocaleString("fa-IR")} تومان
                </TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell className="text-left">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(product)}
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
                          این عمل غیرقابل بازگشت است و محصول را برای همیشه حذف
                          خواهد کرد.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>انصراف</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(product.id)}
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

export default ManageProductsPage;

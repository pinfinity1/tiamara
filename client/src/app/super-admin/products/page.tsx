"use client";

import { useEffect, useState, useRef, ChangeEvent } from "react";
import { useShallow } from "zustand/react/shallow";
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
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Product, useProductStore } from "@/store/useProductStore";
import { useBrandStore } from "@/store/useBrandStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import {
  Pencil,
  PlusCircle,
  Trash2,
  Upload,
  X,
  Search,
  MoreHorizontal,
  RotateCcw,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebounce } from "@/hooks/use-debounce";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/common/Pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AiProductImport from "@/components/super-admin/products/AiProductImport";
import axiosAuth from "@/lib/axios";

const skinTypesForAdmin = ["چرب", "خشک", "مختلط", "نرمال", "حساس"];
const concernsForAdmin = [
  "آکنه",
  "ضد پیری",
  "لک و تیرگی",
  "خشکی و کم آبی",
  "منافذ باز",
];

const initialFormState = {
  name: "",
  englishName: "",
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

function ManageProductsPage() {
  const { toast } = useToast();

  const {
    products,
    totalPages,
    totalProducts,
    isLoading,
    fetchAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductsFromExcel,
  } = useProductStore(
    useShallow((state) => ({
      products: state.adminProducts,
      totalPages: state.adminTotalPages,
      totalProducts: state.adminTotalProducts,
      isLoading: state.isAdminLoading,
      fetchAdminProducts: state.fetchAdminProducts,
      createProduct: state.createProduct,
      updateProduct: state.updateProduct,
      deleteProduct: state.deleteProduct,
      uploadProductsFromExcel: state.uploadProductsFromExcel,
    }))
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { brands, fetchBrands } = useBrandStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    order: "desc" as "asc" | "desc",
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [productToArchive, setProductToArchive] = useState<Product | null>(
    null
  );
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [formState, setFormState] = useState(initialFormState);
  const [existingImages, setExistingImages] = useState<
    { id: string; url: string }[]
  >([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);

  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, [fetchBrands, fetchCategories]);

  useEffect(() => {
    fetchAdminProducts({
      page,
      limit: 10,
      search: debouncedSearch,
      brandId: filterBrand,
      categoryId: filterCategory,
      stockStatus: filterStock === "all" ? undefined : filterStock,
      sort: sortConfig.key,
      order: sortConfig.order,
      isArchived: activeTab === "archived",
    });
  }, [
    page,
    debouncedSearch,
    filterBrand,
    filterCategory,
    filterStock,
    sortConfig,
    activeTab,
  ]);

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
      englishName: product.englishName || "",
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

  const handleToggleFilterCheckBox = (setter: any, value: string) => {
    setter((prev: string[]) =>
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
    if (!formState.englishName) {
      toast({ title: "نام انگلیسی محصول الزامی است.", variant: "destructive" });
      return;
    }
    const formDataToSend = new FormData();
    Object.entries(formState).forEach(([key, value]) =>
      formDataToSend.append(key, value)
    );
    formDataToSend.append("skin_type", selectedSkinTypes.join(","));
    formDataToSend.append("concern", selectedConcerns.join(","));
    if (editingProduct) {
      formDataToSend.append("slug", editingProduct.slug);
      formDataToSend.append("imagesToDelete", imagesToDelete.join(","));
    }
    selectedFiles.forEach((file) => formDataToSend.append("images", file));

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
      resetForm();
      // handleRefresh();
    } else {
      toast({ title: "خطا در ذخیره‌سازی", variant: "destructive" });
    }
  };

  const handleArchiveConfirm = async () => {
    if (!productToArchive) return;
    const success = await deleteProduct(productToArchive.id);
    if (success) {
      toast({ title: "محصول به سطل زباله منتقل شد." });
      setProductToArchive(null); // بستن دیالوگ
      // handleRefresh();
    } else {
      toast({ title: "خطا در حذف.", variant: "destructive" });
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const { data } = await axiosAuth.patch(`/products/${id}/restore`);
      if (data.success) {
        toast({
          title: "محصول با موفقیت بازیابی شد.",
          className: "bg-green-600 text-white",
        });
        handleRefresh();
      }
    } catch (error: any) {
      toast({
        title: "خطا در بازیابی",
        description: error.response?.data?.message || "مشکلی پیش آمد",
        variant: "destructive",
      });
    }
  };

  const handleForceDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      const { data } = await axiosAuth.delete(
        `/products/${productToDelete.id}/force`
      );
      if (data.success) {
        toast({ title: "محصول برای همیشه حذف شد." });
        setProductToDelete(null); // بستن دیالوگ
        handleRefresh();
      }
    } catch (error) {
      toast({
        title: "خطا",
        description: "ممکن است محصول دارای سفارش ثبت شده باشد.",
        variant: "destructive",
      });
    }
  };

  const handleExcelUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const result = await uploadProductsFromExcel(file);
      if (result.success) {
        toast({ title: "آپلود موفق بود" });
        fetchAdminProducts({ page: 1 });
      } else {
        toast({
          title: "خطا",
          description: result.error,
          variant: "destructive",
        });
      }
    }
  };

  const toggleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      order: current.key === key && current.order === "desc" ? "asc" : "desc",
    }));
  };

  const handleRefresh = () => {
    fetchAdminProducts({
      page,
      limit: 10,
      search: debouncedSearch,
      brandId: filterBrand,
      categoryId: filterCategory,
      stockStatus: filterStock === "all" ? undefined : filterStock,
      isArchived: activeTab === "archived",
    });
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      {/* هدر */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">مدیریت محصولات</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalProducts} محصول در{" "}
            {activeTab === "active" ? "لیست فعال" : "سطل زباله"}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {activeTab === "active" && (
            <>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 sm:flex-none"
              >
                <Upload className="ml-2 h-4 w-4" /> اکسل
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleExcelUpload}
                />
              </Button>
              <AiProductImport onSuccess={handleRefresh} />
              <Button
                onClick={handleAddNew}
                className="flex-1 sm:flex-none shadow-md shadow-primary/20"
              >
                <PlusCircle className="ml-2 h-4 w-4" /> محصول جدید
              </Button>
            </>
          )}
        </div>
      </div>

      {/* تب‌های بالای صفحه */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => {
            setActiveTab("active");
            setPage(1);
          }}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === "active"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          محصولات فعال
        </button>
        <button
          onClick={() => {
            setActiveTab("archived");
            setPage(1);
          }}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
            activeTab === "archived"
              ? "bg-white text-red-600 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Trash2 className="w-4 h-4" /> سطل زباله
        </button>
      </div>

      {/* نوار فیلتر */}
      <div className="bg-white p-4 rounded-xl border shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ... (کد فیلترها بدون تغییر) ... */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="جستجو..."
            className="pr-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterBrand} onValueChange={setFilterBrand}>
          <SelectTrigger>
            <SelectValue placeholder="برند" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger>
            <SelectValue placeholder="دسته‌بندی" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {activeTab === "active" && (
          <Select value={filterStock} onValueChange={setFilterStock}>
            <SelectTrigger>
              <SelectValue placeholder="وضعیت موجودی" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه</SelectItem>
              <SelectItem value="in">موجود</SelectItem>
              <SelectItem value="low">کمبود</SelectItem>
              <SelectItem value="out">ناموجود</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* جدول محصولات */}
      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[80px]">تصویر</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => toggleSort("name")}
                >
                  نام محصول
                </TableHead>
                <TableHead>برند</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => toggleSort("stock")}
                >
                  موجودی
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => toggleSort("price")}
                >
                  قیمت
                </TableHead>
                <TableHead className="text-left">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      در حال بارگذاری...
                    </div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-muted-foreground"
                  >
                    {activeTab === "active"
                      ? "هیچ محصول فعالی وجود ندارد."
                      : "سطل زباله خالی است."}
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow
                    key={product.id}
                    className={`hover:bg-gray-50/50 ${
                      activeTab === "archived" ? "bg-red-50/30" : ""
                    }`}
                  >
                    <TableCell>
                      <div className="relative w-10 h-10 rounded-md overflow-hidden border bg-gray-100">
                        <Image
                          src={product.images?.[0]?.url || "/placeholder.png"}
                          alt={product.name}
                          fill
                          className={`object-cover ${
                            activeTab === "archived" ? "grayscale" : ""
                          }`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div
                        className="font-medium truncate"
                        title={product.name}
                      >
                        {product.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400 truncate font-sans">
                          {product.sku}
                        </span>
                        {activeTab === "archived" && (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-red-500 border-red-200 bg-red-50 h-5 px-1"
                          >
                            آرشیو شده
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.brand?.name}</Badge>
                    </TableCell>
                    <TableCell>
                      {product.stock === 0 ? (
                        <Badge variant="destructive">ناموجود</Badge>
                      ) : product.stock <= 10 ? (
                        <Badge className="bg-amber-500">کمبود</Badge>
                      ) : (
                        <Badge variant="secondary">{product.stock} عدد</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{product.price.toLocaleString("fa-IR")}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-left">
                      {/* ✅ FIX: دکمه‌های عملیات اصلاح شدند تا دیالوگ را درون جدول باز نکنند */}
                      {activeTab === "active" ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>عملیات محصول</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleEdit(product)}
                            >
                              <Pencil className="ml-2 h-4 w-4 text-blue-600" />
                              ویرایش اطلاعات
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="text-orange-600 focus:text-orange-700 focus:bg-orange-50 cursor-pointer"
                              // به جای باز کردن AlertDialog اینجا، فقط state را ست می‌کنیم
                              onClick={() => setProductToArchive(product)}
                            >
                              <Trash2 className="ml-2 h-4 w-4" />
                              انتقال به سطل زباله
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50 h-8 text-xs px-2"
                            onClick={() => handleRestore(product.id)}
                            title="بازگرداندن به لیست فروش"
                          >
                            <RotateCcw className="w-3.5 h-3.5 ml-1" />
                            بازیابی
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 text-xs px-2"
                            title="حذف کامل از دیتابیس"
                            // به جای باز کردن AlertDialog اینجا، فقط state را ست می‌کنیم
                            onClick={() => setProductToDelete(product)}
                          >
                            <Trash2 className="w-3.5 h-3.5 ml-1" />
                            حذف دائم
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex justify-center">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* --- مودال‌های فرم (در پایین صفحه) --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {/* ... (محتوای مودال ویرایش/افزودن محصول بدون تغییر) ... */}
        <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>
              {editingProduct ? "ویرایش محصول" : "افزودن محصول جدید"}
            </DialogTitle>
          </DialogHeader>
          {/* ... بقیه محتوا ... */}
          <div className="flex-1 overflow-hidden">
            <Tabs
              defaultValue="basic"
              className="h-full flex flex-col"
              dir="rtl"
            >
              <div className="px-6 border-b">
                <TabsList className="grid w-full grid-cols-5 bg-muted/50">
                  <TabsTrigger value="basic">اطلاعات پایه</TabsTrigger>
                  <TabsTrigger value="details">توضیحات</TabsTrigger>
                  <TabsTrigger value="classification">تخصصی</TabsTrigger>
                  <TabsTrigger value="images">تصاویر</TabsTrigger>
                  <TabsTrigger value="seo">سئو</TabsTrigger>
                </TabsList>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {/* ... (تب‌ها و فیلدهای طولانی فرم - برای کوتاهی اینجا کپی نشده چون تغییر نکرده‌اند) ... */}
                {/* لطفاً محتوای فرم را از فایل قبلی اینجا قرار دهید یا اگر نیاز است بگویید تا کامل بفرستم */}
                <TabsContent value="basic" className="mt-0 space-y-4">
                  {/* محتوای تب basic */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">نام محصول (فارسی) *</Label>
                        <Input
                          id="name"
                          name="name"
                          className="mt-1"
                          onChange={handleInputChange}
                          value={formState.name}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="englishName">
                          نام محصول (انگلیسی) *
                        </Label>
                        <Input
                          id="englishName"
                          name="englishName"
                          className="mt-1 text-left"
                          dir="ltr"
                          onChange={handleInputChange}
                          value={formState.englishName}
                          required
                        />
                      </div>
                    </div>
                    {/* ... بقیه فیلدها ... */}
                    <div>
                      <Label htmlFor="brandId">برند</Label>
                      <Select
                        value={formState.brandId}
                        onValueChange={(value) =>
                          handleSelectChange("brandId", value)
                        }
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
                    {/* ... (ادامه فیلدها مثل قیمت و موجودی) ... */}
                    <div className="grid grid-cols-2 gap-4 md:col-span-2 border-t pt-4 mt-2">
                      <div>
                        <Label htmlFor="price">قیمت (تومان)</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          className="mt-1"
                          value={formState.price}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock">موجودی</Label>
                        <Input
                          id="stock"
                          name="stock"
                          type="number"
                          className="mt-1"
                          value={formState.stock}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="details" className="mt-0 space-y-4">
                  {/* محتوای تب details (توضیحات و...) */}
                  <div className="md:col-span-2">
                    <Label htmlFor="description">توضیحات</Label>
                    <Textarea
                      id="description"
                      name="description"
                      className="mt-1 min-h-[120px]"
                      value={formState.description}
                      onChange={handleInputChange}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="classification" className="mt-0 space-y-6">
                  {/* محتوای تب classification (چک‌باکس‌ها) */}
                  <div>
                    <Label className="text-base font-semibold mb-2 block">
                      نوع پوست مناسب
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {skinTypesForAdmin.map((type) => (
                        <div
                          key={type}
                          className="flex items-center gap-2 border p-3 rounded-md hover:bg-accent"
                        >
                          <Checkbox
                            id={`skin-${type}`}
                            checked={selectedSkinTypes.includes(type)}
                            onCheckedChange={() =>
                              handleToggleFilterCheckBox(
                                setSelectedSkinTypes,
                                type
                              )
                            }
                          />
                          <Label
                            htmlFor={`skin-${type}`}
                            className="font-normal cursor-pointer flex-1"
                          >
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="images" className="mt-0 space-y-4">
                  {/* محتوای تب تصاویر */}
                  <div
                    className="flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-xl cursor-pointer hover:bg-accent/30 transition-colors"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">
                      برای آپلود تصاویر کلیک کنید
                    </p>
                    <input
                      ref={imageInputRef}
                      id="images"
                      name="images"
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="seo" className="mt-0 space-y-4">
                  {/* محتوای تب سئو */}
                  <div>
                    <Label htmlFor="metaTitle">عنوان متا</Label>
                    <Input
                      id="metaTitle"
                      name="metaTitle"
                      className="mt-1"
                      value={formState.metaTitle}
                      onChange={handleInputChange}
                    />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
          <DialogFooter className="p-6 pt-2 border-t bg-background z-10">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                انصراف
              </Button>
            </DialogClose>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading
                ? "در حال ذخیره..."
                : editingProduct
                ? "ذخیره تغییرات"
                : "ایجاد محصول"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ FIX: دیالوگ انتقال به سطل زباله (خارج از جدول) */}
      <AlertDialog
        open={!!productToArchive}
        onOpenChange={(open) => !open && setProductToArchive(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>انتقال به سطل زباله؟</AlertDialogTitle>
            <AlertDialogDescription>
              محصول "{productToArchive?.name}" غیرفعال شده و به تب "سطل زباله"
              منتقل می‌شود. آیا مطمئن هستید؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchiveConfirm}
              className="bg-orange-600 hover:bg-orange-700"
            >
              بله، منتقل کن
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ FIX: دیالوگ حذف دائم (خارج از جدول) */}
      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              حذف دائمی و غیرقابل بازگشت!
            </AlertDialogTitle>
            <AlertDialogDescription>
              شما در حال حذف کامل محصول "{productToDelete?.name}" هستید. این
              عملیات تمام تصاویر و سوابق محصول را پاک می‌کند و
              <strong className="text-red-600"> قابل بازگشت نیست.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleForceDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              بله، برای همیشه حذف کن
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ManageProductsPage;

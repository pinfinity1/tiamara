"use client";

import { useEffect, useState, useRef, ChangeEvent } from "react";
import { useProductStore, Product } from "@/store/useProductStore";
import { useBrandStore } from "@/store/useBrandStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import { Button } from "@/components/ui/button";
import { PlusCircle, Upload, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import Pagination from "@/components/common/Pagination";
import { useToast } from "@/hooks/use-toast";
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
import AiProductImport from "@/components/super-admin/products/AiProductImport";
import axiosAuth from "@/lib/axios";

// کامپوننت‌های جدا شده
import ProductListTable from "@/components/super-admin/products/ProductListTable";
import ProductFormDialog from "@/components/super-admin/products/ProductFormDialog";

export default function ManageProductsPage() {
  const {
    adminProducts: products,
    adminTotalPages: totalPages,
    adminTotalProducts: totalProducts,
    isAdminLoading: isLoading,
    fetchAdminProducts,
    deleteProduct,
    uploadProductsFromExcel,
  } = useProductStore();

  const { brands, fetchBrands } = useBrandStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    order: "desc" as "asc" | "desc",
  });

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToArchive, setProductToArchive] = useState<Product | null>(
    null
  );
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // لودینگ برای دکمه‌های دیالوگ
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, []);

  useEffect(() => {
    handleRefresh();
  }, [
    page,
    debouncedSearch,
    filterBrand,
    filterCategory,
    filterStock,
    sortConfig,
    activeTab,
  ]);

  const handleRefresh = () => {
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
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    // تاخیر کوچک برای رفع باگ فریز شدن
    setTimeout(() => handleRefresh(), 100);
  };

  // --- انتقال به سطل زباله (Soft Delete) ---
  const handleArchiveConfirm = async () => {
    if (!productToArchive) return;
    setIsActionLoading(true);

    // استفاده از متد استور که خودش درخواست را می‌فرستد
    const success = await deleteProduct(productToArchive.id);

    setIsActionLoading(false);

    if (success) {
      toast({ title: "محصول با موفقیت به سطل زباله منتقل شد." });
      setProductToArchive(null);
      setTimeout(() => handleRefresh(), 100);
    } else {
      toast({ title: "خطا در آرشیو محصول", variant: "destructive" });
    }
  };

  // --- حذف دائم (Hard Delete) ---
  const handleForceDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsActionLoading(true);
    try {
      const { data } = await axiosAuth.delete(
        `/products/${productToDelete.id}/force`
      );
      setIsActionLoading(false);

      if (data.success) {
        toast({ title: "محصول برای همیشه حذف شد." });
        setProductToDelete(null);
        setTimeout(() => handleRefresh(), 100);
      }
    } catch (error: any) {
      setIsActionLoading(false);

      const serverMsg = error.response?.data?.message || "";

      // تشخیص خطای سفارشات
      if (serverMsg.includes("user orders")) {
        toast({
          title: "غیرقابل حذف!",
          description:
            "این محصول قبلاً خریداری شده و سوابق مالی دارد. نمی‌توان آن را کاملاً پاک کرد، اما در سطل زباله باقی می‌ماند و در سایت نمایش داده نمی‌شود.",
          variant: "destructive",
          duration: 6000,
        });
      } else {
        toast({
          title: "خطا در حذف دائم",
          description: serverMsg || "مشکلی در حذف محصول پیش آمد.",
          variant: "destructive",
        });
      }
    }
  };

  // --- بازیابی محصول (Restore) ---
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
      const status = error.response?.status;
      const msg = error.response?.data?.message || "";

      if (status === 409 || msg.includes("already exists")) {
        toast({
          title: "تداخل اطلاعات",
          description:
            "محصولی با همین نام یا کد (SKU) در لیست فعال وجود دارد. ابتدا نام یا کد محصول فعال را تغییر دهید.",
          variant: "destructive",
          duration: 6000,
        });
      } else {
        toast({
          title: "خطا در بازیابی",
          description: msg || "مشکلی پیش آمد.",
          variant: "destructive",
        });
      }
    }
  };

  const handleExcelUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const result = await uploadProductsFromExcel(event.target.files[0]);
      if (result.success) {
        toast({ title: "آپلود موفق بود" });
        handleRefresh();
      } else {
        toast({
          title: "خطا در آپلود",
          description: result.error,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            مدیریت محصولات ({totalProducts})
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="ml-2 h-4 w-4" /> اکسل
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xlsx"
              onChange={handleExcelUpload}
            />
          </Button>
          <AiProductImport onSuccess={handleRefresh} />
          <Button
            onClick={handleAddNew}
            className="shadow-md shadow-primary/20"
          >
            <PlusCircle className="ml-2 h-4 w-4" /> محصول جدید
          </Button>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-xl border">
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => {
              setActiveTab("active");
              setPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "active" ? "bg-white shadow-sm" : "text-gray-500"
            }`}
          >
            فعال
          </button>
          <button
            onClick={() => {
              setActiveTab("archived");
              setPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "archived"
                ? "bg-white text-red-600 shadow-sm"
                : "text-gray-500"
            }`}
          >
            <Trash2 className="w-4 h-4 inline ml-1" />
            زباله
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="relative w-48">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="جستجو..."
              className="pr-9 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterBrand} onValueChange={setFilterBrand}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="برند" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه برندها</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="دسته" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه دسته‌ها</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Component */}
      <ProductListTable
        products={products}
        isLoading={isLoading}
        activeTab={activeTab}
        onEdit={handleEdit}
        onArchive={setProductToArchive}
        onDelete={setProductToDelete}
        onRestore={handleRestore}
        onSort={(key) =>
          setSortConfig((curr) => ({
            key,
            order: curr.key === key && curr.order === "desc" ? "asc" : "desc",
          }))
        }
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Form Dialog */}
      <ProductFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        productToEdit={editingProduct}
        onSuccess={handleFormSuccess}
      />

      {/* Archive Confirm Dialog */}
      <AlertDialog
        open={!!productToArchive}
        onOpenChange={(open) => !open && setProductToArchive(null)}
      >
        <AlertDialogContent onCloseAutoFocus={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
            <AlertDialogDescription>
              محصول به آرشیو منتقل می‌شود و در سایت نمایش داده نخواهد شد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionLoading}>
              انصراف
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleArchiveConfirm();
              }}
              disabled={isActionLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isActionLoading ? "در حال انتقال..." : "بله، منتقل کن"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Permanently Confirm Dialog */}
      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <AlertDialogContent onCloseAutoFocus={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              حذف دائمی و غیرقابل بازگشت!
            </AlertDialogTitle>
            <AlertDialogDescription>
              این عمل تمام سوابق و تصاویر محصول را پاک می‌کند. در صورت وجود
              سفارش برای این محصول، عملیات انجام نخواهد شد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionLoading}>
              انصراف
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleForceDeleteConfirm();
              }}
              disabled={isActionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isActionLoading ? "در حال حذف..." : "بله، برای همیشه حذف کن"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

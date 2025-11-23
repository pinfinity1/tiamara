"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useHomepageStore, FeatureBanner } from "@/store/useHomepageStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  PlusCircle,
  Trash2,
  Edit,
  GripVertical,
  UploadCloud,
  Loader2,
  Calendar as CalendarIcon,
  Eye,
  Pointer,
  Palette,
  Type,
  Link as LinkIcon,
  Image as ImageIcon,
  Smartphone,
  Monitor,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { LINK_TYPES, STATIC_PAGES, getLinkLabel } from "@/lib/routeUtils";
import { Product, useProductStore } from "@/store/useProductStore";
import { Brand, useBrandStore } from "@/store/useBrandStore";
import { Category, useCategoryStore } from "@/store/useCategoryStore";

// --- Type Definitions ---
interface BannerConfig {
  file: File; // Desktop File
  preview: string; // Desktop Preview
  mobileFile: File | null; // Mobile File (Required now)
  mobilePreview: string | null; // Mobile Preview

  linkType: string;
  linkValue: string;
  altText: string;
  isActive: boolean;
  title: string;
  description: string;
  buttonText: string;
  textColor: string;
}

interface LinkSelectorProps {
  type: string;
  value: string;
  onTypeChange: (newType: string) => void;
  onValueChange: (newValue: string) => void;
  products: Product[];
  brands: Brand[];
  categories: Category[];
}

// --- Sub-components ---
const LinkSelector: React.FC<LinkSelectorProps> = ({
  type,
  value,
  onTypeChange,
  onValueChange,
  products,
  brands,
  categories,
}) => {
  // محاسبه لینک نهایی برای نمایش به ادمین
  const getFinalPreviewUrl = () => {
    if (!value) return "";
    switch (type) {
      case LINK_TYPES.PRODUCT:
        return `/products/${value}`;
      case LINK_TYPES.BRAND:
        return `/brands/${value}`;
      case LINK_TYPES.CATEGORY:
        return `/categories/${value}`;
      case LINK_TYPES.STATIC:
        return value;
      case LINK_TYPES.MANUAL:
      default:
        return value;
    }
  };

  const finalUrl = getFinalPreviewUrl();

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {/* انتخاب نوع لینک */}
        <Select value={type} onValueChange={onTypeChange}>
          <SelectTrigger className="w-[140px] bg-white shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={LINK_TYPES.MANUAL}>لینک دستی</SelectItem>
            <SelectItem value={LINK_TYPES.STATIC}>صفحه ثابت</SelectItem>
            <SelectItem value={LINK_TYPES.PRODUCT}>محصول</SelectItem>
            <SelectItem value={LINK_TYPES.BRAND}>برند</SelectItem>
            <SelectItem value={LINK_TYPES.CATEGORY}>دسته‌بندی</SelectItem>
          </SelectContent>
        </Select>

        {/* انتخاب مقدار لینک (بر اساس نوع) */}
        <div className="flex-1">
          {type === LINK_TYPES.MANUAL && (
            <Input
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              dir="ltr"
              placeholder="https://... or /page"
              className="bg-white"
            />
          )}
          {type === LINK_TYPES.STATIC && (
            <Select value={value} onValueChange={onValueChange}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="انتخاب صفحه..." />
              </SelectTrigger>
              <SelectContent>
                {STATIC_PAGES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {type === LINK_TYPES.PRODUCT && (
            <Select value={value} onValueChange={onValueChange}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="جستجو و انتخاب محصول..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.slug}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {type === LINK_TYPES.BRAND && (
            <Select value={value} onValueChange={onValueChange}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="انتخاب برند..." />
              </SelectTrigger>
              <SelectContent>
                {brands.map((b) => (
                  <SelectItem key={b.id} value={b.slug}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {type === LINK_TYPES.CATEGORY && (
            <Select value={value} onValueChange={onValueChange}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="انتخاب دسته‌بندی..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* --- بخش جدید: نمایش و تست لینک --- */}
      {finalUrl && (
        <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-md border border-blue-100 text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-semibold text-blue-700 shrink-0">
              لینک نهایی:
            </span>
            <span
              className="font-mono text-gray-600 truncate dir-ltr"
              dir="ltr"
            >
              {finalUrl}
            </span>
          </div>
          <a
            href={finalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold hover:underline shrink-0 ml-2"
            title="تست لینک در تب جدید"
          >
            تست
            <LinkIcon className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
};

const SortableBanner = ({
  banner,
  onEdit,
  onDelete,
  products,
  brands,
  categories,
}: {
  banner: FeatureBanner;
  onEdit: (banner: FeatureBanner) => void;
  onDelete: (id: string) => void;
  products: Product[];
  brands: Brand[];
  categories: Category[];
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: banner.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group border rounded-xl p-3 flex items-start gap-4 bg-white touch-none hover:shadow-md transition-shadow"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab p-2 mt-2 hover:bg-gray-100 rounded-md"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      <div className="flex gap-3">
        {/* Desktop Thumbnail */}
        <div className="relative w-32 h-12 rounded-lg overflow-hidden border bg-gray-50">
          <Image
            src={banner.imageUrl}
            alt={banner.altText || "Desktop"}
            fill
            className="object-cover"
          />
          <div className="absolute bottom-0 right-0 bg-black/50 text-white text-[8px] px-1">
            Desktop
          </div>
        </div>
        {/* Mobile Thumbnail */}
        {banner.imageUrlMobile ? (
          <div className="relative w-16 h-12 rounded-lg overflow-hidden border bg-gray-50">
            <Image
              src={banner.imageUrlMobile}
              alt={banner.altText || "Mobile"}
              fill
              className="object-cover"
            />
            <div className="absolute bottom-0 right-0 bg-black/50 text-white text-[8px] px-1">
              Mobile
            </div>
          </div>
        ) : (
          <div className="w-16 h-12 rounded-lg bg-red-50 flex flex-col items-center justify-center text-[10px] text-red-400 border border-dashed border-red-200">
            <span>ناقص</span>
          </div>
        )}
      </div>
      <div className="text-sm text-muted-foreground flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 truncate text-base">
            {banner.title || "(بدون عنوان)"}
          </span>
          {!banner.isActive && (
            <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full">
              غیرفعال
            </span>
          )}
        </div>
        <p className="text-xs truncate opacity-80">
          {banner.description || "بدون توضیحات"}
        </p>
        <div className="flex items-center gap-4 text-xs pt-1 border-t w-fit pr-2">
          <span className="flex items-center gap-1" title="تعداد نمایش">
            <Eye className="h-3.5 w-3.5 text-blue-500" /> {banner.views}
          </span>
          <span className="flex items-center gap-1" title="تعداد کلیک">
            <Pointer className="h-3.5 w-3.5 text-green-500" /> {banner.clicks}
          </span>
          <span className="text-xs text-gray-400 px-2 border-r">
            لینک:{" "}
            {getLinkLabel(banner.linkUrl || "", products, brands, categories)}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(banner)}>
          <Edit className="h-4 w-4 ml-1" />
          ویرایش
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 ml-1" />
              حذف
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>حذف بنر</AlertDialogTitle>
              <AlertDialogDescription>
                آیا مطمئن هستید؟ این عمل قابل بازگشت نیست.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>لغو</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(banner.id)}>
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

// --- Main Component ---
function BannerManager() {
  // Stores
  const {
    banners,
    isLoading,
    fetchBanners,
    addBanner,
    deleteBanner,
    reorderBanners,
    deleteBannerGroup,
  } = useHomepageStore();
  const { products, fetchAllProductsForAdmin } = useProductStore();
  const { brands, fetchBrands } = useBrandStore();
  const { categories, fetchCategories } = useCategoryStore();

  // UI State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<FeatureBanner | null>(
    null
  );
  const [bannerConfigs, setBannerConfigs] = useState<BannerConfig[]>([]);
  const [activeGroup, setActiveGroup] = useState<string>("");
  const [newGroupName, setNewGroupName] = useState("");

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    fetchBanners();
    fetchAllProductsForAdmin();
    fetchBrands();
    fetchCategories();
  }, [fetchBanners, fetchAllProductsForAdmin, fetchBrands, fetchCategories]);

  const bannerGroups = useMemo(
    () => Array.from(new Set(banners.map((b) => b.group))).sort(),
    [banners]
  );

  useEffect(() => {
    if (bannerGroups.length > 0 && !activeGroup) {
      setActiveGroup(bannerGroups[0]);
    }
  }, [bannerGroups, activeGroup]);

  const bannersToShow = useMemo(
    () =>
      banners
        .filter((b) => b.group === activeGroup)
        .sort((a, b) => a.order - b.order),
    [banners, activeGroup]
  );

  // Handlers for Desktop Files (Initial Drag & Drop)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newConfigs: BannerConfig[] = newFiles.map((file) => ({
        file, // Desktop
        preview: URL.createObjectURL(file),
        mobileFile: null, // Mobile starts empty
        mobilePreview: null,
        linkType: LINK_TYPES.MANUAL,
        linkValue: "/",
        altText: "",
        isActive: true,
        title: "",
        description: "",
        buttonText: "",
        textColor: "#000000",
      }));
      setBannerConfigs((prev) => [...prev, ...newConfigs]);
    }
  };

  // Handler for individual Mobile File selection
  const handleMobileFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);
      setBannerConfigs((prev) => {
        const newConfigs = [...prev];
        newConfigs[index] = {
          ...newConfigs[index],
          mobileFile: file,
          mobilePreview: preview,
        };
        return newConfigs;
      });
    }
  };

  const updateBannerConfig = (
    index: number,
    field: keyof BannerConfig,
    value: string | boolean
  ) => {
    setBannerConfigs((prev) => {
      const newConfigs = [...prev];
      // @ts-ignore
      newConfigs[index] = { ...newConfigs[index], [field]: value };
      if (field === "linkType") newConfigs[index].linkValue = "";
      return newConfigs;
    });
  };

  const removeConfig = (index: number) => {
    setBannerConfigs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddNew = () => {
    setBannerConfigs([]);
    setIsAddDialogOpen(true);
  };

  const handleEdit = (banner: FeatureBanner) => {
    setCurrentBanner(banner);
    setIsEditDialogOpen(true);
  };

  const handleAddSubmit = async () => {
    if (bannerConfigs.length === 0) {
      toast({ title: "لطفا حداقل یک عکس آپلود کنید", variant: "destructive" });
      return;
    }

    // ** Validation: Check if all banners have a mobile image **
    const missingMobile = bannerConfigs.some((config) => !config.mobileFile);
    if (missingMobile) {
      toast({
        title: "نقص اطلاعات",
        description:
          "لطفاً برای تمام بنرها، تصویر نسخه موبایل را نیز انتخاب کنید.",
        variant: "destructive",
      });
      return;
    }

    const data = new FormData();
    const bannerMetadata = bannerConfigs.map((config) => {
      let finalLink = "";
      switch (config.linkType) {
        case LINK_TYPES.PRODUCT:
          finalLink = `/products/${config.linkValue}`;
          break;
        case LINK_TYPES.BRAND:
          finalLink = `/brands/${config.linkValue}`;
          break;
        case LINK_TYPES.CATEGORY:
          finalLink = `/categories/${config.linkValue}`;
          break;
        default:
          finalLink = config.linkValue;
          break;
      }

      data.append("images", config.file); // 1. Desktop
      if (config.mobileFile) {
        data.append("images", config.mobileFile); // 2. Mobile
      }

      return {
        linkUrl: finalLink,
        altText: config.altText,
        isActive: config.isActive,
        title: config.title,
        description: config.description,
        buttonText: config.buttonText,
        textColor: config.textColor,
      };
    });

    data.append("bannersData", JSON.stringify(bannerMetadata));
    data.append("group", activeGroup);

    const success = await addBanner(data);
    if (success) setIsAddDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteBanner(id);
  };

  const handleDeleteGroup = async () => {
    if (!activeGroup) return;
    const success = await deleteBannerGroup(activeGroup);
    if (success) {
      const remainingGroups = bannerGroups.filter((g) => g !== activeGroup);
      setActiveGroup(remainingGroups[0] || "");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = bannersToShow.findIndex((b) => b.id === active.id);
      const newIndex = bannersToShow.findIndex((b) => b.id === over.id);
      const reorderedBanners = arrayMove(bannersToShow, oldIndex, newIndex);
      await reorderBanners(reorderedBanners);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>مدیریت گروه‌های بنر</CardTitle>
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
            <div className="flex items-center gap-2">
              <Label>گروه فعال:</Label>
              <Select value={activeGroup} onValueChange={setActiveGroup}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="یک گروه را انتخاب کنید..." />
                </SelectTrigger>
                <SelectContent>
                  {bannerGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="یا نام گروه جدید..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-[220px]"
              />
              <Button
                onClick={() => {
                  if (newGroupName.trim()) {
                    setActiveGroup(newGroupName.trim());
                    setNewGroupName("");
                  }
                }}
                disabled={!newGroupName.trim()}
              >
                ایجاد/انتخاب
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={!activeGroup || isLoading}
                  >
                    <Trash2 className="ml-2 h-4 w-4" />
                    حذف گروه '{activeGroup}'
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      آیا از حذف گروه '{activeGroup}' مطمئن هستید؟
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      این عمل تمامی بنرهای داخل این گروه را برای همیشه حذف خواهد
                      کرد.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>لغو</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteGroup}>
                      بله، حذف کن
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                بنرهای گروه:{" "}
                <span className="font-bold text-primary">
                  {activeGroup || "هیچ گروهی انتخاب نشده"}
                </span>
              </h3>
              <Button
                onClick={handleAddNew}
                disabled={!activeGroup || isLoading}
              >
                <PlusCircle className="ml-2 h-4 w-4" />
                افزودن بنر
              </Button>
            </div>
            <div className="p-4 border rounded-lg min-h-[200px] bg-gray-50/50 space-y-2">
              {bannersToShow.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={bannersToShow}
                    strategy={verticalListSortingStrategy}
                  >
                    {bannersToShow.map((banner) => (
                      <SortableBanner
                        key={banner.id}
                        banner={banner}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        products={products}
                        brands={brands}
                        categories={categories}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="text-muted-foreground text-center pt-16">
                  هنوز هیچ بنری در این گروه وجود ندارد.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================= */}
      {/* === Add Banner Dialog === */}
      {/* ========================= */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              افزودن بنرهای جدید به گروه '{activeGroup}'
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-1 pr-4 space-y-6">
            {/* بخش آپلود فایل */}
            <div className="flex justify-center items-center">
              <Label
                htmlFor="file-upload"
                className="relative cursor-pointer flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-primary transition-all"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500">
                  <UploadCloud className="w-8 h-8 mb-2" />
                  <p className="text-sm font-medium">
                    {bannerConfigs.length > 0
                      ? "برای افزودن بنرهای بیشتر کلیک کنید (دسکتاپ)"
                      : "برای شروع، عکس‌های دسکتاپ را اینجا رها کنید"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    پشتیبانی از چندین عکس همزمان
                  </p>
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  className="sr-only"
                  multiple
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </Label>
            </div>

            {/* لیست بنرهای در حال ساخت */}
            {bannerConfigs.length > 0 && (
              <div className="space-y-6">
                {bannerConfigs.map((config, index) => (
                  <div
                    key={index}
                    className="relative bg-white border rounded-xl overflow-hidden shadow-sm group"
                  >
                    {/* دکمه حذف موقت */}
                    <button
                      onClick={() => removeConfig(index)}
                      className="absolute top-2 left-2 z-10 bg-red-100 text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="حذف این مورد"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-12">
                      {/* ستون چپ: پیش‌نمایش عکس */}
                      <div className="lg:col-span-4 bg-gray-100 p-4 flex flex-col justify-start items-center border-l gap-4">
                        {/* عکس دسکتاپ */}
                        <div className="w-full">
                          <div className="flex items-center gap-2 mb-1 text-xs font-bold text-gray-500">
                            <Monitor className="w-3 h-3" />
                            دسکتاپ (آپلود شده)
                          </div>
                          {/* اصلاح شده: aspect-[4/1] برای دسکتاپ */}
                          <div className="relative w-full aspect-[4/1] rounded-lg overflow-hidden shadow-sm border">
                            <Image
                              src={config.preview}
                              alt={`Desktop Preview ${index}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>

                        {/* عکس موبایل (اجباری) */}
                        <div className="w-full border-t pt-3 border-dashed border-gray-300">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                              <Smartphone className="w-3 h-3" />
                              موبایل{" "}
                              <span className="text-red-500 text-[10px]">
                                (اجباری)
                              </span>
                            </div>
                          </div>

                          {config.mobilePreview ? (
                            // اصلاح شده: aspect-[4/3] برای موبایل
                            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-sm border group/mobile">
                              <Image
                                src={config.mobilePreview}
                                alt={`Mobile Preview ${index}`}
                                fill
                                className="object-cover"
                              />
                              {/* دکمه تغییر عکس موبایل */}
                              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/mobile:opacity-100 transition-opacity cursor-pointer">
                                <span className="text-white text-xs font-bold">
                                  تغییر
                                </span>
                                <Input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleMobileFileChange(e, index)
                                  }
                                />
                              </label>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full aspect-[4/3] rounded-lg border-2 border-dashed border-red-300 bg-red-50 cursor-pointer hover:bg-red-100 transition-colors">
                              <UploadCloud className="w-6 h-6 text-red-400 mb-1" />
                              <span className="text-[10px] text-red-500 font-bold">
                                آپلود عکس موبایل
                              </span>
                              <Input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) =>
                                  handleMobileFileChange(e, index)
                                }
                              />
                            </label>
                          )}
                        </div>

                        <div className="w-full space-y-2 mt-2 pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                            <Input
                              placeholder="متن جایگزین (Alt) برای سئو"
                              className="h-8 text-xs bg-white"
                              value={config.altText}
                              onChange={(e) =>
                                updateBannerConfig(
                                  index,
                                  "altText",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between px-1">
                            <Label className="text-xs text-gray-500">
                              وضعیت:
                            </Label>
                            <Switch
                              checked={config.isActive}
                              onCheckedChange={(c) =>
                                updateBannerConfig(index, "isActive", c)
                              }
                              className="scale-75"
                            />
                          </div>
                        </div>
                      </div>

                      {/* ستون راست: تنظیمات محتوا */}
                      <div className="lg:col-span-8 p-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* فیلدهای متنی */}
                          <div className="md:col-span-2 grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">
                            <div className="col-span-2 flex items-center gap-2 border-b pb-2 mb-1 text-primary">
                              <Type className="w-4 h-4" />
                              <h4 className="text-sm font-bold">تنظیمات متن</h4>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">
                                تیتر اصلی
                              </Label>
                              <Input
                                placeholder="مثلا: فروش ویژه"
                                className="bg-white h-9"
                                value={config.title}
                                onChange={(e) =>
                                  updateBannerConfig(
                                    index,
                                    "title",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">
                                متن دکمه
                              </Label>
                              <Input
                                placeholder="مثلا: مشاهده"
                                className="bg-white h-9"
                                value={config.buttonText}
                                onChange={(e) =>
                                  updateBannerConfig(
                                    index,
                                    "buttonText",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="col-span-2">
                              <Label className="text-xs text-gray-500">
                                توضیحات
                              </Label>
                              <Textarea
                                placeholder="توضیحات کوتاه..."
                                className="bg-white min-h-[50px] text-sm"
                                value={config.description}
                                onChange={(e) =>
                                  updateBannerConfig(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="col-span-2 flex items-center gap-3">
                              <Label className="text-xs text-gray-500 flex items-center gap-1">
                                <Palette className="w-3 h-3" /> رنگ متن:
                              </Label>
                              <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border">
                                <input
                                  type="color"
                                  value={config.textColor}
                                  onChange={(e) =>
                                    updateBannerConfig(
                                      index,
                                      "textColor",
                                      e.target.value
                                    )
                                  }
                                  className="w-6 h-6 rounded cursor-pointer border-none p-0"
                                />
                                <span className="text-xs font-mono">
                                  {config.textColor}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* تنظیمات لینک */}
                          <div className="md:col-span-2 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                            <div className="flex items-center gap-2 border-b border-blue-200 pb-2 mb-3 text-blue-600">
                              <LinkIcon className="w-4 h-4" />
                              <h4 className="text-sm font-bold">مقصد لینک</h4>
                            </div>
                            <LinkSelector
                              type={config.linkType}
                              value={config.linkValue}
                              onTypeChange={(type) =>
                                updateBannerConfig(index, "linkType", type)
                              }
                              onValueChange={(value) =>
                                updateBannerConfig(index, "linkValue", value)
                              }
                              products={products}
                              brands={brands}
                              categories={categories}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="pt-4 border-t bg-gray-50/30 -mx-6 -mb-6 p-4 mt-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={isLoading}>
                انصراف
              </Button>
            </DialogClose>
            <Button
              onClick={handleAddSubmit}
              disabled={bannerConfigs.length === 0 || isLoading}
              className="px-8"
            >
              {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {bannerConfigs.length > 0
                ? `ذخیره ${bannerConfigs.length} بنر جدید`
                : "ذخیره"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Banner Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>ویرایش بنر</DialogTitle>
          </DialogHeader>
          {currentBanner && (
            <EditBannerForm
              banner={currentBanner}
              onFinished={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// --- Edit Form Component ---
const EditBannerForm = ({
  banner,
  onFinished,
}: {
  banner: FeatureBanner;
  onFinished: () => void;
}) => {
  const { updateBanner, isLoading } = useHomepageStore();
  const { products } = useProductStore();
  const { brands } = useBrandStore();
  const { categories } = useCategoryStore();

  const [formData, setFormData] = useState({
    ...banner,
    title: banner.title || "",
    description: banner.description || "",
    buttonText: banner.buttonText || "",
    textColor: banner.textColor || "#000000",
  });

  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);

  const [desktopPreview, setDesktopPreview] = useState<string>(
    banner.imageUrl || ""
  );
  const [mobilePreview, setMobilePreview] = useState<string>(
    banner.imageUrlMobile || banner.imageUrl || ""
  );

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "desktop" | "mobile"
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);

      if (type === "desktop") {
        setDesktopFile(file);
        setDesktopPreview(previewUrl);
      } else {
        setMobileFile(file);
        setMobilePreview(previewUrl);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (desktopPreview && desktopPreview !== banner.imageUrl) {
        URL.revokeObjectURL(desktopPreview);
      }
      if (mobilePreview && mobilePreview !== banner.imageUrlMobile) {
        URL.revokeObjectURL(mobilePreview);
      }
    };
  }, [desktopPreview, mobilePreview, banner.imageUrl, banner.imageUrlMobile]);

  const handleUpdate = async () => {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined)
        data.append(key, String(value));
    });
    if (desktopFile) data.append("images[desktop]", desktopFile);
    if (mobileFile) data.append("images[mobile]", mobileFile);

    const success = await updateBanner(banner.id, data);
    if (success) onFinished();
  };

  return (
    <div className="flex flex-col gap-6 py-4 h-[80vh]">
      <div className="flex-1 overflow-y-auto px-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- ستون راست: تنظیمات محتوا --- */}
          <div className="lg:col-span-7 space-y-6">
            {/* ۱. بخش متن‌ها */}
            <div className="bg-gray-50 border rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Edit className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-gray-800">محتوای متنی</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <Label>تیتر اصلی</Label>
                  <Input
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="مثلا: جشنواره تابستانه"
                    className="bg-white"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label>متن دکمه</Label>
                  <Input
                    value={formData.buttonText || ""}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, buttonText: e.target.value }))
                    }
                    placeholder="مثلا: خرید کنید"
                    className="bg-white"
                  />
                </div>
                <div className="col-span-2">
                  <Label>توضیحات</Label>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    placeholder="متن کوتاه زیر تیتر..."
                    className="bg-white min-h-[80px]"
                  />
                </div>

                {/* انتخاب رنگ */}
                <div className="col-span-2">
                  <Label>رنگ متن</Label>
                  <div className="flex items-center gap-3 mt-1.5 p-3 bg-white rounded-lg border">
                    <input
                      type="color"
                      value={formData.textColor || "#000000"}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          textColor: e.target.value,
                        }))
                      }
                      className="w-10 h-10 rounded cursor-pointer border-none p-0"
                    />
                    <div className="flex-1 text-sm text-gray-500">
                      رنگ انتخاب شده:{" "}
                      <span className="font-mono font-bold text-gray-800">
                        {formData.textColor}
                      </span>
                    </div>
                    <div
                      className="px-4 py-2 rounded-md text-sm font-bold border"
                      style={{
                        color: formData.textColor || "#000000",
                        borderColor: formData.textColor || "#000000",
                      }}
                    >
                      پیش‌نمایش متن
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ۲. بخش لینک و تنظیمات */}
            <div className="space-y-4">
              <div>
                <Label>لینک مقصد (کلیک روی بنر)</Label>
                <div className="mt-1.5">
                  <Input
                    value={formData.linkUrl || ""}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, linkUrl: e.target.value }))
                    }
                    dir="ltr"
                    placeholder="/products/..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>تاریخ شروع</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1.5",
                          !formData.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {formData.startDate ? (
                          format(new Date(formData.startDate), "yyyy-MM-dd")
                        ) : (
                          <span>انتخاب تاریخ</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          formData.startDate
                            ? new Date(formData.startDate)
                            : undefined
                        }
                        onSelect={(date) =>
                          setFormData((p) => ({
                            ...p,
                            startDate: date?.toISOString() || null,
                          }))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>تاریخ پایان</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1.5",
                          !formData.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {formData.endDate ? (
                          format(new Date(formData.endDate), "yyyy-MM-dd")
                        ) : (
                          <span>انتخاب تاریخ</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          formData.endDate
                            ? new Date(formData.endDate)
                            : undefined
                        }
                        onSelect={(date) =>
                          setFormData((p) => ({
                            ...p,
                            endDate: date?.toISOString() || null,
                          }))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                <Label className="cursor-pointer" htmlFor="active-switch">
                  وضعیت نمایش بنر (فعال/غیرفعال)
                </Label>
                <Switch
                  id="active-switch"
                  checked={formData.isActive}
                  onCheckedChange={(c) =>
                    setFormData((p) => ({ ...p, isActive: c }))
                  }
                />
              </div>
            </div>
          </div>

          {/* --- ستون چپ: تصاویر --- */}
          <div className="lg:col-span-5 space-y-6">
            {/* تصویر دسکتاپ */}
            <div className="space-y-2">
              <Label className="flex justify-between">
                <span>تصویر دسکتاپ (افقی)</span>
                {desktopFile && (
                  <span className="text-green-600 text-xs">
                    فایل جدید انتخاب شد
                  </span>
                )}
              </Label>
              {/* اصلاح شده: aspect-[4/1] برای نمایش واقع‌گرایانه‌تر دسکتاپ */}
              <div className="relative group border-2 border-dashed border-gray-300 rounded-xl overflow-hidden hover:border-primary transition-colors bg-gray-50 aspect-[4/1]">
                {desktopPreview ? (
                  <Image
                    src={desktopPreview}
                    alt="Desktop Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <UploadCloud className="w-10 h-10" />
                  </div>
                )}

                {/* Overlay برای آپلود */}
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-medium">
                  <UploadCloud className="w-6 h-6 ml-2" />
                  تغییر تصویر
                  <Input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, "desktop")}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">
                سایز پیشنهادی: ۱۹۲۰ در ۶۰۰ پیکسل
              </p>
            </div>

            {/* تصویر موبایل */}
            <div className="space-y-2 pt-4 border-t">
              <Label className="flex justify-between">
                <span>تصویر موبایل (مستطیل استاندارد)</span>
                {mobileFile && (
                  <span className="text-green-600 text-xs">
                    فایل جدید انتخاب شد
                  </span>
                )}
              </Label>
              <div className="flex gap-4">
                {/* اصلاح شده: aspect-[4/3] برای نمایش واقع‌گرایانه‌تر موبایل ۲۸۰ پیکسلی */}
                <div className="relative group border-2 border-dashed border-gray-300 rounded-xl overflow-hidden hover:border-primary transition-colors bg-gray-50 w-full max-w-[240px] aspect-[4/3] flex-shrink-0">
                  {mobilePreview ? (
                    <Image
                      src={mobilePreview}
                      alt="Mobile Preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                  )}

                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-medium text-center p-2">
                    تغییر تصویر موبایل
                    <Input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, "mobile")}
                    />
                  </label>
                </div>
                <div className="text-xs text-gray-500 py-2 flex-1">
                  <p>در اینجا تصویر نسخه موبایل را بارگذاری کنید.</p>
                  <p className="mt-2">
                    سایز پیشنهادی: ۱۰۸۰ در ۸۰۰ پیکسل (یا نسبت ۴:۳)
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label>متن جایگزین (Alt Text)</Label>
              <Input
                value={formData.altText || ""}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, altText: e.target.value }))
                }
                placeholder="توضیح تصویر برای گوگل..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* فوتر ثابت */}
      <div className="border-t pt-4 flex justify-end gap-3 bg-white">
        <Button variant="secondary" onClick={onFinished}>
          انصراف
        </Button>
        <Button
          onClick={handleUpdate}
          disabled={isLoading}
          className="min-w-[140px]"
        >
          {isLoading ? (
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          ) : (
            "ذخیره تغییرات"
          )}
        </Button>
      </div>
    </div>
  );
};

export default BannerManager;

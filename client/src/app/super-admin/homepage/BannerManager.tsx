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
  file: File;
  preview: string;
  linkType: string;
  linkValue: string;
  altText: string;
  isActive: boolean;
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
  return (
    <div className="space-y-2">
      <Select value={type} onValueChange={onTypeChange}>
        <SelectTrigger>
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

      {type === LINK_TYPES.MANUAL && (
        <Input
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          dir="ltr"
          placeholder="/example/path"
        />
      )}
      {type === LINK_TYPES.STATIC && (
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger>
            <SelectValue placeholder="یک صفحه را انتخاب کنید..." />
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
          <SelectTrigger>
            <SelectValue placeholder="یک محصول را انتخاب کنید..." />
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
          <SelectTrigger>
            <SelectValue placeholder="یک برند را انتخاب کنید..." />
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
          <SelectTrigger>
            <SelectValue placeholder="یک دسته‌بندی را انتخاب کنید..." />
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
      className="relative group border rounded-lg p-2 flex items-center gap-4 bg-white touch-none"
    >
      <button {...attributes} {...listeners} className="cursor-grab p-2">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      <div className="flex gap-2">
        <Image
          src={banner.imageUrl}
          alt={banner.altText || "Desktop"}
          width={100}
          height={50}
          className="rounded-md object-cover h-12 w-24"
        />
        {banner.imageUrlMobile ? (
          <Image
            src={banner.imageUrlMobile}
            alt={banner.altText || "Mobile"}
            width={50}
            height={50}
            className="rounded-md object-cover h-12 w-12"
          />
        ) : (
          <div className="h-12 w-12 rounded-md bg-slate-100 flex items-center justify-center text-xs text-slate-500">
            موبایل
          </div>
        )}
      </div>
      <div className="text-sm text-muted-foreground flex-1 truncate">
        <p>
          <strong>لینک به:</strong>{" "}
          {getLinkLabel(banner.linkUrl || "", products, brands, categories)}
        </p>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" /> {banner.views}
          </span>
          <span className="flex items-center gap-1">
            <Pointer className="h-3 w-3" /> {banner.clicks}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => onEdit(banner)}>
          <Edit className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
              <AlertDialogDescription>
                این بنر برای همیشه حذف خواهد شد.
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
    updateBanner,
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

  // Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newConfigs: BannerConfig[] = newFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        linkType: LINK_TYPES.MANUAL,
        linkValue: "/",
        altText: "",
        isActive: true,
      }));
      setBannerConfigs((prev) => [...prev, ...newConfigs]);
    }
  };

  const updateBannerConfig = (
    index: number,
    field: keyof BannerConfig,
    value: string | boolean
  ) => {
    setBannerConfigs((prev) => {
      const newConfigs = [...prev];
      newConfigs[index] = { ...newConfigs[index], [field]: value };
      if (field === "linkType") newConfigs[index].linkValue = "";
      return newConfigs;
    });
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
      data.append("images", config.file);
      return {
        linkUrl: finalLink,
        altText: config.altText,
        isActive: config.isActive,
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
                placeholder="یا نام گروه جدید را وارد کنید..."
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

      {/* Add Banner Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              افزودن بنرهای جدید به گروه '{activeGroup}'
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-1 pr-4 space-y-4">
            {bannerConfigs.length > 0 &&
              bannerConfigs.map((config, index) => (
                <div
                  key={index}
                  className="border p-4 rounded-lg grid grid-cols-3 gap-4"
                >
                  <div className="col-span-1 space-y-2">
                    <Image
                      src={config.preview}
                      alt={`Preview ${index}`}
                      width={200}
                      height={100}
                      className="rounded object-cover w-full h-auto aspect-[2/1]"
                    />
                    <Input
                      placeholder="متن جایگزین (Alt)"
                      value={config.altText}
                      onChange={(e) =>
                        updateBannerConfig(index, "altText", e.target.value)
                      }
                    />
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        checked={config.isActive}
                        onCheckedChange={(c) =>
                          updateBannerConfig(index, "isActive", c)
                        }
                      />
                      <Label>فعال</Label>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label>لینک مقصد بنر</Label>
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
              ))}
            <div className="flex justify-center items-center py-4">
              <Label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 text-center"
              >
                <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                <span>
                  {bannerConfigs.length > 0
                    ? "افزودن عکس‌های بیشتر..."
                    : "برای شروع، یک یا چند عکس آپلود کنید"}
                </span>
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
          </div>
          <DialogFooter className="pt-4 border-t">
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={isLoading}>
                انصراف
              </Button>
            </DialogClose>
            <Button
              onClick={handleAddSubmit}
              disabled={bannerConfigs.length === 0 || isLoading}
            >
              {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              ذخیره {bannerConfigs.length} بنر
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

// A new dedicated component for the Edit Form
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

  const [formData, setFormData] = useState(banner);
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);

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
    <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>عکس دسکتاپ</Label>
          <Input
            type="file"
            onChange={(e) => setDesktopFile(e.target.files?.[0] || null)}
          />
        </div>
        <div>
          <Label>عکس موبایل (اختیاری)</Label>
          <Input
            type="file"
            onChange={(e) => setMobileFile(e.target.files?.[0] || null)}
          />
        </div>
      </div>
      <div>
        <Label>لینک</Label>
        {/* A simplified link editor for now, can be replaced with LinkSelector */}
        <Input
          value={formData.linkUrl || ""}
          onChange={(e) =>
            setFormData((p) => ({ ...p, linkUrl: e.target.value }))
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>تاریخ شروع</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="ml-2 h-4 w-4" />
                {formData.startDate ? (
                  format(new Date(formData.startDate), "PPP")
                ) : (
                  <span>تاریخ را انتخاب کنید</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={
                  formData.startDate ? new Date(formData.startDate) : undefined
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
                  "w-full justify-start text-left font-normal",
                  !formData.endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="ml-2 h-4 w-4" />
                {formData.endDate ? (
                  format(new Date(formData.endDate), "PPP")
                ) : (
                  <span>تاریخ را انتخاب کنید</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={
                  formData.endDate ? new Date(formData.endDate) : undefined
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
      <div>
        <Label>متن جایگزین (Alt)</Label>
        <Input
          value={formData.altText || ""}
          onChange={(e) =>
            setFormData((p) => ({ ...p, altText: e.target.value }))
          }
        />
      </div>
      <div className="flex items-center space-x-2 pt-2">
        <Switch
          checked={formData.isActive}
          onCheckedChange={(c) => setFormData((p) => ({ ...p, isActive: c }))}
        />
        <Label>فعال</Label>
      </div>
      <DialogFooter>
        <Button variant="secondary" onClick={onFinished}>
          انصراف
        </Button>
        <Button onClick={handleUpdate} disabled={isLoading}>
          {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          ذخیره تغییرات
        </Button>
      </DialogFooter>
    </div>
  );
};

export default BannerManager;

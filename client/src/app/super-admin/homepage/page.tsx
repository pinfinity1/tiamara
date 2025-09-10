"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
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
import {
  FeatureBanner,
  HomepageSection,
  useHomepageStore,
  SectionType,
} from "@/store/useHomepageStore";
import { Product, useProductStore } from "@/store/useProductStore";
import {
  Pencil,
  PlusCircle,
  Trash2,
  UploadCloud,
  GripVertical,
} from "lucide-react";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useBrandStore } from "@/store/useBrandStore";
import { Badge } from "@/components/ui/badge";
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

function SortableBanner({
  banner,
  handleEditBanner,
  handleDeleteBanner,
}: {
  banner: FeatureBanner;
  handleEditBanner: (b: FeatureBanner) => void;
  handleDeleteBanner: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: banner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group border rounded-lg overflow-hidden touch-none"
    >
      <div
        className="absolute top-1/2 -translate-y-1/2 left-2 z-10 p-2 cursor-grab"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-white drop-shadow-lg" />
      </div>
      <Image
        src={banner.imageUrl}
        alt={banner.altText || "Banner"}
        width={400}
        height={200}
        className="w-full h-48 object-cover"
      />
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleEditBanner(banner)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon" className="h-8 w-8">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
              <AlertDialogDescription>
                این عمل بنر را برای همیشه حذف خواهد کرد.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>انصراف</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeleteBanner(banner.id)}
                className={buttonVariants({ variant: "destructive" })}
              >
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <Badge variant="secondary" className="absolute top-2 left-12">
        ترتیب: {banner.order}
      </Badge>
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent text-white">
        <h3 className="font-bold text-sm">متن جایگزین</h3>
        <p>{banner.altText}</p>
      </div>
    </div>
  );
}

function ManageHomepagePage() {
  const { toast } = useToast();

  const {
    banners,
    sections,
    isLoading,
    fetchBanners,
    fetchSections,
    addBanner,
    updateBanner,
    deleteBanner,
    deleteSection,
    createSection,
    updateSection,
    reorderBanners,
  } = useHomepageStore();
  const { products, fetchAllProductsForAdmin } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { brands, fetchBrands } = useBrandStore();

  // Banner State
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<FeatureBanner | null>(
    null
  );
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerFormData, setBannerFormData] = useState({
    linkUrl: "/",
    altText: "",
    order: 0,
    isActive: true,
  });

  // Section State
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(
    null
  );
  const [sectionFormData, setSectionFormData] = useState({
    title: "",
    order: 0,
  });
  const [sectionType, setSectionType] = useState<SectionType>(
    SectionType.MANUAL
  );
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  useEffect(() => {
    fetchBanners();
    fetchSections();
    fetchAllProductsForAdmin();
    fetchCategories();
    fetchBrands();
  }, [
    fetchBanners,
    fetchSections,
    fetchAllProductsForAdmin,
    fetchCategories,
    fetchBrands,
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = banners.findIndex((b) => b.id === active.id);
      const newIndex = banners.findIndex((b) => b.id === over.id);
      const reordered = arrayMove(banners, oldIndex, newIndex);
      reorderBanners(reordered);
    }
  };

  const resetBannerForm = () => {
    setEditingBanner(null);
    setBannerFile(null);
    setBannerPreview(null);
    setBannerFormData({
      linkUrl: "/",
      altText: "",
      order: 0,
      isActive: true,
    });
  };

  const handleAddNewBanner = () => {
    resetBannerForm();
    setIsBannerDialogOpen(true);
  };

  const handleBannerFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleEditBanner = (banner: FeatureBanner) => {
    resetBannerForm();
    setEditingBanner(banner);
    setBannerFormData({
      linkUrl: banner.linkUrl || "/",
      altText: banner.altText || "",
      order: banner.order,
      isActive: banner.isActive,
    });
    setBannerPreview(banner.imageUrl);
    setIsBannerDialogOpen(true);
  };

  const handleDeleteBanner = async (id: string) => {
    const success = await deleteBanner(id);
    if (success) {
      toast({ title: "بنر با موفقیت حذف شد." });
    } else {
      toast({ title: "خطا در حذف بنر.", variant: "destructive" });
    }
  };

  const handleBannerSubmit = async () => {
    if (!editingBanner && !bannerFile) {
      toast({
        title: "لطفا یک تصویر برای بنر انتخاب کنید.",
        variant: "destructive",
      });
      return;
    }

    const data = new FormData();
    Object.entries(bannerFormData).forEach(([key, value]) => {
      data.append(key, String(value));
    });

    if (bannerFile) {
      data.append("image", bannerFile);
    } else if (editingBanner) {
      data.append("imageUrl", editingBanner.imageUrl);
    }

    const result = editingBanner
      ? await updateBanner(editingBanner.id, data)
      : await addBanner(data);

    if (result) {
      toast({
        title: `بنر با موفقیت ${editingBanner ? "ویرایش" : "ایجاد"} شد.`,
      });
      setIsBannerDialogOpen(false);
    } else {
      toast({
        title: `خطا در ${editingBanner ? "ویرایش" : "ایجاد"} بنر.`,
        variant: "destructive",
      });
    }
  };

  const resetSectionForm = () => {
    setEditingSection(null);
    setSectionFormData({ title: "", order: 0 });
    setSectionType(SectionType.MANUAL);
    setSelectedProductIds([]);
  };

  const handleAddNewSection = () => {
    resetSectionForm();
    setIsSectionDialogOpen(true);
  };

  const handleEditSection = (section: HomepageSection) => {
    resetSectionForm();
    setEditingSection(section);
    setSectionFormData({ title: section.title, order: section.order });
    setSectionType(section.type);
    setSelectedProductIds(section.products.map((p) => p.id));
    setIsSectionDialogOpen(true);
  };

  const handleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSectionSubmit = async () => {
    const data = {
      ...sectionFormData,
      type: sectionType,
      productIds: sectionType === SectionType.MANUAL ? selectedProductIds : [],
    };

    const result = editingSection
      ? await updateSection(editingSection.id, data)
      : await createSection(data);

    if (result) {
      toast({
        title: `سکشن با موفقیت ${editingSection ? "ویرایش" : "ایجاد"} شد.`,
      });
      setIsSectionDialogOpen(false);
    } else {
      toast({
        title: `خطا در ${editingSection ? "ویرایش" : "ایجاد"} سکشن.`,
        variant: "destructive",
      });
    }
  };

  const handleSectionDelete = async (id: string) => {
    const success = await deleteSection(id);
    if (success) {
      toast({ title: "سکشن با موفقیت حذف شد." });
    } else {
      toast({ title: "خطا در حذف سکشن.", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Banner Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">مدیریت بنرهای صفحه اصلی</h1>
          <Button onClick={handleAddNewBanner}>
            <PlusCircle className="ml-2" /> افزودن بنر جدید
          </Button>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={banners.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map((banner) => (
                <SortableBanner
                  key={banner.id}
                  banner={banner}
                  handleEditBanner={handleEditBanner}
                  handleDeleteBanner={handleDeleteBanner}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Sections Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">مدیریت سکشن‌های محصولات</h1>
          <Button onClick={handleAddNewSection}>
            <PlusCircle className="ml-2" /> افزودن سکشن جدید
          </Button>
        </div>
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{section.title}</h3>
                  <Badge variant="outline">
                    ترتیب: {section.order} | نوع: {section.type}
                  </Badge>
                </div>
                <div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditSection(section)}
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
                        <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
                        <AlertDialogDescription>
                          این عمل سکشن را برای همیشه حذف خواهد کرد.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>انصراف</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleSectionDelete(section.id)}
                          className={buttonVariants({ variant: "destructive" })}
                        >
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {section.products &&
                  section.products.map((product) => (
                    <div
                      key={product.id}
                      className="border rounded-md p-2 text-center text-sm"
                    >
                      <Image
                        src={product.images[0]?.url || "/placeholder.png"}
                        alt={product.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover mx-auto rounded-md mb-2"
                      />
                      <p>{product.name}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Banner Dialog */}
      <Dialog open={isBannerDialogOpen} onOpenChange={setIsBannerDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? "ویرایش بنر" : "افزودن بنر جدید"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="col-span-1 md:col-span-2">
              <Label>تصویر بنر</Label>
              <div
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer"
                onClick={() =>
                  document.getElementById("banner-file-upload")?.click()
                }
              >
                <div className="space-y-1 text-center">
                  {bannerPreview ? (
                    <Image
                      src={bannerPreview}
                      alt="Preview"
                      width={120}
                      height={120}
                      className="mx-auto h-24 w-auto object-contain"
                    />
                  ) : (
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600 justify-center">
                    <span className="relative rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                      <span>آپلود فایل</span>
                      <input
                        id="banner-file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleBannerFileChange}
                        accept="image/*"
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-1 md:col-span-2">
              <Label>لینک مقصد</Label>
              <Select
                dir="rtl"
                value={bannerFormData.linkUrl}
                onValueChange={(value) =>
                  setBannerFormData((p) => ({ ...p, linkUrl: value }))
                }
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="یک مقصد برای بنر انتخاب کنید..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectGroup>
                    <SelectLabel>صفحات اصلی</SelectLabel>
                    <SelectItem value="/">صفحه اصلی</SelectItem>
                    <SelectItem value="/listing">همه محصولات</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>دسته‌بندی‌ها</SelectLabel>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={`/listing?category=${category.slug}`}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>برندها</SelectLabel>
                    {brands.map((brand) => (
                      <SelectItem
                        key={brand.id}
                        value={`/listing?brand=${brand.slug}`}
                      >
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>محصولات</SelectLabel>
                    {products.map((product) => (
                      <SelectItem
                        key={product.id}
                        value={`/listing/${product.slug}`}
                      >
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>متن جایگزین (Alt Text)</Label>
              <Input
                name="altText"
                value={bannerFormData.altText}
                onChange={(e) =>
                  setBannerFormData((p) => ({ ...p, altText: e.target.value }))
                }
              />
            </div>
            {editingBanner && (
              <div>
                <Label>ترتیب نمایش</Label>
                <Input
                  type="number"
                  name="order"
                  value={bannerFormData.order}
                  onChange={(e) =>
                    setBannerFormData((p) => ({
                      ...p,
                      order: Math.max(1, parseInt(e.target.value) || 1),
                    }))
                  }
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Label htmlFor="isActive">فعال باشد؟</Label>
              <Switch
                dir="ltr"
                id="isActive"
                checked={bannerFormData.isActive}
                onCheckedChange={(c) =>
                  setBannerFormData((p) => ({ ...p, isActive: c }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                انصراف
              </Button>
            </DialogClose>
            <Button onClick={handleBannerSubmit}>ذخیره</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section Dialog */}
      <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingSection ? "ویرایش سکشن" : "ایجاد سکشن جدید"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            <div className="md:col-span-1 space-y-4">
              <div>
                <Label>عنوان سکشن</Label>
                <Input
                  value={sectionFormData.title}
                  onChange={(e) =>
                    setSectionFormData((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>ترتیب نمایش</Label>
                <Input
                  type="number"
                  value={sectionFormData.order}
                  onChange={(e) =>
                    setSectionFormData((p) => ({
                      ...p,
                      order: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div>
                <Label>نوع سکشن</Label>
                <Select
                  value={sectionType}
                  onValueChange={(value: SectionType) => setSectionType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="نوع را انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SectionType.MANUAL}>دستی</SelectItem>
                    <SelectItem value={SectionType.DISCOUNTED}>
                      تخفیف‌دارها
                    </SelectItem>
                    <SelectItem value={SectionType.BEST_SELLING}>
                      پرفروش‌ترین‌ها
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {sectionType === SectionType.MANUAL && (
              <div className="md:col-span-2 border rounded-md p-4 max-h-[60vh] overflow-y-auto">
                <Label className="font-bold">انتخاب محصولات</Label>
                <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-start space-x-2 p-2 rounded-md hover:bg-gray-50"
                    >
                      <Checkbox
                        id={`prod-${product.id}`}
                        checked={selectedProductIds.includes(product.id)}
                        onCheckedChange={() =>
                          handleProductSelection(product.id)
                        }
                      />
                      <Label
                        htmlFor={`prod-${product.id}`}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Image
                          src={product.images[0]?.url || "/placeholder.png"}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                        <span className="text-xs">{product.name}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                انصراف
              </Button>
            </DialogClose>
            <Button onClick={handleSectionSubmit}>ذخیره</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ManageHomepagePage;

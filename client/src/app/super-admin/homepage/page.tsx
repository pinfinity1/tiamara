"use client";

import { useEffect, useState } from "react";
import { useHomepageStore } from "@/store/useHomepageStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Trash2, Edit, GripVertical } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionType } from "@prisma/client";
import { useProductStore } from "@/store/useProductStore";
import { useBrandStore } from "@/store/useBrandStore";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
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

// --- Sortable Banner Component ---
const SortableBanner = ({ banner, handleEditBanner, handleDeleteBanner }) => {
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
      className="relative group border rounded-lg p-2 flex flex-col items-center space-y-2 bg-card"
    >
      <Image
        src={banner.imageUrl}
        alt={banner.altText || "Banner image"}
        width={300}
        height={150}
        className="rounded-md object-cover w-full h-32"
      />
      <div className="text-sm text-muted-foreground w-full truncate">
        <p>
          <strong>لینک:</strong> {banner.linkUrl}
        </p>
        <p>
          <strong>گروه:</strong> {banner.group}
        </p>
        <p>
          <strong>وضعیت:</strong> {banner.isActive ? "فعال" : "غیرفعال"}
        </p>
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="outline"
          size="icon"
          className="bg-background"
          onClick={() => handleEditBanner(banner)}
        >
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
                این عمل غیرقابل بازگشت است. این بنر برای همیشه حذف خواهد شد.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>لغو</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDeleteBanner(banner.id)}>
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <button {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

// --- Sortable Section Component ---
const SortableSection = ({
  section,
  handleEditSection,
  handleDeleteSection,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-lg p-4 flex justify-between items-center bg-card group"
    >
      <div>
        <h3 className="font-semibold text-lg">{section.title}</h3>
        <p className="text-sm text-muted-foreground">
          نوع: {section.type} | مکان: {section.location}
        </p>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleEditSection(section)}
        >
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
                این عمل غیرقابل بازگشت است. این سکشن برای همیشه حذف خواهد شد.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>لغو</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeleteSection(section.id)}
              >
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <button {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

// --- Main Page Component ---
function ManageHomepagePage() {
  const {
    banners,
    fetchBanners,
    addBanner,
    updateBanner,
    deleteBanner,
    reorderBanners,
    sections,
    fetchSections,
    createSection,
    updateSection,
    deleteSection,
  } = useHomepageStore();

  const { products, fetchProducts } = useProductStore();
  const { brands, fetchBrands } = useBrandStore();
  const sensors = useSensors(useSensor(PointerSensor));

  // --- Banner State ---
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerFormData, setBannerFormData] = useState({
    linkUrl: "/",
    altText: "",
    isActive: true,
    group: "default",
  });
  const [activeBannerGroup, setActiveBannerGroup] = useState("default");

  // --- Section State ---
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionFile, setSectionFile] = useState<File | null>(null);
  const [sectionPreview, setSectionPreview] = useState<string | null>(null);
  const [sectionType, setSectionType] = useState<SectionType>(
    SectionType.MANUAL
  );
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [sectionFormData, setSectionFormData] = useState({
    title: "",
    order: 0,
    location: "homepage",
    brandId: "",
  });

  useEffect(() => {
    fetchBanners();
    fetchSections();
    fetchProducts();
    fetchBrands();
  }, [fetchBanners, fetchSections, fetchProducts, fetchBrands]);

  // --- Handlers for Banners ---
  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleAddNewBanner = () => {
    setEditingBanner(null);
    setBannerFormData({
      linkUrl: "/",
      altText: "",
      isActive: true,
      group: activeBannerGroup,
    });
    setBannerFile(null);
    setBannerPreview(null);
    setIsBannerDialogOpen(true);
  };

  const handleEditBanner = (banner) => {
    setEditingBanner(banner);
    setBannerFormData({
      linkUrl: banner.linkUrl,
      altText: banner.altText,
      isActive: banner.isActive,
      group: banner.group,
    });
    setBannerFile(null);
    setBannerPreview(banner.imageUrl);
    setIsBannerDialogOpen(true);
  };

  const handleBannerSubmit = async () => {
    const data = new FormData();
    if (bannerFile) data.append("file", bannerFile);
    data.append("linkUrl", bannerFormData.linkUrl);
    data.append("altText", bannerFormData.altText);
    data.append("isActive", String(bannerFormData.isActive));
    data.append("group", bannerFormData.group);

    if (editingBanner) {
      await updateBanner(editingBanner.id, data);
    } else {
      await addBanner(data);
    }
    setIsBannerDialogOpen(false);
  };

  // --- Handlers for Sections ---
  const handleSectionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSectionFile(file);
      setSectionPreview(URL.createObjectURL(file));
    }
  };

  const handleAddNewSection = () => {
    setEditingSection(null);
    setSectionFormData({
      title: "",
      order: 0,
      location: "homepage",
      brandId: "",
    });
    setSelectedProductIds([]);
    setSectionType(SectionType.MANUAL);
    setSectionFile(null);
    setSectionPreview(null);
    setIsSectionDialogOpen(true);
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setSectionFormData({
      title: section.title,
      order: section.order,
      location: section.location,
      brandId: section.brandId || "",
    });
    setSelectedProductIds(section.products.map((p) => p.id));
    setSectionType(section.type);
    setSectionFile(null);
    setSectionPreview(section.imageUrl);
    setIsSectionDialogOpen(true);
  };

  const handleSectionSubmit = async () => {
    const data = new FormData();
    if (sectionFile) data.append("file", sectionFile);
    data.append("title", sectionFormData.title);
    data.append("order", String(sectionFormData.order));
    data.append("location", sectionFormData.location);
    data.append("type", sectionType);

    if (sectionType === "BRAND") {
      data.append("brandId", sectionFormData.brandId);
    }
    if (sectionType === "MANUAL") {
      selectedProductIds.forEach((id) => data.append("productIds[]", id));
    }

    if (editingSection) {
      await updateSection(editingSection.id, data);
    } else {
      await createSection(data);
    }
    setIsSectionDialogOpen(false);
  };

  const bannersToShow = banners.filter((b) => b.group === activeBannerGroup);

  return (
    <div className="p-6 space-y-8">
      {/* Banner Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold">مدیریت بنرها</h1>
            <Input
              value={activeBannerGroup}
              onChange={(e) => setActiveBannerGroup(e.target.value)}
              placeholder="نام گروه (مثال: default)"
              className="w-48"
            />
          </div>
          <Button onClick={handleAddNewBanner}>
            <PlusCircle className="ml-2" /> افزودن بنر جدید
          </Button>
        </div>
        <div className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bannersToShow.map((banner) => (
            <SortableBanner
              key={banner.id}
              banner={banner}
              handleEditBanner={handleEditBanner}
              handleDeleteBanner={deleteBanner}
            />
          ))}
        </div>
      </div>

      {/* Section Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">مدیریت سکشن‌های صفحه اصلی</h1>
          <Button onClick={handleAddNewSection}>
            <PlusCircle className="ml-2" /> افزودن سکشن جدید
          </Button>
        </div>
        <div className="space-y-2">
          {sections.map((section) => (
            <SortableSection
              key={section.id}
              section={section}
              handleEditSection={handleEditSection}
              handleDeleteSection={deleteSection}
            />
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
            <div>
              <Label htmlFor="banner-image">تصویر بنر</Label>
              <Input
                id="banner-image"
                type="file"
                onChange={handleBannerFileChange}
              />
              {bannerPreview && (
                <Image
                  src={bannerPreview}
                  alt="Preview"
                  width={200}
                  height={100}
                  className="mt-2 rounded-md"
                />
              )}
            </div>
            <div className="space-y-4">
              <div>
                <Label>لینک</Label>
                <Input
                  value={bannerFormData.linkUrl}
                  onChange={(e) =>
                    setBannerFormData((p) => ({
                      ...p,
                      linkUrl: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>متن جایگزین (Alt)</Label>
                <Input
                  value={bannerFormData.altText}
                  onChange={(e) =>
                    setBannerFormData((p) => ({
                      ...p,
                      altText: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>گروه</Label>
                <Input
                  value={bannerFormData.group}
                  onChange={(e) =>
                    setBannerFormData((p) => ({ ...p, group: e.target.value }))
                  }
                  placeholder="default, products-page, ..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={bannerFormData.isActive}
                  onCheckedChange={(c) =>
                    setBannerFormData((p) => ({ ...p, isActive: c }))
                  }
                />
                <Label>فعال</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleBannerSubmit}>ذخیره</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section Dialog */}
      <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSection ? "ویرایش سکشن" : "افزودن سکشن جدید"}
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
                <Label>مکان نمایش</Label>
                <Input
                  value={sectionFormData.location}
                  onChange={(e) =>
                    setSectionFormData((p) => ({
                      ...p,
                      location: e.target.value,
                    }))
                  }
                  placeholder="homepage, product_page, ..."
                />
              </div>
              <div>
                <Label>تصویر پس‌زمینه (اختیاری)</Label>
                <Input type="file" onChange={handleSectionFileChange} />
                {sectionPreview && (
                  <Image
                    src={sectionPreview}
                    alt="Preview"
                    width={200}
                    height={100}
                    className="mt-2 rounded-md"
                  />
                )}
              </div>
              <div>
                <Label>نوع سکشن</Label>
                <Select
                  value={sectionType}
                  onValueChange={(v: SectionType) => setSectionType(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SectionType.MANUAL}>دستی</SelectItem>
                    <SelectItem value={SectionType.DISCOUNTED}>
                      تخفیف‌دارها
                    </SelectItem>
                    <SelectItem value={SectionType.BEST_SELLING}>
                      پرفروش‌ترین‌ها
                    </SelectItem>
                    <SelectItem value={SectionType.BRAND}>
                      بر اساس برند
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {sectionType === SectionType.BRAND && (
                <div>
                  <Label>انتخاب برند</Label>
                  <Select
                    value={sectionFormData.brandId}
                    onValueChange={(v) =>
                      setSectionFormData((p) => ({ ...p, brandId: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="یک برند انتخاب کنید" />
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
              )}
            </div>
            <div className="md:col-span-2">
              {sectionType === SectionType.MANUAL && (
                <div>
                  <h4 className="mb-2 font-semibold">انتخاب محصولات</h4>
                  <div className="h-96 overflow-y-auto border rounded-md p-2 space-y-2">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted"
                      >
                        <span>{product.name}</span>
                        <Switch
                          checked={selectedProductIds.includes(product.id)}
                          onCheckedChange={(checked) => {
                            setSelectedProductIds((prev) =>
                              checked
                                ? [...prev, product.id]
                                : prev.filter((id) => id !== product.id)
                            );
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSectionSubmit}>ذخیره</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ManageHomepagePage;

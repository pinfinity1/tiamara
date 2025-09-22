"use client";

import React, { useEffect, useState } from "react";
import {
  useHomepageStore,
  ProductCollection,
  SectionType,
} from "@/store/useHomepageStore";
import { useProductStore } from "@/store/useProductStore";
import { useBrandStore } from "@/store/useBrandStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, GripVertical } from "lucide-react";
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

// کامپوننت قابل مرتب‌سازی برای هر ردیف از مجموعه
const SortableCollectionItem = ({
  collection,
  onEdit,
  onDelete,
}: {
  collection: ProductCollection;
  onEdit: (c: ProductCollection) => void;
  onDelete: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: collection.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border p-4 rounded-lg flex justify-between items-center bg-white touch-none"
    >
      <div className="flex items-center gap-4">
        <button {...attributes} {...listeners} className="cursor-grab p-2">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>
        <div>
          <p className="font-semibold">{collection.title}</p>
          <p className="text-sm text-gray-500">{collection.type}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(collection)}>
          <Edit className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
              <AlertDialogDescription>
                این مجموعه برای همیشه حذف خواهد شد.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>لغو</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(collection.id)}>
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

function CollectionManager() {
  const {
    collections,
    fetchCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    reorderCollections,
    isLoading,
  } = useHomepageStore();
  const { products, fetchAllProductsForAdmin } = useProductStore();
  const { brands, fetchBrands } = useBrandStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] =
    useState<ProductCollection | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    type: SectionType.MANUAL,
    productIds: [] as string[],
    brandId: null as string | null,
    location: "homepage",
  });

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    fetchCollections();
    fetchAllProductsForAdmin();
    fetchBrands();
  }, [fetchCollections, fetchAllProductsForAdmin, fetchBrands]);

  const handleAddNew = () => {
    setEditingCollection(null);
    setFormData({
      title: "",
      type: SectionType.MANUAL,
      productIds: [],
      brandId: null,
      location: "homepage",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (collection: ProductCollection) => {
    setEditingCollection(collection);
    setFormData({
      title: collection.title,
      type: collection.type,
      productIds: collection.products.map((p) => p.id),
      // FIX: Ensure undefined becomes null
      brandId: collection.brandId ?? null,
      location: collection.location || "homepage",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const dataToSend = {
      ...formData,
      productIds:
        formData.type === SectionType.MANUAL ? formData.productIds : [],
      brandId: formData.type === SectionType.BRAND ? formData.brandId : null,
    };

    if (editingCollection) {
      await updateCollection(editingCollection.id, dataToSend);
    } else {
      await createCollection(dataToSend);
    }
    setIsDialogOpen(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = collections.findIndex((c) => c.id === active.id);
      const newIndex = collections.findIndex((c) => c.id === over.id);
      const reordered = arrayMove(collections, oldIndex, newIndex);
      reorderCollections(reordered);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>مدیریت مجموعه‌های محصولات</CardTitle>
          <Button onClick={handleAddNew}>
            <PlusCircle className="ml-2 h-4 w-4" /> افزودن مجموعه
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={collections}
                strategy={verticalListSortingStrategy}
              >
                {collections.map((collection) => (
                  <SortableCollectionItem
                    key={collection.id}
                    collection={collection}
                    onEdit={handleEdit}
                    onDelete={deleteCollection}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCollection ? "ویرایش مجموعه" : "ایجاد مجموعه جدید"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">عنوان</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label>نوع مجموعه</Label>
              <Select
                value={formData.type}
                onValueChange={(value: SectionType) =>
                  setFormData({
                    ...formData,
                    type: value,
                    productIds: [],
                    brandId: null,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SectionType.MANUAL}>
                    دستی (انتخاب محصول)
                  </SelectItem>
                  <SelectItem value={SectionType.BEST_SELLING}>
                    پرفروش‌ترین‌ها (خودکار)
                  </SelectItem>
                  <SelectItem value={SectionType.DISCOUNTED}>
                    تخفیف‌دارها (خودکار)
                  </SelectItem>
                  <SelectItem value={SectionType.BRAND}>
                    محصولات یک برند (خودکار)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.type === SectionType.BRAND && (
              <div>
                <Label>برند</Label>
                <Select
                  value={formData.brandId || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, brandId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="یک برند را انتخاب کنید" />
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
            {formData.type === SectionType.MANUAL && (
              <div>
                <Label>محصولات</Label>
                <p className="text-xs text-gray-500 mb-2">
                  محصولات مورد نظر را انتخاب کنید. می‌توانید چند محصول را انتخاب
                  کنید.
                </p>
                <Select
                  value={""}
                  onValueChange={(productId) => {
                    if (productId && !formData.productIds.includes(productId)) {
                      setFormData((prev) => ({
                        ...prev,
                        productIds: [...prev.productIds, productId],
                      }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="افزودن محصول به لیست..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {products.map((p) => (
                      <SelectItem
                        key={p.id}
                        value={p.id}
                        disabled={formData.productIds.includes(p.id)}
                      >
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {formData.productIds.map((id) => {
                    const product = products.find((p) => p.id === id);
                    return product ? (
                      <div
                        key={id}
                        className="flex justify-between items-center text-sm p-2 bg-gray-100 rounded"
                      >
                        <span>{product.name}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              productIds: prev.productIds.filter(
                                (pid) => pid !== id
                              ),
                            }))
                          }
                        >
                          X
                        </Button>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                لغو
              </Button>
            </DialogClose>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "در حال ذخیره..." : "ذخیره"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CollectionManager;

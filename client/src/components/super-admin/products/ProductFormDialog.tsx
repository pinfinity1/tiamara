"use client";

import { useEffect, useState, useRef, ChangeEvent } from "react";
import { useProductStore, Product } from "@/store/useProductStore";
import { useBrandStore } from "@/store/useBrandStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const skinTypesForAdmin = ["چرب", "خشک", "مختلط", "نرمال", "حساس"];

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
  metaTitle: "",
  metaDescription: "",
};

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  productToEdit: Product | null;
  onSuccess: () => void;
}

export default function ProductFormDialog({
  isOpen,
  onOpenChange,
  productToEdit,
  onSuccess,
}: Props) {
  const { createProduct, updateProduct } = useProductStore();
  const { brands } = useBrandStore();
  const { categories } = useCategoryStore();
  const { toast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState(initialFormState);
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        setFormState({
          name: productToEdit.name || "",
          englishName: productToEdit.englishName || "",
          brandId: productToEdit.brandId || "",
          categoryId: productToEdit.categoryId || "",
          description: productToEdit.description || "",
          how_to_use: productToEdit.how_to_use || "",
          caution: productToEdit.caution || "",
          price: productToEdit.price?.toString() || "",
          discount_price: productToEdit.discount_price?.toString() || "",
          stock: productToEdit.stock?.toString() || "",
          sku: productToEdit.sku || "",
          barcode: productToEdit.barcode || "",
          volume: productToEdit.volume?.toString() || "",
          unit: productToEdit.unit || "",
          metaTitle: productToEdit.metaTitle || "",
          metaDescription: productToEdit.metaDescription || "",
        });
        setSelectedSkinTypes(productToEdit.skin_type || []);
      } else {
        setFormState(initialFormState);
        setSelectedSkinTypes([]);
        setSelectedFiles([]);
        setImagesToDelete([]);
      }
    }
  }, [isOpen, productToEdit]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleSkinType = (type: string) => {
    setSelectedSkinTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(event.target.files!)]);
    }
  };

  const handleSubmit = async () => {
    if (!formState.name || !formState.englishName || !formState.price) {
      toast({
        title: "لطفاً فیلدهای ضروری (نام، قیمت) را پر کنید",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    Object.entries(formState).forEach(([key, value]) =>
      formData.append(key, value)
    );
    formData.append("skin_type", selectedSkinTypes.join(","));
    selectedFiles.forEach((file) => formData.append("images", file));

    if (productToEdit) {
      formData.append("slug", productToEdit.slug);
      if (imagesToDelete.length)
        formData.append("imagesToDelete", imagesToDelete.join(","));
    }

    let result;
    if (productToEdit) {
      result = await updateProduct(productToEdit.id, formData);
    } else {
      result = await createProduct(formData);
    }

    setIsSubmitting(false);

    if (result) {
      toast({
        title: `محصول با موفقیت ${productToEdit ? "ویرایش" : "ایجاد"} شد.`,
      });
      onSuccess();
    } else {
      toast({ title: "خطا در عملیات", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl max-h-[95vh] flex flex-col p-0"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle>
            {productToEdit ? "ویرایش محصول" : "افزودن محصول جدید"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="basic" className="h-full flex flex-col" dir="rtl">
            <div className="px-6 bg-muted/30 border-b">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">اطلاعات پایه</TabsTrigger>
                <TabsTrigger value="details">توضیحات</TabsTrigger>
                <TabsTrigger value="specs">ویژگی‌ها</TabsTrigger>
                <TabsTrigger value="images">تصاویر</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <TabsContent
                value="basic"
                className="mt-0 grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <Label>نام محصول (فارسی) *</Label>
                  <Input
                    name="name"
                    value={formState.name}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>نام محصول (انگلیسی) *</Label>
                  <Input
                    name="englishName"
                    value={formState.englishName}
                    onChange={handleInputChange}
                    dir="ltr"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>برند</Label>
                  <Select
                    value={formState.brandId}
                    onValueChange={(val) => handleSelectChange("brandId", val)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="انتخاب برند" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>دسته‌بندی</Label>
                  <Select
                    value={formState.categoryId}
                    onValueChange={(val) =>
                      handleSelectChange("categoryId", val)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="انتخاب دسته" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>قیمت (تومان)</Label>
                  <Input
                    name="price"
                    type="number"
                    value={formState.price}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>موجودی</Label>
                  <Input
                    name="stock"
                    type="number"
                    value={formState.stock}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
              </TabsContent>

              <TabsContent value="details" className="mt-0">
                <Label>توضیحات محصول</Label>
                <Textarea
                  name="description"
                  value={formState.description}
                  onChange={handleInputChange}
                  className="min-h-[200px] mt-1"
                />
              </TabsContent>

              <TabsContent value="specs" className="mt-0">
                <Label className="mb-3 block font-semibold">
                  نوع پوست مناسب
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {skinTypesForAdmin.map((type) => (
                    <div
                      key={type}
                      className="flex items-center gap-2 border p-3 rounded-lg"
                    >
                      <Checkbox
                        checked={selectedSkinTypes.includes(type)}
                        onCheckedChange={() => handleToggleSkinType(type)}
                      />
                      <Label className="font-normal cursor-pointer">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="images" className="mt-0">
                <div
                  className="border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">
                    برای آپلود تصاویر کلیک کنید
                  </p>
                  <input
                    ref={imageInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  {selectedFiles.length} فایل جدید انتخاب شده است.
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className="p-6 pt-4 border-t bg-background z-10">
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isSubmitting}>
              انصراف
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> در حال ذخیره
              </>
            ) : (
              "ذخیره تغییرات"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

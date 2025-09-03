"use client";

import { protectProductFormAction } from "@/actions/product";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useProductStore } from "@/store/useProductStore";
import { brands, categories, concerns, skinTypes } from "@/utils/config";
import { Upload } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

const initialFormState = {
  name: "",
  brand: "",
  category: "",
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
};

function SuperAdminManageProductPage() {
  const [formState, setFormState] = useState(initialFormState);

  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [selectedfiles, setSelectFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const getCurrentEditedProductId = searchParams.get("id");
  const isEditMode = !!getCurrentEditedProductId;

  const router = useRouter();
  const { createProduct, updateProduct, getProductById, isLoading, error } =
    useProductStore();

  useEffect(() => {
    if (isEditMode) {
      getProductById(getCurrentEditedProductId).then((product) => {
        if (product) {
          setFormState({
            name: product.name || "",
            brand: product.brand || "",
            category: product.category || "",
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
          });
          setSelectedSkinTypes(product.skin_type || []);
          setSelectedConcerns(product.concern || []);
        }
      });
    }
  }, [isEditMode, getCurrentEditedProductId, getProductById]);

  useEffect(() => {
    if (!isEditMode) {
      setFormState(initialFormState);
      setSelectedSkinTypes([]);
      setSelectedConcerns([]);
      setSelectFiles([]);
    }
  }, [isEditMode]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormState((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      setSelectFiles(Array.from(event.target.files));
    }
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const checkFirstLevelFormSanitization = await protectProductFormAction();

    if (!checkFirstLevelFormSanitization.success) {
      toast({
        title: checkFirstLevelFormSanitization.error,
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    Object.entries(formState).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("skin_type", selectedSkinTypes.join(","));
    formData.append("concern", selectedConcerns.join(","));

    // if (!isEditMode) {
    //   selectedfiles.forEach((file) => {
    //     formData.append("images", file);
    //   });
    // }
    if (!isEditMode) {
      if (selectedfiles.length === 0) {
        toast({
          title: "Please upload at least one image.",
          variant: "destructive",
        });
        return;
      }
      selectedfiles.forEach((file) => {
        formData.append("images", file);
      });
    }

    // const result = isEditMode
    //   ? await updateProduct(getCurrentEditedProductId, formData)
    //   : await createProduct(formData);
    // console.log(result, "result");
    // if (result) {
    //   router.push("/super-admin/products/list");
    // }
    const result =
      isEditMode && getCurrentEditedProductId
        ? await updateProduct(getCurrentEditedProductId, formData)
        : await createProduct(formData);

    if (result) {
      toast({
        title: `Product ${isEditMode ? "updated" : "created"} successfully!`,
      });
      router.push("/super-admin/products/list");
    } else {
      toast({
        title: `Failed to ${isEditMode ? "update" : "create"} product.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <h1>Add Product</h1>
        </header>
        <form
          onSubmit={handleFormSubmit}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-1"
        >
          {isEditMode ? null : (
            <div className="mt-2 w-full flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-400 p-12">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4 flex text-sm leadin-6 text-gray-600">
                  <Label>
                    <span>Click to browse</span>
                    <input
                      type="file"
                      className="sr-only"
                      multiple
                      onChange={handleFileChange}
                    />
                  </Label>
                </div>
              </div>
              {selectedfiles.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedfiles.map((file, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        width={80}
                        height={80}
                        className="h-20 w-20 object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <Label>Product Name</Label>
              <Input
                name="name"
                placeholder="Product Name"
                className="mt-1.5"
                onChange={handleInputChange}
                value={formState.name}
              />
            </div>
            <div>
              <Label>Brand</Label>
              <Select
                value={formState.brand}
                onValueChange={(value) => handleSelectChange("brand", value)}
                name="brand"
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select Brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((item) => (
                    <SelectItem key={item} value={item.toLowerCase()}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={formState.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Product Description</Label>
              <Textarea
                name="description"
                className="mt-1.5 min-h-[150px]"
                placeholder="Product description"
                onChange={handleInputChange}
                value={formState.description}
              />
            </div>
            <div>
              <Label>How to use</Label>
              <Textarea
                name="how_to_use"
                className="mt-1.5 min-h-[100px]"
                placeholder="How to use"
                onChange={handleInputChange}
                value={formState.how_to_use}
              />
            </div>
            <div>
              <Label>Caution</Label>
              <Textarea
                name="caution"
                className="mt-1.5 min-h-[100px]"
                placeholder="precaution"
                onChange={handleInputChange}
                value={formState.caution}
              />
            </div>
            <div>
              <Label>Ingredients (comma-separated)</Label>
              <Textarea
                name="ingredients"
                className="mt-1.5"
                placeholder="مثال: آب، گلیسیرین، ..."
                onChange={handleInputChange}
                value={formState.ingredients}
              />
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Textarea
                name="tags"
                className="mt-1.5"
                placeholder="مثال: وگان، ارگانیک، ..."
                onChange={handleInputChange}
                value={formState.tags}
              />
            </div>
            {/* <div>
              <Label>Gender</Label>
              <Select
                value={formState.gender}
                onValueChange={(value) => handleSelectChange("gender", value)}
                name="gender"
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="men">Men</SelectItem>
                  <SelectItem value="women">Women</SelectItem>
                  <SelectItem value="kids">Kids</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
            <div>
              <Label>Product Price</Label>
              <Input
                name="price"
                className="mt-1.5"
                placeholder="Enter Product Price"
                value={formState.price}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label>Discount Price (Optional)</Label>
              <Input
                name="discount_price"
                type="number"
                className="mt-1.5"
                placeholder="Discount Price"
                value={formState.discount_price}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label>Stock</Label>
              <Input
                name="stock"
                className="mt-1.5"
                placeholder="Enter Product Stock"
                value={formState.stock}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label>SKU</Label>
              <Input
                name="sku"
                className="mt-1.5"
                placeholder="شناسه محصول (SKU)"
                value={formState.sku}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label>Barcode</Label>
              <Input
                name="barcode"
                className="mt-1.5"
                placeholder="بارکد"
                value={formState.barcode}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Volume/Weight</Label>
                <Input
                  name="volume"
                  type="number"
                  className="mt-1.5"
                  placeholder="حجم/وزن"
                  value={formState.volume}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex-1">
                <Label>Unit</Label>
                <Input
                  name="unit"
                  className="mt-1.5"
                  placeholder="واحد (ml, g, ...)"
                  value={formState.unit}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Manufacture Date</Label>
                <Input
                  name="manufacture_date"
                  type="date"
                  className="mt-1.5"
                  value={formState.manufacture_date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex-1">
                <Label>Expiry Date</Label>
                <Input
                  name="expiry_date"
                  type="date"
                  className="mt-1.5"
                  value={formState.expiry_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <Label>Country of Origin</Label>
              <Input
                name="country_of_origin"
                className="mt-1.5"
                placeholder="کشور سازنده"
                value={formState.country_of_origin}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label>Product Form</Label>
              <Input
                name="product_form"
                className="mt-1.5"
                placeholder="شکل محصول (کرم، سرم، ...)"
                value={formState.product_form}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label>Skin Type</Label>
              <div className="mt-1.5 flex flex-wrap gap-4">
                {skinTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`skin-${type}`}
                      checked={selectedSkinTypes.includes(type)}
                      onCheckedChange={() =>
                        handleToggleFilter(setSelectedSkinTypes, type)
                      }
                    />
                    <Label htmlFor={`skin-${type}`}>{type}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Concern</Label>
              <div className="mt-1.5 flex flex-wrap gap-4">
                {concerns.map((concern) => (
                  <div key={concern} className="flex items-center space-x-2">
                    <Checkbox
                      id={`concern-${concern}`}
                      checked={selectedConcerns.includes(concern)}
                      onCheckedChange={() =>
                        handleToggleFilter(setSelectedConcerns, concern)
                      }
                    />
                    <Label htmlFor={`concern-${concern}`}>{concern}</Label>
                  </div>
                ))}
              </div>
            </div>
            <Button
              disabled={isLoading}
              type="submit"
              className="mt-1.5 w-full"
            >
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SuperAdminManageProductPage;

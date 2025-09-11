"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { useState, useTransition } from "react";
import { FilterData } from "@/store/useFilterStore";

export default function ProductFilters({ filters }: { filters: FilterData }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.get("minPrice") || filters.priceRange.min.toString()),
    parseInt(searchParams.get("maxPrice") || filters.priceRange.max.toString()),
  ]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("categories")?.split(",") || []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get("brands")?.split(",") || []
  );
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>(
    searchParams.get("skin_types")?.split(",") || []
  );
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(
    searchParams.get("concerns")?.split(",") || []
  );

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("minPrice", priceRange[0].toString());
    params.set("maxPrice", priceRange[1].toString());

    if (selectedCategories.length > 0)
      params.set("categories", selectedCategories.join(","));
    else params.delete("categories");

    if (selectedBrands.length > 0)
      params.set("brands", selectedBrands.join(","));
    else params.delete("brands");

    if (selectedSkinTypes.length > 0)
      params.set("skin_types", selectedSkinTypes.join(","));
    else params.delete("skin_types");

    if (selectedConcerns.length > 0)
      params.set("concerns", selectedConcerns.join(","));
    else params.delete("concerns");

    params.delete("page");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleFilterChange = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-semibold">دسته‌بندی‌ها</h3>
        <div className="space-y-2">
          {filters.categories.map((category) => (
            <div key={category.id} className="flex items-center">
              <Checkbox
                checked={selectedCategories.includes(category.name)}
                onCheckedChange={() =>
                  handleFilterChange(setSelectedCategories, category.name)
                }
                id={`filter-cat-${category.slug}`}
              />
              <Label
                htmlFor={`filter-cat-${category.slug}`}
                className="mr-2 text-sm cursor-pointer"
              >
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 font-semibold">برندها</h3>
        <div className="space-y-2">
          {filters.brands.map((brand) => (
            <div key={brand.id} className="flex items-center">
              <Checkbox
                checked={selectedBrands.includes(brand.name)}
                onCheckedChange={() =>
                  handleFilterChange(setSelectedBrands, brand.name)
                }
                id={`filter-brand-${brand.slug}`}
              />
              <Label
                htmlFor={`filter-brand-${brand.slug}`}
                className="mr-2 text-sm cursor-pointer"
              >
                {brand.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 font-semibold">نوع پوست</h3>
        <div className="space-y-2">
          {filters.skinTypes.map((type) => (
            <div key={type} className="flex items-center">
              <Checkbox
                checked={selectedSkinTypes.includes(type)}
                onCheckedChange={() =>
                  handleFilterChange(setSelectedSkinTypes, type)
                }
                id={`filter-skin-${type}`}
              />
              <Label
                htmlFor={`filter-skin-${type}`}
                className="mr-2 text-sm cursor-pointer"
              >
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 font-semibold">نگرانی پوستی</h3>
        <div className="space-y-2">
          {filters.concerns.map((concern) => (
            <div key={concern} className="flex items-center">
              <Checkbox
                checked={selectedConcerns.includes(concern)}
                onCheckedChange={() =>
                  handleFilterChange(setSelectedConcerns, concern)
                }
                id={`filter-concern-${concern}`}
              />
              <Label
                htmlFor={`filter-concern-${concern}`}
                className="mr-2 text-sm cursor-pointer"
              >
                {concern}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 font-semibold">محدوده قیمت</h3>
        <Slider
          min={filters.priceRange.min}
          max={filters.priceRange.max}
          step={10000}
          className="w-full"
          value={priceRange}
          onValueChange={(value) => setPriceRange(value)}
        />
        <div className="flex justify-between mt-2 text-sm">
          <span>{priceRange[0].toLocaleString("fa-IR")} تومان</span>
          <span>{priceRange[1].toLocaleString("fa-IR")} تومان</span>
        </div>
      </div>
      <Button onClick={applyFilters} className="w-full" disabled={isPending}>
        {isPending ? "در حال اعمال..." : "اعمال فیلترها"}
      </Button>
    </div>
  );
}

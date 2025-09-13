"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Slider } from "@/components/ui/slider";
import {
  useState,
  useTransition,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { FilterData } from "@/store/useFilterStore";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useDebounce } from "@/hooks/use-debounce";

export default function ProductFilters({
  filters,
  activeCategoryName,
}: {
  filters: FilterData;
  activeCategoryName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const getArrayFromParams = useCallback(
    (param: string) => {
      const value = searchParams.get(param);
      return value ? value.split(",") : [];
    },
    [searchParams]
  );

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    getArrayFromParams("categories")
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    getArrayFromParams("brands")
  );
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>(
    getArrayFromParams("skin_types")
  );
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(
    getArrayFromParams("concerns")
  );

  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get("minPrice")) || filters.priceRange.min,
    Number(searchParams.get("maxPrice")) || filters.priceRange.max,
  ]);

  const debouncedPriceRange = useDebounce(priceRange, 500);

  const [brandSearch, setBrandSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  // This effect updates the URL when any filter state changes.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const setParam = (key: string, value: string | string[]) => {
      const joinedValue = Array.isArray(value) ? value.join(",") : value;
      if (joinedValue) {
        params.set(key, joinedValue);
      } else {
        params.delete(key);
      }
    };

    setParam("categories", selectedCategories);
    setParam("brands", selectedBrands);
    setParam("skin_types", selectedSkinTypes);
    setParam("concerns", selectedConcerns);

    const [min, max] = debouncedPriceRange;
    if (min > filters.priceRange.min) {
      params.set("minPrice", String(min));
    } else {
      params.delete("minPrice");
    }

    if (max < filters.priceRange.max) {
      params.set("maxPrice", String(max));
    } else {
      params.delete("maxPrice");
    }

    // Reset page to 1 whenever filters change, but not for initial load
    if (searchParams.toString() !== params.toString()) {
      params.set("page", "1");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }, [
    selectedCategories,
    selectedBrands,
    selectedSkinTypes,
    selectedConcerns,
    debouncedPriceRange,
    pathname,
    router,
    filters.priceRange.min,
    filters.priceRange.max,
  ]);

  const handleCheckedChange = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const clearFilters = () => {
    // Just update the states, the useEffect will handle the URL
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedSkinTypes([]);
    setSelectedConcerns([]);
    setPriceRange([filters.priceRange.min, filters.priceRange.max]);
  };

  const filteredBrands = useMemo(
    () =>
      filters.brands.filter((brand) =>
        brand.name.toLowerCase().includes(brandSearch.toLowerCase())
      ),
    [filters.brands, brandSearch]
  );

  const filteredCategories = useMemo(
    () =>
      filters.categories.filter((category) =>
        category.name.toLowerCase().includes(categorySearch.toLowerCase())
      ),
    [filters.categories, categorySearch]
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">فیلترها</h3>
        <Button
          variant="link"
          className="p-0 h-auto text-xs"
          onClick={clearFilters}
        >
          حذف همه فیلترها
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["price", "brands"]}>
        {/* Price Range */}
        <AccordionItem value="price">
          <AccordionTrigger>محدوده قیمت</AccordionTrigger>
          <AccordionContent>
            <div className="px-1 pt-2">
              <Slider
                dir="rtl"
                min={filters.priceRange.min}
                max={filters.priceRange.max}
                value={priceRange}
                onValueChange={(value) =>
                  setPriceRange(value as [number, number])
                }
                step={10000}
              />
              <div className="flex justify-between mt-3 text-xs text-gray-600">
                <span>{priceRange[0].toLocaleString("fa-IR")} تومان</span>
                <span>{priceRange[1].toLocaleString("fa-IR")} تومان</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Categories */}
        {!activeCategoryName && filters.categories.length > 0 && (
          <AccordionItem value="categories">
            <AccordionTrigger>دسته‌بندی‌ها</AccordionTrigger>
            <AccordionContent>
              <Input
                placeholder="جستجوی دسته‌بندی..."
                className="mb-2"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
              />
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {filteredCategories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <Checkbox
                      checked={selectedCategories.includes(category.name)}
                      onCheckedChange={() =>
                        handleCheckedChange(
                          setSelectedCategories,
                          category.name
                        )
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
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Brands */}
        {filters.brands.length > 0 && (
          <AccordionItem value="brands">
            <AccordionTrigger>برندها</AccordionTrigger>
            <AccordionContent>
              <Input
                placeholder="جستجوی برند..."
                className="mb-2"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
              />
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {filteredBrands.map((brand) => (
                  <div key={brand.id} className="flex items-center">
                    <Checkbox
                      checked={selectedBrands.includes(brand.name)}
                      onCheckedChange={() =>
                        handleCheckedChange(setSelectedBrands, brand.name)
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
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Skin Types */}
        {filters.skinTypes.length > 0 && (
          <AccordionItem value="skinTypes">
            <AccordionTrigger>نوع پوست</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {filters.skinTypes.map((type) => (
                  <div key={type} className="flex items-center">
                    <Checkbox
                      checked={selectedSkinTypes.includes(type)}
                      onCheckedChange={() =>
                        handleCheckedChange(setSelectedSkinTypes, type)
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
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Concerns */}
        {filters.concerns.length > 0 && (
          <AccordionItem value="concerns">
            <AccordionTrigger>نگرانی پوستی</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {filters.concerns.map((concern) => (
                  <div key={concern} className="flex items-center">
                    <Checkbox
                      checked={selectedConcerns.includes(concern)}
                      onCheckedChange={() =>
                        handleCheckedChange(setSelectedConcerns, concern)
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
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
}

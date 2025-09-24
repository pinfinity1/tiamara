"use client";

import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Slider } from "@/components/ui/slider";
import { useState, useMemo, useCallback, useEffect } from "react";
import { FilterData } from "@/store/useFilterStore";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useDebounce } from "@/hooks/use-debounce";

// A single source of truth for all filter states
export interface FilterState {
  categories: string[];
  brands: string[];
  skin_types: string[];
  concerns: string[];
  minPrice: number;
  maxPrice: number;
}

interface ProductFiltersProps {
  filters: FilterData;
  initialState: FilterState;
  onFilterChange: (newState: FilterState) => void;
  onClear: () => void;
  activeCategoryName?: string;
  isModalView?: boolean;
}

export default function ProductFilters({
  filters,
  initialState,
  onFilterChange,
  onClear,
  activeCategoryName,
  isModalView = false,
}: ProductFiltersProps) {
  // Local state for immediate UI feedback (like typing in search boxes)
  const [brandSearch, setBrandSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  // Price range state for the slider component
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialState.minPrice,
    initialState.maxPrice,
  ]);
  const debouncedPriceRange = useDebounce(priceRange, 500);

  // Effect to update parent component when debounced price changes
  useEffect(() => {
    // Only apply debounce effect automatically on desktop view
    if (!isModalView) {
      onFilterChange({
        ...initialState,
        minPrice: debouncedPriceRange[0],
        maxPrice: debouncedPriceRange[1],
      });
    } else {
      // In modal view, just update the local price range state
      onFilterChange({
        ...initialState,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPriceRange, isModalView]);

  // *** FIX: Sync internal price slider when initial state changes from parent ***
  useEffect(() => {
    setPriceRange([initialState.minPrice, initialState.maxPrice]);
  }, [initialState.minPrice, initialState.maxPrice]);

  const handleCheckedChange = (
    key: keyof FilterState,
    value: string,
    checked: boolean
  ) => {
    const currentValues = initialState[key] as string[];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((item) => item !== value);
    onFilterChange({ ...initialState, [key]: newValues });
  };

  const handleClear = () => {
    // We only need to call onClear, the parent will handle the state reset
    onClear();
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
      {/* این بخش فقط در حالت دسکتاپ نمایش داده می‌شود */}
      {!isModalView && (
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">فیلترها</h3>
          <Button
            variant="link"
            className="p-0 h-auto text-xs"
            onClick={handleClear}
          >
            حذف همه فیلترها
          </Button>
        </div>
      )}

      <Accordion type="multiple" defaultValue={["price"]}>
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
                      checked={initialState.categories.includes(category.name)}
                      onCheckedChange={(checked) =>
                        handleCheckedChange(
                          "categories",
                          category.name,
                          !!checked
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
                      checked={initialState.brands.includes(brand.name)}
                      onCheckedChange={(checked) =>
                        handleCheckedChange("brands", brand.name, !!checked)
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
                      checked={initialState.skin_types.includes(type)}
                      onCheckedChange={(checked) =>
                        handleCheckedChange("skin_types", type, !!checked)
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
                      checked={initialState.concerns.includes(concern)}
                      onCheckedChange={(checked) =>
                        handleCheckedChange("concerns", concern, !!checked)
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

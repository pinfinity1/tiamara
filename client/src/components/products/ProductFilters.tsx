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

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.priceRange.min,
    filters.priceRange.max,
  ]);
  const debouncedPriceRange = useDebounce(priceRange, 500);

  const [brandSearch, setBrandSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  // Sync state with URL search params
  useEffect(() => {
    setSelectedCategories(getArrayFromParams("categories"));
    setSelectedBrands(getArrayFromParams("brands"));
    setSelectedSkinTypes(getArrayFromParams("skin_types"));
    setSelectedConcerns(getArrayFromParams("concerns"));
    setPriceRange([
      Number(searchParams.get("minPrice")) || filters.priceRange.min,
      Number(searchParams.get("maxPrice")) || filters.priceRange.max,
    ]);
  }, [
    searchParams,
    getArrayFromParams,
    filters.priceRange.min,
    filters.priceRange.max,
  ]);

  // Update URL when filter state changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    const setParam = (key: string, value: string[]) => {
      if (value.length > 0) {
        params.set(key, value.join(","));
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

    params.set("page", "1");

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
    searchParams,
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
    const params = new URLSearchParams();
    if (searchParams.get("sortBy")) {
      params.set("sortBy", searchParams.get("sortBy")!);
    }
    if (searchParams.get("sortOrder")) {
      params.set("sortOrder", searchParams.get("sortOrder")!);
    }
    router.push(`${pathname}?${params.toString()}`);
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

  const renderSelectionSection = (
    selectedItems: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selectedItems.length === 0) return null;
    return (
      <div className="space-y-2 pb-4 mb-4 border-b">
        <h4 className="font-semibold text-xs text-gray-600">انتخاب شما</h4>
        {selectedItems.map((item) => (
          <div key={`selected-${item}`} className="flex items-center">
            <Checkbox
              id={`selected-filter-${item}`}
              checked={true}
              onCheckedChange={() =>
                setter((prev) => prev.filter((i) => i !== item))
              }
            />
            <Label
              htmlFor={`selected-filter-${item}`}
              className="mr-2 text-sm cursor-pointer"
            >
              {item}
            </Label>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 lg:border lg:p-3 lg:rounded-lg">
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
              {renderSelectionSection(
                selectedCategories,
                setSelectedCategories
              )}
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
              {renderSelectionSection(selectedBrands, setSelectedBrands)}
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
              {renderSelectionSection(selectedSkinTypes, setSelectedSkinTypes)}
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
              {renderSelectionSection(selectedConcerns, setSelectedConcerns)}
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

"use client";

import { useQueryState } from "nuqs";
import { searchParamsParsers } from "@/lib/searchParams";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useState, useTransition, useMemo, useEffect } from "react";
import { Filter, Search, Trash2, X } from "lucide-react";
import { FilterOption } from "@/lib/data/get-filters";
import { cn } from "@/lib/utils";

// --- تابع کمکی برای یکدست‌سازی متن‌ها ---
const normalizeText = (text: string) => {
  if (!text) return "";
  return text.toString().replace(/ي/g, "ی").replace(/ك/g, "ک").trim();
};

interface FilterSidebarProps {
  allBrands: FilterOption[];
  allCategories: FilterOption[];
  minPriceData: number;
  maxPriceData: number;
  isMobileView?: boolean;
  onClose?: () => void;
}

export default function FilterSidebar({
  allBrands,
  allCategories,
  minPriceData,
  maxPriceData,
  isMobileView = false,
  onClose,
}: FilterSidebarProps) {
  const [isLoading, startTransition] = useTransition();

  // 1. فراخوانی هوک صفحه (برای ریست کردن آن)
  const [page, setPage] = useQueryState("page", searchParamsParsers.page);

  const [categories, setCategories] = useQueryState(
    "categories",
    searchParamsParsers.categories
  );
  const [brands, setBrands] = useQueryState(
    "brands",
    searchParamsParsers.brands
  );
  const [minPriceParam, setMinPriceParam] = useQueryState(
    "minPrice",
    searchParamsParsers.minPrice
  );
  const [maxPriceParam, setMaxPriceParam] = useQueryState(
    "maxPrice",
    searchParamsParsers.maxPrice
  );

  const isChecked = (list: string[] | null, value: string) => {
    if (!list || list.length === 0) return false;
    const normalizedValue = normalizeText(value);
    return list.some((item) => normalizeText(item) === normalizedValue);
  };

  const [localPriceRange, setLocalPriceRange] = useState([
    minPriceData,
    maxPriceData,
  ]);

  useEffect(() => {
    const currentMin = minPriceParam !== null ? minPriceParam : minPriceData;
    const currentMax = maxPriceParam !== null ? maxPriceParam : maxPriceData;

    setLocalPriceRange([currentMin, currentMax]);
  }, [minPriceParam, maxPriceParam, minPriceData, maxPriceData]);

  const [brandSearch, setBrandSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  const filteredBrands = useMemo(() => {
    return allBrands.filter(
      (b) =>
        normalizeText(b.name)
          .toLowerCase()
          .includes(normalizeText(brandSearch).toLowerCase()) ||
        (b.englishName &&
          normalizeText(b.englishName)
            .toLowerCase()
            .includes(normalizeText(brandSearch).toLowerCase()))
    );
  }, [allBrands, brandSearch]);

  const filteredCategories = useMemo(() => {
    return allCategories.filter(
      (c) =>
        normalizeText(c.name)
          .toLowerCase()
          .includes(normalizeText(categorySearch).toLowerCase()) ||
        (c.englishName &&
          normalizeText(c.englishName)
            .toLowerCase()
            .includes(normalizeText(categorySearch).toLowerCase()))
    );
  }, [allCategories, categorySearch]);

  const handleCheckboxChange = (
    value: string,
    currentList: string[] | null,
    setFn: (val: string[] | null, options?: any) => void
  ) => {
    const list = currentList || [];
    startTransition(() => {
      const options = { shallow: false, scroll: true };

      // ✅ بازگرداندن منطق ریست صفحه
      setPage(null, options);

      const exists = isChecked(list, value);

      if (exists) {
        const normalizedValue = normalizeText(value);
        const newList = list.filter(
          (item) => normalizeText(item) !== normalizedValue
        );
        setFn(newList.length > 0 ? newList : null, options);
      } else {
        setFn([...list, value], options);
      }
    });
  };

  const clearAllFilters = () => {
    startTransition(() => {
      const options = { shallow: false, scroll: true };

      // ✅ بازگرداندن منطق ریست صفحه
      setPage(null, options);

      setCategories(null, options);
      setBrands(null, options);
      setMinPriceParam(null, options);
      setMaxPriceParam(null, options);
      setLocalPriceRange([minPriceData, maxPriceData]);
    });
  };

  const hasActiveFilters =
    (categories?.length || 0) > 0 ||
    (brands?.length || 0) > 0 ||
    minPriceParam !== null ||
    maxPriceParam !== null;

  return (
    <div
      className={cn(
        "space-y-6 pb-20",
        !isMobileView && "bg-white p-5 rounded-2xl border border-gray-200"
      )}
    >
      {!isMobileView && (
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            فیلترها
          </h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2"
              onClick={clearAllFilters}
            >
              <Trash2 className="w-3 h-3 ml-1" />
              حذف همه
            </Button>
          )}
        </div>
      )}

      <Accordion type="multiple" defaultValue={["price"]} className="w-full">
        {/* --- دسته‌بندی --- */}
        <AccordionItem value="category" className="border-b border-gray-100">
          <AccordionTrigger className="hover:no-underline py-4 text-sm font-bold text-gray-800">
            دسته‌بندی‌ها
          </AccordionTrigger>
          <AccordionContent>
            <div className="mb-3 relative">
              <Input
                placeholder="جستجو..."
                className="h-9 text-xs bg-gray-50 border-gray-200 focus-visible:ring-gray-400 pl-8"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pl-1 custom-scrollbar">
              {filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-2 group cursor-pointer hover:bg-gray-50 p-1.5 rounded-md transition-colors"
                  onClick={() =>
                    handleCheckboxChange(cat.name, categories, setCategories)
                  }
                >
                  <Checkbox
                    id={`cat-${cat.id}`}
                    checked={isChecked(categories, cat.name)}
                    className="data-[state=checked]:bg-black data-[state=checked]:border-black border-gray-300"
                  />
                  <Label
                    htmlFor={`cat-${cat.id}`}
                    className="text-sm text-gray-600 cursor-pointer w-full flex justify-between"
                  >
                    <span>{cat.name}</span>
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* --- برند --- */}
        <AccordionItem value="brand" className="border-b border-gray-100">
          <AccordionTrigger className="hover:no-underline py-4 text-sm font-bold text-gray-800">
            برند
          </AccordionTrigger>
          <AccordionContent>
            <div className="mb-3 relative">
              <Input
                placeholder="جستجو..."
                className="h-9 text-xs bg-gray-50 border-gray-200 focus-visible:ring-gray-400 pl-8"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pl-1 custom-scrollbar">
              {filteredBrands.map((brand) => (
                <div
                  key={brand.id}
                  className="flex items-center gap-2 group cursor-pointer hover:bg-gray-50 p-1.5 rounded-md transition-colors"
                  onClick={() =>
                    handleCheckboxChange(brand.name, brands, setBrands)
                  }
                >
                  <Checkbox
                    id={`br-${brand.id}`}
                    checked={isChecked(brands, brand.name)}
                    className="data-[state=checked]:bg-black data-[state=checked]:border-black border-gray-300"
                  />
                  <Label
                    htmlFor={`br-${brand.id}`}
                    className="text-sm text-gray-600 cursor-pointer w-full flex justify-between"
                  >
                    <span>{brand.name}</span>
                    {brand.englishName && (
                      <span className="text-[10px] text-gray-400 font-sans">
                        {brand.englishName}
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* --- محدوده قیمت --- */}
        <AccordionItem value="price" className="border-b-0">
          <AccordionTrigger className="hover:no-underline py-4 text-sm font-bold text-gray-800">
            محدوده قیمت
          </AccordionTrigger>
          <AccordionContent className="pt-6 px-2 pb-4">
            <Slider
              dir="rtl"
              value={localPriceRange}
              min={minPriceData}
              max={maxPriceData}
              step={50000}
              minStepsBetweenThumbs={1}
              className="cursor-pointer"
              onValueChange={(val) => setLocalPriceRange(val as number[])}
              onValueCommit={(val) => {
                startTransition(() => {
                  const options = { shallow: false, scroll: true };
                  setPage(null, options);
                  const isDefaultMin = val[0] === minPriceData;
                  const isDefaultMax = val[1] === maxPriceData;
                  setMinPriceParam(isDefaultMin ? null : val[0], options);
                  setMaxPriceParam(isDefaultMax ? null : val[1], options);
                });
              }}
            />
            <div
              className="flex justify-between mt-5 text-[12px] font-medium text-gray-700"
              dir="rtl"
            >
              <div className="flex flex-col items-start gap-1">
                <span className="text-gray-400 text-[10px]">از</span>
                <span className="bg-gray-50 px-2 py-1 rounded border border-gray-200 min-w-[80px] text-center shadow-sm">
                  {localPriceRange[0].toLocaleString("fa-IR")} تومان
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-gray-400 text-[10px]">تا</span>
                <span className="bg-gray-50 px-2 py-1 rounded border border-gray-200 min-w-[80px] text-center shadow-sm">
                  {localPriceRange[1].toLocaleString("fa-IR")} تومان
                </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {isMobileView && onClose && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] flex gap-3">
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-12 px-3 shrink-0"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          )}
          <Button
            onClick={onClose}
            className="flex-1 bg-black hover:bg-gray-800 text-white h-12 text-base font-bold rounded-xl shadow-md"
          >
            مشاهده {hasActiveFilters ? "نتایج" : "همه محصولات"}
          </Button>
        </div>
      )}
    </div>
  );
}

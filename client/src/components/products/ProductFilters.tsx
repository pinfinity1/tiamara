"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import { FilterData } from "@/store/useFilterStore";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/store/useUserStore";
import { useSkinProfileModalStore } from "@/store/useSkinProfileModalStore";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "../ui/input";
import { useDebounce } from "@/hooks/use-debounce";

export interface FilterState {
  categories: string[];
  brands: string[];
  skin_types: string[];
  concerns: string[];
  minPrice: number;
  maxPrice: number;
  profileBasedFilter: boolean;
  hasDiscount?: boolean;
}

interface ProductFiltersProps {
  filters: FilterData;
  initialState: FilterState;
  onFilterChange: (state: FilterState) => void;
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
  // --- جستجوی داخلی ---
  const [brandSearch, setBrandSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  // --- استیت داخلی فیلترها ---
  const [state, setState] = useState<FilterState>(initialState);

  // --- مدیریت قیمت با Debounce ---
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialState.minPrice,
    initialState.maxPrice,
  ]);
  const debouncedPriceRange = useDebounce(priceRange, 500);

  // --- هوک‌های کاربر و پروفایل ---
  const { data: session, status: sessionStatus } = useSession();
  const { userProfile } = useUserStore();
  const { onOpen: openSkinProfileModal } = useSkinProfileModalStore();

  const isLoggedIn = sessionStatus === "authenticated";
  const isSessionLoading = sessionStatus === "loading";
  const isProfileCheckLoading =
    isSessionLoading || (isLoggedIn && !userProfile);
  const isProfileComplete = !!userProfile?.skinType;

  // ۱. سینک کردن استیت داخلی با ورودی والد
  useEffect(() => {
    setState(initialState);
    setPriceRange([initialState.minPrice, initialState.maxPrice]);
  }, [initialState]);

  // ۲. اعمال تغییرات قیمت
  useEffect(() => {
    if (
      !isModalView &&
      (debouncedPriceRange[0] !== state.minPrice ||
        debouncedPriceRange[1] !== state.maxPrice)
    ) {
      const newState = {
        ...state,
        minPrice: debouncedPriceRange[0],
        maxPrice: debouncedPriceRange[1],
      };
      setState(newState);
      onFilterChange(newState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPriceRange]);

  // ✅ اصلاح تابع: اضافه کردن آرگومان سوم (checked)
  const handleCheckboxChange = (
    section: keyof Omit<
      FilterState,
      "minPrice" | "maxPrice" | "profileBasedFilter" | "hasDiscount"
    >,
    value: string,
    checked: boolean // <-- این آرگومان اضافه شد
  ) => {
    const currentValues = (state[section] as string[]) || [];

    // اگر تیک خورده بود اضافه کن، اگر برداشته شد حذف کن
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((item) => item !== value);

    const newState = { ...state, [section]: newValues };
    setState(newState);
    if (!isModalView) {
      onFilterChange(newState);
    }
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };

  const handleProfileFilterToggle = (checked: boolean) => {
    if (!isLoggedIn) return;

    if (isProfileComplete) {
      const newState = { ...state, profileBasedFilter: checked };
      setState(newState);
      if (!isModalView) onFilterChange(newState);
    } else {
      openSkinProfileModal();
      const newState = { ...state, profileBasedFilter: false };
      setState(newState);
      if (!isModalView) onFilterChange(newState);
    }
  };

  const handleDiscountFilterToggle = (checked: boolean) => {
    const newState = { ...state, hasDiscount: checked };
    setState(newState);
    if (!isModalView) onFilterChange(newState);
  };

  const filteredBrands = useMemo(
    () =>
      filters?.brands?.filter((brand) =>
        brand.name.toLowerCase().includes(brandSearch.toLowerCase())
      ) || [],
    [filters?.brands, brandSearch]
  );

  const filteredCategories = useMemo(
    () =>
      filters?.categories?.filter((category) =>
        category.name.toLowerCase().includes(categorySearch.toLowerCase())
      ) || [],
    [filters?.categories, categorySearch]
  );

  if (!filters) return <div>در حال بارگذاری فیلترها...</div>;

  return (
    <div className="space-y-6">
      {!isModalView && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">فیلترها</h3>
          <Button
            variant="link"
            className="p-0 h-auto text-xs text-red-500 hover:text-red-600 hover:no-underline"
            onClick={onClear}
          >
            پاک کردن همه
          </Button>
        </div>
      )}

      {isProfileCheckLoading ? (
        <div className="space-y-2 border p-4 rounded-xl">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : (
        isLoggedIn && (
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between mb-1">
              <Label
                htmlFor="smart-filter"
                className="font-semibold text-blue-900 cursor-pointer"
              >
                فیلتر هوشمند پوستی
              </Label>
              <Switch
                id="smart-filter"
                checked={state.profileBasedFilter || false}
                onCheckedChange={handleProfileFilterToggle}
              />
            </div>
            <p className="text-xs text-blue-600/80 leading-relaxed">
              {isProfileComplete
                ? "نمایش محصولات سازگار با پروفایل شما"
                : "برای فعال‌سازی، پروفایل خود را تکمیل کنید"}
            </p>
          </div>
        )
      )}

      <div className="flex items-center justify-between py-2 border-b">
        <Label
          htmlFor="has-discount"
          className="text-sm font-medium cursor-pointer"
        >
          فقط کالاهای تخفیف‌دار
        </Label>
        <Switch
          id="has-discount"
          checked={state.hasDiscount || false}
          onCheckedChange={handleDiscountFilterToggle}
          dir="ltr"
        />
      </div>

      <Accordion
        type="multiple"
        defaultValue={["price", "categories", "brands"]}
        className="w-full"
      >
        {/* 1. Price Range */}
        <AccordionItem value="price">
          <AccordionTrigger>محدوده قیمت</AccordionTrigger>
          <AccordionContent>
            <div className="px-1 pt-6 pb-2">
              <Slider
                dir="ltr"
                min={filters.priceRange.min}
                max={filters.priceRange.max}
                step={50000}
                value={priceRange}
                onValueChange={handlePriceChange}
                className="mb-4"
              />
              <div className="flex justify-between items-center text-xs font-medium text-gray-600">
                <span>{priceRange[0].toLocaleString("fa-IR")} تومان</span>
                <span>{priceRange[1].toLocaleString("fa-IR")} تومان</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 2. Categories */}
        {!activeCategoryName &&
          filters.categories &&
          filters.categories.length > 0 && (
            <AccordionItem value="categories">
              <AccordionTrigger>دسته‌بندی‌ها</AccordionTrigger>
              <AccordionContent>
                <Input
                  placeholder="جستجو..."
                  className="mb-2 h-8 text-xs"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                />
                <div className="space-y-2 max-h-48 overflow-y-auto pl-1 custom-scrollbar">
                  {filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center space-x-2 space-x-reverse"
                    >
                      <Checkbox
                        id={`cat-${category.id}`}
                        checked={state.categories?.includes(category.name)}
                        // ✅ حالا ۳ آرگومان پاس می‌دهیم و ارور رفع می‌شود
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(
                            "categories",
                            category.name,
                            !!checked
                          )
                        }
                      />
                      <Label
                        htmlFor={`cat-${category.id}`}
                        className="text-sm font-normal cursor-pointer flex-1 mr-2"
                      >
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

        {/* 3. Brands */}
        {filters.brands && filters.brands.length > 0 && (
          <AccordionItem value="brands">
            <AccordionTrigger>برند</AccordionTrigger>
            <AccordionContent>
              <Input
                placeholder="جستجو..."
                className="mb-2 h-8 text-xs"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
              />
              <div className="space-y-2 max-h-48 overflow-y-auto pl-1 custom-scrollbar">
                {filteredBrands.map((brand) => (
                  <div
                    key={brand.id}
                    className="flex items-center space-x-2 space-x-reverse"
                  >
                    <Checkbox
                      id={`brand-${brand.id}`}
                      checked={state.brands?.includes(brand.name)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("brands", brand.name, !!checked)
                      }
                    />
                    <Label
                      htmlFor={`brand-${brand.id}`}
                      className="text-sm font-normal cursor-pointer flex-1 mr-2"
                    >
                      {brand.name}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* 4. Skin Types */}
        {filters.skinTypes && filters.skinTypes.length > 0 && (
          <AccordionItem value="skinTypes">
            <AccordionTrigger>نوع پوست</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 max-h-48 overflow-y-auto pl-1">
                {filters.skinTypes.map((type) => (
                  <div
                    key={type}
                    className="flex items-center space-x-2 space-x-reverse"
                  >
                    <Checkbox
                      id={`skin-${type}`}
                      checked={state.skin_types?.includes(type)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("skin_types", type, !!checked)
                      }
                    />
                    <Label
                      htmlFor={`skin-${type}`}
                      className="text-sm font-normal cursor-pointer flex-1 mr-2"
                    >
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* 5. Concerns */}
        {filters.concerns && filters.concerns.length > 0 && (
          <AccordionItem value="concerns">
            <AccordionTrigger>دغدغه پوستی</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 max-h-48 overflow-y-auto pl-1">
                {filters.concerns.map((concern) => (
                  <div
                    key={concern}
                    className="flex items-center space-x-2 space-x-reverse"
                  >
                    <Checkbox
                      id={`concern-${concern}`}
                      checked={state.concerns?.includes(concern)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("concerns", concern, !!checked)
                      }
                    />
                    <Label
                      htmlFor={`concern-${concern}`}
                      className="text-sm font-normal cursor-pointer flex-1 mr-2"
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

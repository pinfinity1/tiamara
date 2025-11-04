"use client";

import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Slider } from "@/components/ui/slider";
import { useState, useMemo, useEffect } from "react";
import { FilterData } from "@/store/useFilterStore"; //
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useDebounce } from "@/hooks/use-debounce"; //

// --- ۱. Import های جدید مورد نیاز ---
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/store/useUserStore"; //
import { useSkinProfileModalStore } from "@/store/useSkinProfileModalStore"; //
import { cn } from "@/lib/utils"; //
import { Skeleton } from "@/components/ui/skeleton"; // <-- برای لودینگ

// --- ۲. profileBasedFilter به FilterState اضافه شد ---
export interface FilterState {
  categories: string[];
  brands: string[];
  skin_types: string[];
  concerns: string[];
  minPrice: number;
  maxPrice: number;
  profileBasedFilter: boolean; // <-- اضافه شد
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
  const [brandSearch, setBrandSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialState.minPrice,
    initialState.maxPrice,
  ]);
  const debouncedPriceRange = useDebounce(priceRange, 500);

  // --- ۳. Import کردن هوک‌ها با state لودینگ ---
  const { data: session, status: sessionStatus } = useSession();
  const { userProfile, isLoading: isProfileStoreLoading } = useUserStore(); // <-- isLoading را می‌گیریم
  const { onOpen: openSkinProfileModal } = useSkinProfileModalStore();

  const isLoggedIn = sessionStatus === "authenticated";

  // --- ۴. این منطق جدید و صحیح برای حل مشکل رفرش است ---
  const isSessionLoading = sessionStatus === "loading";
  // ما در حال "بررسی پروفایل" هستیم اگر:
  // ۱. سشن در حال لود شدن است
  // ۲. یا، سشن لاگین شده، اما ما هنوز آبجکت userProfile را از استور نگرفته‌ایم (چون GlobalProfileLoader در حال فچ کردن آن است)
  const isProfileCheckLoading =
    isSessionLoading || (isLoggedIn && !userProfile);

  // پروفایل کامل است اگر:
  // آبجکت userProfile وجود داشته باشد AND فیلد skinType داخل آن باشد
  const isProfileComplete = !!userProfile?.skinType;
  // --- پایان منطق جدید ---

  useEffect(() => {
    if (!isModalView) {
      onFilterChange({
        ...initialState,
        minPrice: debouncedPriceRange[0],
        maxPrice: debouncedPriceRange[1],
      });
    } else {
      onFilterChange({
        ...initialState,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPriceRange, isModalView]);

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
    onClear();
  };

  const handleProfileFilterToggle = (checked: boolean) => {
    if (!isLoggedIn) return;

    if (isProfileComplete) {
      onFilterChange({ ...initialState, profileBasedFilter: checked });
    } else {
      openSkinProfileModal();
      onFilterChange({ ...initialState, profileBasedFilter: false });
    }
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

  // --- ۵. کامپوننت JSX فیلتر هوشمند ---
  const renderSmartFilter = () => {
    // اگر در حال چک کردن پروفایل هستیم، اسکلتون نشان بده (حل مشکل رفرش)
    if (isProfileCheckLoading) {
      return (
        <>
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex flex-col space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          </div>
          <Separator />
        </>
      );
    }

    // اگر کاربر لاگین نکرده، اصلاً این بخش را نشان نده
    if (!isLoggedIn) {
      return null;
    }

    // اگر لاگین کرده و چک کردن تمام شده، سوییچ واقعی را نشان بده
    return (
      <>
        <div className="space-y-4 pt-2">
          <div
            className={cn(
              "flex items-center justify-between rounded-lg border p-4",
              !isProfileComplete && "cursor-pointer hover:bg-muted/50"
            )}
            onClick={() => !isProfileComplete && openSkinProfileModal()}
          >
            <Label
              htmlFor="profile-filter"
              className={cn(
                "flex flex-col space-y-1",
                !isProfileComplete && "cursor-pointer"
              )}
            >
              <span className="font-semibold">فیلتر هوشمند</span>
              <span className="text-xs text-muted-foreground">
                {isProfileComplete
                  ? "فقط محصولات سازگار با پروفایل من"
                  : "برای فعالسازی، پروفایلت را کامل کن"}
              </span>
            </Label>
            <Switch
              id="profile-filter"
              checked={initialState.profileBasedFilter}
              onCheckedChange={handleProfileFilterToggle}
              disabled={!isProfileComplete}
              dir="ltr"
            />
          </div>
        </div>
        <Separator />
      </>
    );
  };

  return (
    <div className="space-y-4">
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

      {/* --- ۶. رندر کردن فیلتر هوشمند --- */}
      {/* فقط در دسکتاپ نمایش داده شود */}
      {!isModalView && renderSmartFilter()}

      <Accordion type="multiple" defaultValue={["price"]}>
        {/* Price Range */}
        <AccordionItem value="price">
          {/* ... (بقیه فیلترها بدون تغییر) ... */}
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

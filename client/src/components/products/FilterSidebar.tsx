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
import { useTransition } from "react";
import { Filter, Trash2 } from "lucide-react";
import { FilterOption } from "@/lib/data/get-filters";

interface FilterSidebarProps {
  allBrands: FilterOption[];
  allCategories: FilterOption[];
}

export default function FilterSidebar({
  allBrands,
  allCategories,
}: FilterSidebarProps) {
  const [isLoading, startTransition] = useTransition();

  // اتصال به URL Params
  const [categories, setCategories] = useQueryState(
    "categories",
    searchParamsParsers.categories
  );
  const [brands, setBrands] = useQueryState(
    "brands",
    searchParamsParsers.brands
  );
  const [minPrice, setMinPrice] = useQueryState(
    "minPrice",
    searchParamsParsers.minPrice
  );
  const [maxPrice, setMaxPrice] = useQueryState(
    "maxPrice",
    searchParamsParsers.maxPrice
  );

  // تابع تغییر چک‌باکس‌ها
  // value: نام آیتم (مثلاً "اوردینری")
  const handleCheckboxChange = (
    value: string,
    currentList: string[] | null,
    setFn: (val: string[] | null, options?: any) => void // تایپ آپدیت شد
  ) => {
    const list = currentList || [];
    startTransition(() => {
      if (list.includes(value)) {
        const newList = list.filter((item) => item !== value);
        // shallow: false اضافه شد
        setFn(newList.length > 0 ? newList : null, {
          shallow: false,
          scroll: true,
        });
      } else {
        // shallow: false اضافه شد
        setFn([...list, value], { shallow: false, scroll: true });
      }
    });
  };

  // بررسی اینکه آیا فیلتری فعال است یا نه (برای دکمه پاک کردن)
  const hasActiveFilters =
    (categories && categories.length > 0) ||
    (brands && brands.length > 0) ||
    minPrice !== 0 ||
    (maxPrice !== 100000000 && maxPrice !== null); // فرض بر اینکه پیش‌فرض ۱۰۰ میلیون است

  const clearAllFilters = () => {
    startTransition(() => {
      setCategories(null, { shallow: false });
      setBrands(null, { shallow: false });
      setMinPrice(null, { shallow: false });
      setMaxPrice(null, { shallow: false });
    });
  };

  return (
    <div className="space-y-6 pb-20 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between border-b pb-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          فیلترها
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8 px-2"
            onClick={clearAllFilters}
          >
            <Trash2 className="w-3 h-3 ml-1" />
            حذف همه
          </Button>
        )}
      </div>

      <Accordion
        type="multiple"
        defaultValue={["category", "brand", "price"]}
        className="w-full"
      >
        {/* --- دسته‌بندی --- */}
        <AccordionItem value="category" className="border-b-0">
          <AccordionTrigger className="hover:no-underline py-3 text-sm font-bold text-gray-700">
            دسته‌بندی‌ها
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 max-h-60 overflow-y-auto pl-1 custom-scrollbar">
              {allCategories.length > 0 ? (
                allCategories.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2 group">
                    <Checkbox
                      id={`cat-${cat.id}`}
                      checked={categories?.includes(cat.name) || false}
                      onCheckedChange={() =>
                        handleCheckboxChange(
                          cat.name,
                          categories,
                          setCategories
                        )
                      }
                      className="data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500"
                    />
                    <Label
                      htmlFor={`cat-${cat.id}`}
                      className="text-sm text-gray-600 cursor-pointer group-hover:text-rose-500 transition-colors w-full py-1"
                    >
                      {cat.name}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">دسته‌ای یافت نشد.</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* --- برند --- */}
        <AccordionItem value="brand" className="border-b-0 pt-2">
          <AccordionTrigger className="hover:no-underline py-3 text-sm font-bold text-gray-700">
            برند
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 max-h-60 overflow-y-auto pl-1 custom-scrollbar">
              {allBrands.length > 0 ? (
                allBrands.map((brand) => (
                  <div key={brand.id} className="flex items-center gap-2 group">
                    <Checkbox
                      id={`br-${brand.id}`}
                      checked={brands?.includes(brand.name) || false}
                      onCheckedChange={() =>
                        handleCheckboxChange(brand.name, brands, setBrands)
                      }
                      className="data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500"
                    />
                    <Label
                      htmlFor={`br-${brand.id}`}
                      className="text-sm text-gray-600 cursor-pointer group-hover:text-rose-500 transition-colors w-full py-1"
                    >
                      {brand.name}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">برندی یافت نشد.</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* --- محدوده قیمت --- */}
        <AccordionItem value="price" className="border-b-0 pt-2">
          <AccordionTrigger className="hover:no-underline py-3 text-sm font-bold text-gray-700">
            محدوده قیمت
          </AccordionTrigger>
          <AccordionContent className="pt-6 px-2 pb-4">
            <Slider
              defaultValue={[minPrice || 0, maxPrice || 20000000]}
              max={20000000} // حداکثر ۲۰ میلیون (قابل تغییر)
              step={100000}
              minStepsBetweenThumbs={1}
              className="cursor-pointer"
              // فقط وقتی کاربر موس را رها کرد آپدیت کن (پرفورمنس)
              onValueCommit={(val) => {
                startTransition(() => {
                  // shallow: false اضافه شد
                  setMinPrice(val[0] === 0 ? null : val[0], { shallow: false });
                  setMaxPrice(val[1] === 100000000 ? null : val[1], {
                    shallow: false,
                  });
                });
              }}
            />
            <div className="flex justify-between mt-4 text-[11px] font-medium text-gray-500">
              <span className="bg-gray-100 px-2 py-1 rounded">
                {(minPrice || 0).toLocaleString()} تومان
              </span>
              <span className="bg-gray-100 px-2 py-1 rounded">
                {(maxPrice || 20000000).toLocaleString()} تومان
              </span>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

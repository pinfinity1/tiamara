"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import FilterSidebar from "./FilterSidebar";
import { FilterOption } from "@/lib/data/get-filters";
import { useState } from "react";

interface MobileFilterProps {
  // این پراپ‌ها باید دقیقاً هماهنگ با FilterSidebar باشند تا بتوانیم لیست‌های خالی را پاس بدهیم
  allBrands: FilterOption[];
  allCategories: FilterOption[];
  minPriceData: number;
  maxPriceData: number;
}

export default function MobileFilter(props: MobileFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="lg:hidden flex items-center gap-2 border-gray-300 rounded-xl bg-white hover:bg-gray-50 text-gray-700"
        >
          <SlidersHorizontal className="w-4 h-4" />
          فیلترها
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-[20px] p-0 flex flex-col bg-white"
      >
        <SheetHeader className="p-5 border-b border-gray-100">
          <SheetTitle className="text-center text-gray-800 font-bold">
            فیلتر محصولات
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {/* پراپ‌ها را عیناً به سایدبار داخلی پاس می‌دهیم */}
          <FilterSidebar
            {...props}
            isMobileView={true}
            onClose={() => setIsOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

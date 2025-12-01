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
import FilterSidebar from "./FilterSidebar"; // استفاده مجدد از کامپوننت اصلی
import { FilterOption } from "@/lib/data/get-filters";
import { useState } from "react";

interface MobileFilterProps {
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
          className="lg:hidden flex items-center gap-2 border-gray-300"
        >
          <SlidersHorizontal className="w-4 h-4" />
          فیلترها
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-[20px] p-0 flex flex-col bg-white"
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-center text-gray-800">
            فیلتر محصولات
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {/* استفاده از همان کامپوننت سایدبار در موبایل */}
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

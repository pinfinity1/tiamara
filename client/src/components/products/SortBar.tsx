"use client";

import { useQueryState } from "nuqs";
import { searchParamsParsers } from "@/lib/searchParams";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

const sortOptions = [
  { value: "newest", label: "جدیدترین" },
  { value: "price_asc", label: "ارزان‌ترین" },
  { value: "price_desc", label: "گران‌ترین" },
  { value: "popular", label: "پرفروش‌ترین" },
];

export default function SortBar() {
  // اتصال دوطرفه به URL parameter 'sort'
  const [sort, setSort] = useQueryState("sort", searchParamsParsers.sort);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 hidden sm:inline-block">
        <ArrowUpDown className="w-4 h-4 inline-block ml-1" />
        مرتب‌سازی بر اساس:
      </span>
      <Select
        value={sort || "newest"}
        onValueChange={(value) =>
          setSort(value, { shallow: false, scroll: true })
        }
      >
        <SelectTrigger className="w-[160px] h-9 text-sm bg-white">
          <SelectValue placeholder="مرتب‌سازی" />
        </SelectTrigger>
        <SelectContent align="end">
          {sortOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

"use client";

import { useQueryState } from "nuqs";
import { searchParamsParsers } from "@/lib/searchParams";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

interface Props {
  totalPages: number;
}

export default function StorefrontPagination({ totalPages }: Props) {
  const [page, setPage] = useQueryState("page", searchParamsParsers.page);
  const [isPending, startTransition] = useTransition();

  const currentPage = page || 1;

  // تابع تبدیل اعداد به فارسی
  const toPersianDigits = (num: number) => num.toLocaleString("fa-IR");

  if (totalPages <= 1) return null;

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      setPage(newPage, { shallow: false, scroll: true });
    });
  };

  const generatePageNumbers = () => {
    const siblingCount = 1;
    const totalPageNumbers = siblingCount * 2 + 3;
    const totalBlocks = totalPageNumbers + 2;

    if (totalPages > totalBlocks) {
      const startPage = Math.max(2, currentPage - siblingCount);
      const endPage = Math.min(totalPages - 1, currentPage + siblingCount);

      let pages: (number | string)[] = range(startPage, endPage);

      const hasLeftSpill = startPage > 2;
      const hasRightSpill = totalPages - endPage > 1;
      const spillOffset = totalPageNumbers - (pages.length + 1);

      switch (true) {
        case hasLeftSpill && !hasRightSpill: {
          const extraPages = range(startPage - spillOffset, startPage - 1);
          pages = ["...", ...extraPages, ...pages];
          break;
        }
        case !hasLeftSpill && hasRightSpill: {
          const extraPages = range(endPage + 1, endPage + spillOffset);
          pages = [...pages, ...extraPages, "..."];
          break;
        }
        case hasLeftSpill && hasRightSpill:
        default: {
          pages = ["...", ...pages, "..."];
          break;
        }
      }
      return [1, ...pages, totalPages];
    }
    return range(1, totalPages);
  };

  const range = (start: number, end: number) => {
    let length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
  };

  return (
    <div
      className={cn(
        "flex justify-center items-center gap-2 mt-10 transition-opacity duration-300",
        isPending && "opacity-50 pointer-events-none cursor-not-allowed"
      )}
      dir="rtl"
    >
      {/* دکمه قبلی (سمت راست) - فقط اگر صفحه > 1 باشد نمایش داده شود */}
      <div className="w-10 flex justify-center">
        {currentPage > 1 && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            className="hidden sm:flex"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* شماره صفحات */}
      {generatePageNumbers().map((p, idx) =>
        typeof p === "string" ? (
          <span key={`${p}-${idx}`} className="px-2 text-gray-400 text-sm pb-2">
            ...
          </span>
        ) : (
          <Button
            key={p}
            variant={currentPage === p ? "default" : "ghost"}
            className={cn(
              "w-9 h-9 text-sm font-medium rounded-lg",
              currentPage === p
                ? "bg-black text-white hover:bg-gray-800"
                : "text-gray-600 hover:bg-gray-100"
            )}
            onClick={() => handlePageChange(p)}
          >
            {toPersianDigits(p)}
          </Button>
        )
      )}

      {/* دکمه بعدی (سمت چپ) - فقط اگر صفحه < کل صفحات باشد نمایش داده شود */}
      <div className="w-10 flex justify-center">
        {currentPage < totalPages && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

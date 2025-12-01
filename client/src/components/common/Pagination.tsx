"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  if (totalPages <= 1) return null;

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
    <div className="flex justify-center items-center gap-2 mt-10" dir="ltr">
      {/* دکمه قبلی */}
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === 1 || isLoading}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* شماره صفحات */}
      {generatePageNumbers().map((p, idx) =>
        typeof p === "string" ? (
          <span key={`${p}-${idx}`} className="px-2 text-gray-500 text-sm">
            ...
          </span>
        ) : (
          <Button
            key={p}
            variant={currentPage === p ? "default" : "outline"}
            className="w-9 h-9 text-sm"
            onClick={() => onPageChange(p)}
            disabled={isLoading}
          >
            {isLoading && currentPage === p ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              p
            )}
          </Button>
        )
      )}

      {/* دکمه بعدی */}
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === totalPages || isLoading}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

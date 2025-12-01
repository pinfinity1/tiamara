"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQueryState } from "nuqs";
import { searchParamsParsers } from "@/lib/searchParams";
import { useTransition } from "react";

interface PaginationProps {
  totalPages: number;
  // currentPage را از nuqs می‌گیریم، پس نیازی به گرفتن از props نیست (اختیاری)
}

export default function Pagination({ totalPages }: PaginationProps) {
  // اتصال به پارامتر ?page در URL
  const [page, setPage] = useQueryState("page", searchParamsParsers.page);
  const [isLoading, startTransition] = useTransition();

  const currentPage = page || 1;

  if (totalPages <= 1) return null;

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      // تغییر مهم: shallow: false باعث می‌شود درخواست به سرور ارسال شود
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
    <div className="flex justify-center items-center gap-2 mt-10">
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === 1 || isLoading}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {generatePageNumbers().map((p, idx) =>
        typeof p === "string" ? (
          <span key={`${p}-${idx}`} className="px-2 text-gray-500">
            {p}
          </span>
        ) : (
          <Button
            key={p}
            variant={currentPage === p ? "default" : "outline"}
            className="w-10"
            onClick={() => handlePageChange(p)}
            disabled={isLoading}
          >
            {p.toLocaleString("fa-IR")}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === totalPages || isLoading}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
    </div>
  );
}

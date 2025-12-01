"use client";

import { useQueryState } from "nuqs";
import { searchParamsParsers } from "@/lib/searchParams";
import Pagination from "@/components/common/Pagination";
import { useTransition } from "react";

interface Props {
  totalPages: number;
}

export default function StorefrontPagination({ totalPages }: Props) {
  // اتصال به URL برای دریافت صفحه فعلی
  const [page, setPage] = useQueryState("page", searchParamsParsers.page);
  const [isPending, startTransition] = useTransition();

  const currentPage = page || 1;

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      // اینجا shallow: false باعث رفرش دیتا از سرور می‌شود
      setPage(newPage, { shallow: false, scroll: true });
    });
  };

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      isLoading={isPending}
    />
  );
}

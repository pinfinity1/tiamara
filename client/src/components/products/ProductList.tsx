"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Product, useProductStore } from "../../store/useProductStore";
import { FilterData } from "@/store/useFilterStore";
import ProductCard from "./ProductCard";
import ProductFilters from "./ProductFilters";
import { SlidersHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import Pagination from "../common/Pagination";

export default function ProductList({
  initialProducts,
  initialTotalPages,
  initialTotalProducts,
  filters,
}: {
  initialProducts: Product[];
  initialTotalPages: number;
  initialTotalProducts: number;
  filters: FilterData | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    useProductStore.setState({
      products: initialProducts,
      totalPages: initialTotalPages,
      isLoading: false,
    });
  }, [initialProducts, initialTotalPages]);

  const { products, totalPages, isLoading } = useProductStore(
    useShallow((state) => ({
      products: state.products,
      totalPages: state.totalPages,
      isLoading: state.isLoading,
    }))
  );

  const handleUrlChange = (name: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    if (name !== "page") {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    const [sortField, sortOrder] = value.split("-");
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", sortField);
    params.set("sortOrder", sortOrder);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const currentPage = parseInt(searchParams.get("page") as string) || 1;
  const currentSort = `${searchParams.get("sortBy") || "createdAt"}-${
    searchParams.get("sortOrder") || "desc"
  }`;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold">همه محصولات</h2>
            <p className="text-gray-500 text-sm">
              {initialTotalProducts} محصول یافت شد
            </p>
          </div>
          <div className="flex items-center justify-between md:justify-normal gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant={"outline"} className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4 ml-2" />
                  فیلترها
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90vw] max-h-[80vh] overflow-y-auto max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>فیلترها</DialogTitle>
                </DialogHeader>
                {filters && <ProductFilters filters={filters} />}
              </DialogContent>
            </Dialog>
            <Select value={currentSort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="مرتب‌سازی بر اساس" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">جدیدترین</SelectItem>
                <SelectItem value="price-asc">ارزان‌ترین</SelectItem>
                <SelectItem value="price-desc">گران‌ترین</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            {filters && <ProductFilters filters={filters} />}
          </aside>

          <main className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <p>محصولی یافت نشد.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) =>
                    handleUrlChange("page", page.toString())
                  }
                />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

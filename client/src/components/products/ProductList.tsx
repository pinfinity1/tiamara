// client/src/components/products/ProductList.tsx

"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
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
import ProductFilters, { FilterState } from "./ProductFilters";
import { SlidersHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import Pagination from "../common/Pagination";

export default function ProductList({
  initialProducts,
  initialTotalPages,
  initialTotalProducts,
  filters,
  hideFilters = false,
  activeCategoryName,
}: {
  initialProducts: Product[];
  initialTotalPages: number;
  initialTotalProducts: number;
  filters: FilterData | null;
  hideFilters?: boolean;
  activeCategoryName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Initialize filter state from URL search parameters
  const getInitialFilterState = useCallback((): FilterState => {
    const getArrayFromParams = (param: string) => {
      const value = searchParams.get(param);
      return value ? value.split(",") : [];
    };
    return {
      categories: getArrayFromParams("categories"),
      brands: getArrayFromParams("brands"),
      skin_types: getArrayFromParams("skin_types"),
      concerns: getArrayFromParams("concerns"),
      minPrice:
        Number(searchParams.get("minPrice")) || filters?.priceRange.min || 0,
      maxPrice:
        Number(searchParams.get("maxPrice")) ||
        filters?.priceRange.max ||
        1000000,
    };
  }, [searchParams, filters]);

  const [filterState, setFilterState] = useState<FilterState>(
    getInitialFilterState
  );
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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

  // Function to update URL based on filter state
  const updateUrl = (currentState: FilterState, page?: number) => {
    const params = new URLSearchParams(searchParams.toString());

    const setParam = (key: string, value: string[]) => {
      if (value.length > 0) params.set(key, value.join(","));
      else params.delete(key);
    };

    setParam("categories", currentState.categories);
    setParam("brands", currentState.brands);
    setParam("skin_types", currentState.skin_types);
    setParam("concerns", currentState.concerns);

    if (filters && currentState.minPrice > filters.priceRange.min) {
      params.set("minPrice", String(currentState.minPrice));
    } else {
      params.delete("minPrice");
    }

    if (filters && currentState.maxPrice < filters.priceRange.max) {
      params.set("maxPrice", String(currentState.maxPrice));
    } else {
      params.delete("maxPrice");
    }

    if (page) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleDesktopFilterChange = (newState: FilterState) => {
    setFilterState(newState);
    updateUrl(newState);
  };

  const handleMobileApplyFilters = () => {
    updateUrl(filterState);
    setIsMobileFilterOpen(false);
  };

  const handleMobileClearFilters = () => {
    if (filters) {
      const clearedState = {
        categories: [],
        brands: [],
        skin_types: [],
        concerns: [],
        minPrice: filters.priceRange.min,
        maxPrice: filters.priceRange.max,
      };
      setFilterState(clearedState);
      updateUrl(clearedState);
    }
    setIsMobileFilterOpen(false);
  };

  const handlePageChange = (page: number) => {
    updateUrl(filterState, page);
  };

  const handleSortChange = (value: string) => {
    const [sortField, sortOrder] = value.split("-");
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", sortField);
    params.set("sortOrder", sortOrder);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
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
            {!hideFilters && (
              <h2 className="text-2xl font-semibold">همه محصولات</h2>
            )}
            <p className="text-gray-500 text-sm">
              {initialTotalProducts} محصول یافت شد
            </p>
          </div>
          <div className="flex items-center justify-between md:justify-normal gap-4">
            <Dialog
              open={isMobileFilterOpen}
              onOpenChange={setIsMobileFilterOpen}
            >
              <DialogTrigger asChild>
                <Button variant={"outline"} className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4 ml-2" />
                  فیلترها
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90vw] max-h-[80vh] overflow-y-auto max-w-[400px] flex flex-col">
                <DialogHeader>
                  <DialogTitle>فیلترها</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto -mx-6 px-6">
                  {filters && (
                    <ProductFilters
                      isModalView={true} // به کامپوننت اطلاع می‌دهیم که در حالت مودال است
                      filters={filters}
                      initialState={filterState}
                      onFilterChange={setFilterState}
                      onClear={() => {
                        if (filters) {
                          setFilterState({
                            categories: [],
                            brands: [],
                            skin_types: [],
                            concerns: [],
                            minPrice: filters.priceRange.min,
                            maxPrice: filters.priceRange.max,
                          });
                        }
                      }}
                      activeCategoryName={activeCategoryName}
                    />
                  )}
                </div>
                <DialogFooter className="pt-4 border-t">
                  <Button variant="outline" onClick={handleMobileClearFilters}>
                    حذف فیلترها
                  </Button>
                  <Button onClick={handleMobileApplyFilters}>
                    اعمال فیلترها
                  </Button>
                </DialogFooter>
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
          {!hideFilters && (
            <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-3 self-start">
              {filters && (
                <ProductFilters
                  filters={filters}
                  initialState={filterState}
                  onFilterChange={handleDesktopFilterChange}
                  onClear={() => {
                    const params = new URLSearchParams();
                    router.replace(`${pathname}?${params.toString()}`, {
                      scroll: false,
                    });
                  }}
                  activeCategoryName={activeCategoryName}
                />
              )}
            </aside>
          )}

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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

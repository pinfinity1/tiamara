"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
import StorefrontPagination from "./StorefrontPagination";

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

  const loadingTimer = useRef<NodeJS.Timeout | null>(null);

  const roundPrice = (price: number, direction: "up" | "down" = "down") => {
    if (direction === "up") return Math.ceil(price / 10000) * 10000;
    return Math.floor(price / 10000) * 10000;
  };

  const getInitialFilterState = useCallback((): FilterState => {
    const getArrayFromParams = (param: string) => {
      const value = searchParams.get(param);
      return value ? value.split(",") : [];
    };
    const minPriceDefault = filters
      ? roundPrice(filters.priceRange.min, "down")
      : 0;
    const maxPriceDefault = filters
      ? roundPrice(filters.priceRange.max, "up")
      : 1000000;

    return {
      categories: getArrayFromParams("categories"),
      brands: getArrayFromParams("brands"),
      skin_types: getArrayFromParams("skin_types"),
      concerns: getArrayFromParams("concerns"),
      minPrice: Number(searchParams.get("minPrice")) || minPriceDefault,
      maxPrice: Number(searchParams.get("maxPrice")) || maxPriceDefault,
      profileBasedFilter: searchParams.get("profileBasedFilter") === "true",
      // ✅ دریافت مقدار hasDiscount از URL
      hasDiscount: searchParams.get("hasDiscount") === "true",
    };
  }, [searchParams, filters]);

  const [filterState, setFilterState] = useState<FilterState>(
    getInitialFilterState
  );
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (loadingTimer.current) {
      clearTimeout(loadingTimer.current);
    }

    useProductStore.setState({
      products: initialProducts,
      totalPages: initialTotalPages,
      totalProducts: initialTotalProducts,
      isLoading: false,
    });

    return () => {
      if (loadingTimer.current) {
        clearTimeout(loadingTimer.current);
      }
    };
  }, [initialProducts, initialTotalPages, initialTotalProducts]);

  const { products, totalPages, isLoading } = useProductStore(
    useShallow((state) => ({
      products: state.products,
      totalPages: state.totalPages,
      isLoading: state.isLoading,
    }))
  );

  const updateUrl = (currentState: FilterState, page?: number) => {
    if (loadingTimer.current) {
      clearTimeout(loadingTimer.current);
    }

    loadingTimer.current = setTimeout(() => {
      useProductStore.setState({ isLoading: true });
    }, 1000);

    const params = new URLSearchParams(searchParams.toString());
    const setParam = (key: string, value: string[]) => {
      if (value.length > 0) params.set(key, value.join(","));
      else params.delete(key);
    };

    setParam("categories", currentState.categories);
    setParam("brands", currentState.brands);
    setParam("skin_types", currentState.skin_types);
    setParam("concerns", currentState.concerns);

    if (
      filters &&
      currentState.minPrice > roundPrice(filters.priceRange.min, "down")
    ) {
      params.set("minPrice", String(currentState.minPrice));
    } else {
      params.delete("minPrice");
    }

    if (
      filters &&
      currentState.maxPrice < roundPrice(filters.priceRange.max, "up")
    ) {
      params.set("maxPrice", String(currentState.maxPrice));
    } else {
      params.delete("maxPrice");
    }

    if (currentState.profileBasedFilter) {
      params.set("profileBasedFilter", "true");
    } else {
      params.delete("profileBasedFilter");
    }

    // ✅ مدیریت پارامتر hasDiscount در URL
    if (currentState.hasDiscount) {
      params.set("hasDiscount", "true");
    } else {
      params.delete("hasDiscount");
    }

    if (page) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // ✅ هنگام پاک کردن فیلترها، hasDiscount را نگه می‌داریم (مانند profileBasedFilter)
  // تا کاربر از کانتکست "تخفیف‌دارها" خارج نشود مگر اینکه صفحه را عوض کند
  const handleClearFilters = () => {
    if (!filters) return;
    const clearedState: FilterState = {
      categories: [],
      brands: [],
      skin_types: [],
      concerns: [],
      minPrice: roundPrice(filters.priceRange.min, "down"),
      maxPrice: roundPrice(filters.priceRange.max, "up"),
      profileBasedFilter: filterState.profileBasedFilter,
      hasDiscount: filterState.hasDiscount, // حفظ مقدار فعلی
    };
    setFilterState(clearedState);
    updateUrl(clearedState);
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
    if (!filters) return;
    setFilterState((prevState) => ({
      categories: [],
      brands: [],
      skin_types: [],
      concerns: [],
      minPrice: roundPrice(filters.priceRange.min, "down"),
      maxPrice: roundPrice(filters.priceRange.max, "up"),
      profileBasedFilter: prevState.profileBasedFilter,
      hasDiscount: prevState.hasDiscount, // حفظ مقدار فعلی
    }));
  };

  const handlePageChange = (page: number) => {
    updateUrl(filterState, page);
  };

  const handleSortChange = (value: string) => {
    if (loadingTimer.current) {
      clearTimeout(loadingTimer.current);
    }
    loadingTimer.current = setTimeout(() => {
      useProductStore.setState({ isLoading: true });
    }, 1000);

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
              {initialTotalProducts.toLocaleString("fa-IR")} محصول یافت شد
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
            <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-0 self-start">
              {filters && (
                <ProductFilters
                  filters={filters}
                  initialState={filterState}
                  onFilterChange={handleDesktopFilterChange}
                  onClear={handleClearFilters}
                  activeCategoryName={activeCategoryName}
                />
              )}
            </aside>
          )}

          <main className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-10">
                <p>محصولی با این فیلترها یافت نشد.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
            <StorefrontPagination totalPages={totalPages} />
          </main>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import { useProductStore, Product } from "../../store/useProductStore";
import { brands, categories } from "../../utils/config";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import ProductCard from "./ProductCard";

export default function ProductList({
  initialProducts,
  initialTotalPages,
  initialTotalProducts,
}: {
  initialProducts: Product[];
  initialTotalPages: number;
  initialTotalProducts: number;
}) {
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("createdAt-desc");

  const {
    products,
    currentPage,
    totalPages,
    setCurrentPage,
    fetchProductsForClient,
    isLoading,
  } = useProductStore();

  useEffect(() => {
    useProductStore.setState({
      products: initialProducts,
      totalPages: initialTotalPages,
      totalProducts: initialTotalProducts,
    });
  }, [initialProducts, initialTotalPages, initialTotalProducts]);

  const handleFetchProducts = (page = 1) => {
    const [sortField, sortOrder] = sortBy.split("-");
    setCurrentPage(page);
    fetchProductsForClient({
      page,
      limit: 12,
      categories: selectedCategories,
      brands: selectedBrands,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      sortBy: sortField,
      sortOrder: sortOrder as "asc" | "desc",
    });
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    const [sortField, sortOrder] = value.split("-");
    fetchProductsForClient({
      page: 1,
      limit: 12,
      categories: selectedCategories,
      brands: selectedBrands,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      sortBy: sortField,
      sortOrder: sortOrder as "asc" | "desc",
    });
  };

  const handleFilterChange = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const FilterSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-semibold">دسته‌بندی‌ها</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center">
              <Checkbox
                checked={selectedCategories.includes(category)}
                onCheckedChange={() =>
                  handleFilterChange(setSelectedCategories, category)
                }
                id={`filter-${category}`}
              />
              <Label
                htmlFor={`filter-${category}`}
                className="mr-2 text-sm cursor-pointer"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 font-semibold">برندها</h3>
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center">
              <Checkbox
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() =>
                  handleFilterChange(setSelectedBrands, brand)
                }
                id={`filter-${brand}`}
              />
              <Label
                htmlFor={`filter-${brand}`}
                className="mr-2 text-sm cursor-pointer"
              >
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 font-semibold">محدوده قیمت</h3>
        <Slider
          defaultValue={[0, 100000]}
          max={100000}
          step={1000}
          className="w-full"
          value={priceRange}
          onValueChange={(value) => setPriceRange(value)}
        />
        <div className="flex justify-between mt-2 text-sm">
          <span>{priceRange[0].toLocaleString("fa-IR")} تومان</span>
          <span>{priceRange[1].toLocaleString("fa-IR")} تومان</span>
        </div>
      </div>
      <Button onClick={() => handleFetchProducts(1)} className="w-full">
        اعمال فیلترها
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold">همه محصولات</h2>
          <div className="flex items-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant={"outline"} className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4 ml-2" />
                  فیلترها
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90vw] max-h-[600px] overflow-auto max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>فیلترها</DialogTitle>
                </DialogHeader>
                <FilterSection />
              </DialogContent>
            </Dialog>
            <Select value={sortBy} onValueChange={handleSortChange}>
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
            <FilterSection />
          </aside>

          <main className="flex-1">
            {isLoading && <p>در حال بارگذاری...</p>}
            {!isLoading && products.length === 0 && <p>محصولی یافت نشد.</p>}
            {!isLoading && products.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <div className="mt-10 flex justify-center items-center gap-2">
                  <Button
                    disabled={currentPage === 1}
                    variant={"outline"}
                    size={"icon"}
                    onClick={() => handleFetchProducts(currentPage - 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        className="w-10"
                        onClick={() => handleFetchProducts(page)}
                      >
                        {page}
                      </Button>
                    )
                  )}
                  <Button
                    disabled={currentPage === totalPages}
                    variant={"outline"}
                    size={"icon"}
                    onClick={() => handleFetchProducts(currentPage + 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

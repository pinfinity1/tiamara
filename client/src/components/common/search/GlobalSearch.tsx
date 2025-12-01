"use client";

import { Input } from "@/components/ui/input";
import {
  Search,
  History,
  TrendingUp,
  ShoppingBag,
  Tag,
  LayoutGrid,
  Trash,
  ChevronLeft,
  X,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation"; // برای نویگیشن با اینتر
import { axiosPublic } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { useSearch, SearchResultProduct } from "@/hooks/useSearch";
import { useSearchHistoryStore } from "@/store/useSearchHistoryStore";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import ImagePlaceholder from "@/components/common/ImagePlaceholder";

// --- ۱. کامپوننت هایلایت متن (جدید) ---
const HighlightedText = ({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) => {
  if (!highlight.trim()) return <span>{text}</span>;

  // متن را بر اساس کلمه جستجو شده تکه تکه می‌کنیم
  const parts = text.split(new RegExp(`(${highlight})`, "gi"));

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span
            key={i}
            className="text-primary font-extrabold bg-primary/10 px-0.5 rounded"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

// --- کامپوننت لودینگ ---
const SearchLoading = () => (
  <div className="p-4 space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-2.5 w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

// --- تایپ‌های دقیق (جدید) ---
interface SearchSuggestionsProps {
  onSuggestionClick: (term: string) => void;
  onLinkClick: () => void;
  onClearHistory: () => void;
  recentSearches: string[];
  popularProducts: SearchResultProduct[];
  selectedIndex: number; // برای کیبورد
  query: string; // برای هایلایت
}

// --- کامپوننت پیشنهادات ---
const SearchSuggestions = ({
  onSuggestionClick,
  onLinkClick,
  onClearHistory,
  recentSearches,
  popularProducts,
  selectedIndex,
  query,
}: SearchSuggestionsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
    <div
      className={cn(
        "space-y-6",
        recentSearches.length > 0 ? "md:col-span-3" : "md:col-span-2 h-full"
      )}
    >
      {/* جستجوهای اخیر */}
      {recentSearches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="flex items-center text-xs font-bold text-gray-800">
              <History className="w-3.5 h-3.5 ml-1.5 text-primary" />
              جستجوهای اخیر
            </h4>
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50 h-6 px-2"
              onClick={onClearHistory}
            >
              <Trash className="w-3 h-3 ml-1" />
              پاک کردن
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {recentSearches.map((term: string) => (
              <button
                key={term}
                onClick={() => onSuggestionClick(term)}
                className="px-3 py-1 text-[11px] bg-gray-100 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 text-gray-700 rounded-full transition-all"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* محصولات پرطرفدار */}
      <div
        className={cn("flex flex-col", recentSearches.length === 0 && "flex-1")}
      >
        <h4 className="flex items-center text-sm font-bold text-gray-800 mb-4">
          <TrendingUp className="w-4 h-4 ml-2 text-primary" />
          محصولات پرطرفدار
        </h4>

        <div className={cn("flex flex-col gap-2", "mt-auto")}>
          {popularProducts.map((product, index) => {
            const imageUrl = product.images?.[0]?.url;
            // بررسی انتخاب شده بودن با کیبورد
            const isSelected = index === selectedIndex;

            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                onClick={onLinkClick}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-xl transition-all group border border-transparent",
                  // استایل حالت انتخاب (موس یا کیبورد)
                  isSelected
                    ? "bg-primary/5 border-primary/20 ring-1 ring-primary/20 shadow-sm"
                    : "hover:bg-gray-50 hover:border-gray-100"
                )}
                target="_blank"
              >
                <div className="relative w-12 h-12 flex-shrink-0 bg-white rounded-lg border border-gray-100 overflow-hidden">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-contain p-0.5"
                    />
                  ) : (
                    <ImagePlaceholder iconClassName="p-3 opacity-20" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 group-hover:text-primary transition-colors leading-snug line-clamp-1">
                    {/* اینجا از هایلایت استفاده نمی‌کنیم چون پرطرفدار است، نه نتیجه جستجو */}
                    {product.name}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
                    {(product.brand as any)?.englishName || product.brand?.name}
                  </p>
                </div>

                <ChevronLeft
                  className={cn(
                    "w-3.5 h-3.5 transition-colors",
                    isSelected
                      ? "text-primary opacity-100"
                      : "text-gray-300 opacity-0 group-hover:opacity-100"
                  )}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>

    {/* بنر تبلیغاتی */}
    {recentSearches.length === 0 && (
      <div className="md:col-span-1 hidden md:block h-full pl-1">
        <Link
          href="/products"
          onClick={onLinkClick}
          className="block relative w-full h-full min-h-[160px] rounded-2xl overflow-hidden group shadow-sm hover:shadow-md transition-shadow"
        >
          <Image
            src="/images/search-banner.webp"
            alt="Search Banner"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-5">
            <p className="text-white font-bold text-sm mb-1">تنوعی از زیبایی</p>
            <p className="text-gray-200 text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
              محصولات
              <ChevronLeft className="w-3 h-3" />
            </p>
          </div>
        </Link>
      </div>
    )}
  </div>
);

// --- کامپوننت اصلی ---
export default function GlobalSearch({
  onFocusChange,
  isFocusedMode = false,
}: {
  onFocusChange?: (isFocused: boolean) => void;
  isFocusedMode?: boolean;
}) {
  const router = useRouter(); // برای نویگیشن با کیبورد
  const { query, setQuery, results, isLoading, recentSearches, isDebouncing } =
    useSearch();
  const { addRecentSearch, clearRecentSearches } = useSearchHistoryStore();
  const [popularProducts, setPopularProducts] = useState<SearchResultProduct[]>(
    []
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // استیت برای ایندکس آیتم انتخاب شده با کیبورد (-1 یعنی هیچکدام)
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    if (isFocusedMode && inputRef.current) {
      inputRef.current.focus();
    }
    // هر بار مودال باز می‌شود یا کوئری عوض می‌شود، سلکشن ریست شود
    setSelectedIndex(-1);
  }, [isFocusedMode, query]);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const response = await axiosPublic.get(
          "/products/fetch-client-products",
          { params: { sortBy: "soldCount", limit: 3 } }
        );
        if (response.data.success) {
          setPopularProducts(response.data.products);
        }
      } catch (error) {
        console.error("Failed to fetch popular products:", error);
      }
    };
    fetchPopular();
  }, []);

  // محاسبه لیست آیتم‌های قابل انتخاب در لحظه (برای نویگیشن)
  const navigableItems = useMemo(() => {
    if (query.trim() && results.products.length > 0) {
      return results.products;
    } else if (!query.trim() && popularProducts.length > 0) {
      return popularProducts;
    }
    return [];
  }, [query, results.products, popularProducts]);

  // هندل کردن دکمه‌های کیبورد
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (navigableItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault(); // جلوگیری از اسکرول صفحه
      setSelectedIndex(
        (prev) => (prev < navigableItems.length - 1 ? prev + 1 : 0) // لوپ به اول
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev > 0 ? prev - 1 : navigableItems.length - 1) // لوپ به آخر
      );
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const selectedItem = navigableItems[selectedIndex];
      // نویگیشن و بستن سرچ
      handleItemClick(selectedItem.name);
      window.open(`/products/${selectedItem.slug}`, "_blank"); // باز کردن در تب جدید طبق UI شما
    }
  };

  const handleItemClick = (searchTerm: string) => {
    addRecentSearch(searchTerm);
    setQuery("");
    onFocusChange?.(false);
  };

  const clearInput = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const hasResults =
    results.products.length > 0 ||
    results.brands.length > 0 ||
    results.categories.length > 0;

  const shouldShowLoading = !hasResults && (isLoading || isDebouncing);
  const shouldShowResults = hasResults;

  return (
    <div className="relative w-full" onKeyDown={handleKeyDown}>
      {" "}
      {/* اضافه کردن لیسنر کیبورد */}
      <div className="relative z-50">
        <Search
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors pointer-events-none",
            isFocusedMode ? "text-primary" : "text-gray-400"
          )}
        />

        <Input
          ref={inputRef}
          type="text"
          placeholder="جستجوی نام محصول، برند یا دسته..."
          className={cn(
            "w-full pr-11 pl-10 py-2 h-12 border transition-all duration-300 rounded-2xl bg-gray-50/50 focus:bg-white",
            isFocusedMode
              ? "ring-2 ring-primary/20 border-primary shadow-lg"
              : "hover:border-gray-300 shadow-sm"
          )}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => onFocusChange?.(true)}
        />

        {query && (
          <button
            onClick={clearInput}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {isFocusedMode && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in duration-300"
            onClick={() => onFocusChange?.(false)}
          />

          <div className="absolute top-full mt-2 w-full rounded-2xl border bg-white shadow-2xl z-50 max-h-[75vh] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="overflow-y-auto custom-scrollbar">
              {query.trim() ? (
                <>
                  {shouldShowLoading ? (
                    <SearchLoading />
                  ) : shouldShowResults ? (
                    <div
                      className={cn(
                        "divide-y divide-gray-100",
                        (isLoading || isDebouncing) &&
                          "opacity-50 transition-opacity duration-300"
                      )}
                    >
                      {/* دسته‌بندی‌ها */}
                      {results.categories.length > 0 && (
                        <div className="p-4 bg-gray-50/30">
                          <h4 className="flex items-center text-xs font-bold text-gray-500 mb-3 px-1">
                            <LayoutGrid className="w-3.5 h-3.5 ml-1.5 text-primary" />
                            دسته‌بندی‌های مرتبط
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {results.categories.map((category) => (
                              <Link
                                key={`cat-${category.id}`}
                                href={`/categories/${category.slug}`}
                                className="px-3 py-1.5 text-xs bg-white border border-gray-200 hover:border-primary hover:text-primary rounded-lg transition-all shadow-sm hover:shadow"
                                onClick={() => handleItemClick(category.name)}
                              >
                                {/* استفاده از کامپوننت هایلایت */}
                                <HighlightedText
                                  text={
                                    (category as any).englishName ||
                                    category.name
                                  }
                                  highlight={query}
                                />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* برندها */}
                      {results.brands.length > 0 && (
                        <div className="p-4 bg-gray-50/30">
                          <h4 className="flex items-center text-xs font-bold text-gray-500 mb-3 px-1">
                            <Tag className="w-3.5 h-3.5 ml-1.5 text-primary" />
                            برندهای مرتبط
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {results.brands.map((brand) => (
                              <Link
                                key={`brand-${brand.id}`}
                                href={`/brands/${brand.slug}`}
                                className="px-3 py-1.5 text-xs bg-white border border-gray-200 hover:border-primary hover:text-primary rounded-lg transition-all shadow-sm hover:shadow"
                                onClick={() => handleItemClick(brand.name)}
                              >
                                <HighlightedText
                                  text={
                                    (brand as any).englishName || brand.name
                                  }
                                  highlight={query}
                                />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* محصولات */}
                      {results.products.length > 0 && (
                        <div className="p-4">
                          <h4 className="flex items-center text-xs font-bold text-gray-500 mb-3 px-1">
                            <ShoppingBag className="w-3.5 h-3.5 ml-1.5 text-primary" />
                            محصولات یافت شده ({results.products.length})
                          </h4>
                          <ul className="space-y-2">
                            {results.products.map((product, index) => {
                              const imageUrl = product.images?.[0]?.url;
                              // بررسی انتخاب شدن با کیبورد
                              const isSelected = index === selectedIndex;

                              return (
                                <li key={`prod-${product.id}`}>
                                  <Link
                                    href={`/products/${product.slug}`}
                                    className={cn(
                                      "flex items-start gap-4 p-2 rounded-2xl transition-all group border border-transparent",
                                      // استایل انتخاب
                                      isSelected
                                        ? "bg-primary/5 border-primary/20 ring-1 ring-primary/20 shadow-sm"
                                        : "hover:bg-gray-50 hover:border-gray-100"
                                    )}
                                    onClick={() =>
                                      handleItemClick(product.name)
                                    }
                                    target="_blank"
                                  >
                                    <div className="relative w-16 h-16 flex-shrink-0 bg-white rounded-xl border border-gray-100 overflow-hidden">
                                      {imageUrl ? (
                                        <Image
                                          src={imageUrl}
                                          alt={product.name}
                                          fill
                                          className="object-contain p-1"
                                        />
                                      ) : (
                                        <ImagePlaceholder iconClassName="p-3" />
                                      )}
                                    </div>

                                    <div className="flex-1 min-w-0 py-1">
                                      <p className="font-semibold text-sm text-gray-800 group-hover:text-primary transition-colors leading-tight mb-1 line-clamp-2">
                                        {/* استفاده از کامپوننت هایلایت برای نام محصول */}
                                        <HighlightedText
                                          text={product.name}
                                          highlight={query}
                                        />
                                      </p>
                                      <p className="text-xs text-gray-500 flex items-center gap-1">
                                        {(product.brand as any)?.englishName ||
                                          product.brand?.name}
                                      </p>
                                    </div>

                                    <ChevronLeft
                                      className={cn(
                                        "w-5 h-5 transition-colors",
                                        isSelected
                                          ? "text-primary opacity-100"
                                          : "text-gray-300 opacity-0 group-hover:opacity-100"
                                      )}
                                    />
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Search className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">
                          نتیجه‌ای پیدا نشد
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          برای عبارت "{query}" موردی یافت نشد.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <SearchSuggestions
                  recentSearches={recentSearches}
                  popularProducts={popularProducts}
                  selectedIndex={selectedIndex} // پاس دادن ایندکس
                  query={query} // پاس دادن کوئری
                  onSuggestionClick={(val: string) => {
                    setQuery(val);
                    inputRef.current?.focus();
                  }}
                  onLinkClick={() => onFocusChange?.(false)}
                  onClearHistory={clearRecentSearches}
                />
              )}
            </div>

            {hasResults && (
              <Link
                href={`/products?search=${query}`}
                onClick={() => onFocusChange?.(false)}
                className="block bg-gray-50 border-t p-3 text-center text-xs font-medium text-primary hover:bg-gray-100 transition-colors"
              >
                مشاهده همه نتایج برای "{query}"
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}

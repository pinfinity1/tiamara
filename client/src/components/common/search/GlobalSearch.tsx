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
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { axiosPublic } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { useSearch, SearchResultProduct } from "@/hooks/useSearch";
import { useSearchHistoryStore } from "@/store/useSearchHistoryStore";
import { cn } from "@/lib/utils";

const SearchSuggestions = ({
  onSuggestionClick,
  onLinkClick,
  onClearHistory,
  recentSearches,
  popularProducts,
}: any) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
    <div
      className={cn(
        "space-y-6",
        recentSearches.length > 0 ? "md:col-span-3" : "md:col-span-2"
      )}
    >
      {recentSearches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="flex items-center text-sm font-semibold text-gray-800">
              <History className="w-4 h-4 ml-2 text-gray-500" />
              آخرین جستجوها
            </h4>
            <Button
              variant="link"
              className="text-xs h-auto p-0"
              onClick={onClearHistory}
            >
              <Trash />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term: string) => (
              <button
                key={term}
                onClick={() => onSuggestionClick(term)}
                className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
      <div>
        <h4 className="flex items-center text-sm font-semibold text-gray-800 mb-3">
          <TrendingUp className="w-4 h-4 ml-2 text-gray-500" />
          پرفروش‌ترین‌ها
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {popularProducts.map((product: SearchResultProduct) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              onClick={onLinkClick}
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg"
              target="_blank"
            >
              <Image
                src={product.images[0]?.url || "/placeholder.png"}
                alt={product.name}
                width={40}
                height={40}
                className="w-10 h-10 object-cover rounded-md"
              />
              <p className="text-xs font-medium text-gray-700">
                {product.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
    {recentSearches.length === 0 && (
      <div className="md:col-span-1 hidden md:block">
        <Link
          href="/products"
          onClick={onLinkClick}
          className="block relative w-full h-full rounded-lg overflow-hidden group"
        >
          <Image
            src="/images/search-banner.jpg"
            alt="Promotional Banner"
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/30 flex items-end p-3">
            <p className="text-white font-bold text-sm">مشاهده همه محصولات</p>
          </div>
        </Link>
      </div>
    )}
  </div>
);

interface GlobalSearchProps {
  onFocusChange?: (isFocused: boolean) => void;
  isFocusedMode?: boolean;
}

export default function GlobalSearch({
  onFocusChange,
  isFocusedMode = false,
}: GlobalSearchProps) {
  const { query, setQuery, results, isLoading, recentSearches } = useSearch();
  const { addRecentSearch, clearRecentSearches } = useSearchHistoryStore(); // Get actions directly from the store
  const [popularProducts, setPopularProducts] = useState<SearchResultProduct[]>(
    []
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isFocusedMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocusedMode]);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const response = await axiosPublic.get(
          "/products/fetch-client-products",
          { params: { sortBy: "soldCount", limit: 4 } }
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

  const handleItemClick = (searchTerm: string) => {
    addRecentSearch(searchTerm); // Use action from the store
    setQuery("");
    onFocusChange?.(false);
  };

  const hasResults =
    results.products.length > 0 ||
    results.brands.length > 0 ||
    results.categories.length > 0;

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="جستجوی محصولات..."
          className="w-full pl-10 pr-4 py-2 h-12 border transition-colors rounded-xl bg-white"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => onFocusChange?.(true)}
        />
      </div>

      {isFocusedMode && (
        <div className="absolute top-full mt-2 w-full rounded-lg border bg-white shadow-lg z-50 max-h-[70vh] overflow-y-auto">
          {query.trim() ? (
            <>
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  در حال جستجو...
                </div>
              ) : hasResults ? (
                <div className="divide-y divide-gray-100">
                  {results.categories.length > 0 && (
                    <div className="p-3">
                      <h4 className="flex items-center text-xs font-semibold text-gray-500 mb-2 px-1">
                        <LayoutGrid className="w-4 h-4 ml-2" />
                        دسته‌بندی‌ها
                      </h4>
                      <ul>
                        {results.categories.map((category) => (
                          <li key={`cat-${category.id}`}>
                            <Link
                              prefetch={false}
                              href={`/categories/${category.slug}`}
                              className="block p-2 text-sm hover:bg-gray-50 transition-colors rounded-md"
                              onClick={() => handleItemClick(category.name)}
                            >
                              {category.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {results.brands.length > 0 && (
                    <div className="p-3">
                      <h4 className="flex items-center text-xs font-semibold text-gray-500 mb-2 px-1">
                        <Tag className="w-4 h-4 ml-2" />
                        برندها
                      </h4>
                      <ul>
                        {results.brands.map((brand) => (
                          <li key={`brand-${brand.id}`}>
                            <Link
                              prefetch={false}
                              href={`/brands/${brand.slug}`}
                              className="block p-2 text-sm hover:bg-gray-50 transition-colors rounded-md"
                              onClick={() => handleItemClick(brand.name)}
                            >
                              {brand.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {results.products.length > 0 && (
                    <div className="p-3">
                      <h4 className="flex items-center text-xs font-semibold text-gray-500 mb-2 px-1">
                        <ShoppingBag className="w-4 h-4 ml-2" />
                        محصولات
                      </h4>
                      <ul>
                        {results.products.map((product) => (
                          <li key={`prod-${product.id}`}>
                            <Link
                              href={`/products/${product.slug}`}
                              className="flex items-center gap-4 p-2 hover:bg-gray-50 transition-colors rounded-md"
                              onClick={() => handleItemClick(product.name)}
                              target="_blank"
                            >
                              <Image
                                src={
                                  product.images[0]?.url || "/placeholder.png"
                                }
                                alt={product.name}
                                width={48}
                                height={48}
                                className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                              />
                              <div>
                                <p className="font-semibold text-sm">
                                  {product.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {product.brand?.name}
                                </p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  هیچ نتیجه‌ای برای "{query}" یافت نشد.
                </div>
              )}
            </>
          ) : (
            <SearchSuggestions
              recentSearches={recentSearches}
              popularProducts={popularProducts}
              onSuggestionClick={setQuery}
              onLinkClick={() => onFocusChange?.(false)}
              onClearHistory={clearRecentSearches}
            />
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { Input } from "@/components/ui/input";
import { Search, X, History, TrendingUp, Trash } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { axiosPublic } from "@/lib/axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// --- Helper Functions for Recent Searches ---
const getRecentSearches = (): string[] => {
  if (typeof window === "undefined") return [];
  const searches = localStorage.getItem("recentSearches");
  return searches ? JSON.parse(searches) : [];
};

const addRecentSearch = (query: string) => {
  if (typeof window === "undefined") return;
  const cleanedQuery = query.trim();
  if (!cleanedQuery) return;

  let searches = getRecentSearches();
  searches = searches.filter(
    (s) => s.toLowerCase() !== cleanedQuery.toLowerCase()
  );
  searches.unshift(cleanedQuery);
  localStorage.setItem("recentSearches", JSON.stringify(searches.slice(0, 5)));
};

const clearRecentSearches = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("recentSearches");
};

interface SearchResultProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: { url: string; altText?: string | null }[];
  brand: { name: string } | null;
}

// Sub-component for the rich suggestions dropdown
const SearchSuggestions = ({
  recentSearches,
  popularProducts,
  onSuggestionClick,
  onLinkClick,
  onClearHistory,
}: {
  recentSearches: string[];
  popularProducts: SearchResultProduct[];
  onSuggestionClick: (term: string) => void;
  onLinkClick: () => void;
  onClearHistory: () => void;
}) => (
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
              آخرین جستجوهای شما
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
            {recentSearches.map((term) => (
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
          {popularProducts.map((product) => (
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
  isModal?: boolean;
}

export default function GlobalSearch({
  onFocusChange,
  isFocusedMode = false,
}: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularProducts, setPopularProducts] = useState<SearchResultProduct[]>(
    []
  );

  useEffect(() => {
    if (isFocusedMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocusedMode]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());

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

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await axiosPublic.get(`/search?q=${query}`);
        if (response.data.success) {
          addRecentSearch(query);
          setRecentSearches(getRecentSearches());
          setResults(response.data.products);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleLinkClick = () => {
    setQuery("");
    if (onFocusChange) onFocusChange(false);
  };

  const handleSuggestionClick = (term: string) => {
    setQuery(term);
  };

  const handleClearHistory = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  return (
    <div className={cn("relative w-full")} ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="جستجوی محصولات..."
          className={cn(
            "w-full pl-10 pr-4 py-2 h-12 border transition-colors rounded-xl bg-white"
          )}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (onFocusChange) onFocusChange(true);
          }}
        />
      </div>

      {isFocusedMode && (
        <div className="absolute top-full mt-2 w-full rounded-lg border bg-white shadow-lg z-50 max-h-[450px] overflow-y-auto">
          {query.trim() ? (
            <>
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  در حال جستجو...
                </div>
              ) : results.length > 0 ? (
                <ul>
                  {results.map((product) => (
                    <li key={product.id}>
                      <Link
                        href={`/products/${product.slug}`}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors"
                        onClick={handleLinkClick}
                        target="_blank"
                      >
                        <div className="relative h-16 w-16 flex-shrink-0">
                          <Image
                            src={product.images[0]?.url || "/placeholder.png"}
                            alt={product.images[0]?.altText || product.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.brand?.name}
                          </p>
                          <p className="text-sm font-bold mt-1">
                            {product.price.toLocaleString("fa-IR")} تومان
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
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
              onSuggestionClick={handleSuggestionClick}
              onLinkClick={handleLinkClick}
              onClearHistory={handleClearHistory}
            />
          )}
        </div>
      )}
    </div>
  );
}

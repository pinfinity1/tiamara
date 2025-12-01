"use client";

import { useState, useEffect } from "react";
import { axiosPublic } from "@/lib/axios";
import { useSearchHistoryStore } from "@/store/useSearchHistoryStore";
import type { Brand } from "@/store/useBrandStore";
import type { Category } from "@/store/useCategoryStore";

export interface SearchResultProduct {
  id: string;
  name: string;
  slug: string;
  images: { url: string }[];
  brand: { name: string } | null;
}

export interface SearchResults {
  products: SearchResultProduct[];
  brands: Brand[];
  categories: Category[];
}

export const useSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({
    products: [],
    brands: [],
    categories: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  // ✅ استیت جدید: آیا کاربر در حال تایپ است؟ (مکث Debounce)
  const [isDebouncing, setIsDebouncing] = useState(false);

  const { recentSearches, fetchRecentSearches } = useSearchHistoryStore();

  useEffect(() => {
    fetchRecentSearches();
  }, [fetchRecentSearches]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ products: [], brands: [], categories: [] });
      setIsLoading(false);
      setIsDebouncing(false);
      return;
    }

    // ✅ به محض تغییر متن، وضعیت دیبانس را فعال می‌کنیم
    setIsDebouncing(true);

    const debounceTimer = setTimeout(async () => {
      // ✅ وقتی تایپ تمام شد:
      setIsDebouncing(false); // دیبانس تمام شد
      setIsLoading(true); // لودینگ سرور شروع شد

      try {
        const response = await axiosPublic.get(`/search?q=${query}`);
        if (response.data.success) {
          setResults(response.data.results);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    isDebouncing, // ✅ این را اکسپورت می‌کنیم
    recentSearches,
  };
};

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

  // Get state and actions from the Zustand store
  const { recentSearches, fetchRecentSearches } = useSearchHistoryStore();

  // Load recent searches from store on initial mount
  useEffect(() => {
    fetchRecentSearches();
  }, [fetchRecentSearches]);

  // Effect to perform search when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults({ products: [], brands: [], categories: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const debounceTimer = setTimeout(async () => {
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
    }, 400);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    recentSearches, // This is now always in sync
  };
};

"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, History, Trash } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { axiosPublic } from "@/lib/axios";
import { Button } from "@/components/ui/button";

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

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

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

  const handleClearHistory = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="p-0 gap-0 w-full h-full flex flex-col [&>button]:hidden"
      >
        <SheetHeader className="p-4 border-b flex flex-row items-center justify-between gap-2">
          <SheetClose asChild>
            <button className="w-fit">
              <ArrowRight className="text-gray-500" />
            </button>
          </SheetClose>
          <SheetTitle className="!mt-0 w-full">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <Input
                ref={inputRef}
                type="search"
                placeholder="جستجوی محصولات..."
                className="w-full pl-10 pr-4 py-2 h-12"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
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
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors rounded-lg"
                        onClick={onClose}
                        target="_blank"
                      >
                        <div className="relative h-16 w-16 flex-shrink-0">
                          <Image
                            src={product.images[0]?.url || "/placeholder.png"}
                            alt={product.name}
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
            // Recent Searches
            recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="flex items-center text-sm font-semibold text-gray-800">
                    <History className="w-4 h-4 ml-2 text-gray-500" />
                    آخرین جستجوهای شما
                  </h4>
                  <Button
                    variant="link"
                    className="text-xs h-auto p-0 "
                    onClick={handleClearHistory}
                  >
                    <Trash />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

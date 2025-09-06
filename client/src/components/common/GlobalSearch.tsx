"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { axiosPublic } from "@/lib/axios";

interface SearchResultProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: { url: string; altText?: string | null }[];
  brand: { name: string } | null;
}

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsDropdownVisible(false);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await axiosPublic.get(`/search?q=${query}`);
        if (response.data.success) {
          setResults(response.data.products);
          setIsDropdownVisible(true);
        }
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsDropdownVisible(false);
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="search"
          placeholder="جستجوی محصولات..."
          className="w-full pl-10 pr-4 py-2 rounded-full border bg-gray-50 focus:bg-white"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) {
              setIsDropdownVisible(true);
            }
          }}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-5 w-5 text-gray-500 hover:text-gray-800" />
          </button>
        )}
      </div>

      {isDropdownVisible && (
        <div className="absolute top-full mt-2 w-full rounded-lg border bg-white shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">در حال جستجو...</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/listing/${product.slug}`}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsDropdownVisible(false)}
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
                      <p className="font-semibold text-sm">{product.name}</p>
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
        </div>
      )}
    </div>
  );
}

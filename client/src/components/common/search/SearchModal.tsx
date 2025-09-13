"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  Search,
  ArrowRight,
  History,
  Trash,
  ShoppingBag,
  Tag,
  LayoutGrid,
} from "lucide-react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSearch } from "@/hooks/useSearch";
import { useSearchHistoryStore } from "@/store/useSearchHistoryStore"; // Import the store

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { query, setQuery, results, isLoading, recentSearches } = useSearch();
  const { addRecentSearch, clearRecentSearches } = useSearchHistoryStore(); // Get actions directly from the store
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [isOpen, setQuery]);

  const handleItemClick = (searchTerm: string) => {
    addRecentSearch(searchTerm); // Use action from the store
    onClose();
  };

  const hasResults =
    results.products.length > 0 ||
    results.brands.length > 0 ||
    results.categories.length > 0;

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
              ) : hasResults ? (
                <div className="space-y-6">
                  {results.categories.length > 0 && (
                    <div>
                      <h4 className="flex items-center text-xs font-semibold text-gray-500 mb-2 px-1">
                        <LayoutGrid className="w-4 h-4 ml-2" />
                        دسته‌بندی‌ها
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {results.categories.map((category) => (
                          <Link
                            key={`cat-${category.id}`}
                            href={`/products?categories=${category.name}`}
                            className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                            onClick={() => handleItemClick(category.name)}
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {results.brands.length > 0 && (
                    <div>
                      <h4 className="flex items-center text-xs font-semibold text-gray-500 mb-2 px-1">
                        <Tag className="w-4 h-4 ml-2" />
                        برندها
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {results.brands.map((brand) => (
                          <Link
                            key={`brand-${brand.id}`}
                            href={`/products?brands=${brand.name}`}
                            className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                            onClick={() => handleItemClick(brand.name)}
                          >
                            {brand.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {results.products.length > 0 && (
                    <div>
                      <h4 className="flex items-center text-xs font-semibold text-gray-500 mb-2 px-1">
                        <ShoppingBag className="w-4 h-4 ml-2" />
                        محصولات
                      </h4>
                      <ul>
                        {results.products.map((product) => (
                          <li key={`prod-${product.id}`}>
                            <Link
                              href={`/products/${product.slug}`}
                              className="flex items-center gap-4 p-2 hover:bg-gray-50 transition-colors rounded-lg"
                              onClick={() => handleItemClick(product.name)}
                              target="_blank"
                            >
                              <Image
                                src={
                                  product.images[0]?.url || "/placeholder.png"
                                }
                                alt={product.name}
                                width={56}
                                height={56}
                                className="w-14 h-14 object-cover rounded-md flex-shrink-0"
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
            recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="flex items-center text-sm font-semibold text-gray-800">
                    <History className="w-4 h-4 ml-2 text-gray-500" />
                    آخرین جستجوها
                  </h4>
                  <Button
                    variant="link"
                    className="text-xs h-auto p-0"
                    onClick={clearRecentSearches}
                  >
                    <Trash className="w-4 h-4" />
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

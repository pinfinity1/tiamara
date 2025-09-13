import { create } from "zustand";

interface SearchHistoryState {
  recentSearches: string[];
  fetchRecentSearches: () => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

const getSearchesFromStorage = (): string[] => {
  if (typeof window === "undefined") return [];
  const searches = localStorage.getItem("recentSearches");
  return searches ? JSON.parse(searches) : [];
};

export const useSearchHistoryStore = create<SearchHistoryState>((set, get) => ({
  recentSearches: [],

  fetchRecentSearches: () => {
    set({ recentSearches: getSearchesFromStorage() });
  },

  addRecentSearch: (query: string) => {
    if (typeof window === "undefined") return;
    const cleanedQuery = query.trim();
    if (!cleanedQuery) return;

    const currentSearches = getSearchesFromStorage();
    const newSearches = [
      cleanedQuery,
      ...currentSearches.filter(
        (s) => s.toLowerCase() !== cleanedQuery.toLowerCase()
      ),
    ].slice(0, 5);

    localStorage.setItem("recentSearches", JSON.stringify(newSearches));
    set({ recentSearches: newSearches });
  },

  clearRecentSearches: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("recentSearches");
    set({ recentSearches: [] });
  },
}));

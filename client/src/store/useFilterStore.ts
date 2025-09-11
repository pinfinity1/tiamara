import { create } from "zustand";
import { axiosPublic } from "@/lib/axios";
import { Brand } from "./useBrandStore";
import { Category } from "./useCategoryStore";

export interface FilterData {
  brands: Brand[];
  categories: Category[];
  priceRange: { min: number; max: number };
  skinTypes: string[];
  concerns: string[];
  productForms: string[];
}

interface FilterState {
  filters: FilterData | null;
  isLoading: boolean;
  error: string | null;
  fetchFilters: () => Promise<void>;
}

export const useFilterStore = create<FilterState>((set) => ({
  filters: null,
  isLoading: false,
  error: null,

  fetchFilters: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosPublic.get("/products/filters");
      if (response.data.success) {
        set({ filters: response.data.filters, isLoading: false });
      }
    } catch (e) {
      set({ error: "Failed to fetch filters", isLoading: false });
    }
  },
}));

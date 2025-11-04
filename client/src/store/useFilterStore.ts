// project/client/src/store/useFilterStore.ts

import { create } from "zustand";
import { axiosPublic } from "@/lib/axios"; //
import { Brand } from "./useBrandStore"; //
import { Category } from "./useCategoryStore"; //

export interface FilterData {
  brands: Brand[];
  categories: Category[];
  priceRange: { min: number; max: number };
  skinTypes: string[];
  concerns: string[];
  productForms: string[];
}

interface FilterState {
  // --- بخش موجود شما ---
  filters: FilterData | null;
  isLoading: boolean;
  error: string | null;
  fetchFilters: () => Promise<void>;

  // --- بخش جدید برای فیلتر هوشمند ---
  profileBasedFilter: boolean;
  setProfileBasedFilter: (value: boolean) => void;

  // (توجه: من بقیه فیلترهای انتخابی مثل sort و search را اضافه نمی‌کنم
  // چون به نظر می‌رسد شما آن‌ها را جای دیگری مدیریت می‌کنید،
  // که عالی است. ما فقط state سوییچ خودمان را اضافه می‌کنیم)
}

export const useFilterStore = create<FilterState>((set) => ({
  // --- بخش موجود شما ---
  filters: null,
  isLoading: false,
  error: null,
  fetchFilters: async () => {
    set({ isLoading: true, error: null });
    try {
      // (فرض می‌کنیم axiosPublic به درستی در lib/axios تعریف شده)
      const response = await axiosPublic.get("/products/filters");
      if (response.data.success) {
        set({ filters: response.data.filters, isLoading: false });
      }
    } catch (e) {
      set({ error: "Failed to fetch filters", isLoading: false });
    }
  },

  // --- بخش جدید برای فیلتر هوشمند ---
  profileBasedFilter: false,
  setProfileBasedFilter: (value) => set({ profileBasedFilter: value }),
}));

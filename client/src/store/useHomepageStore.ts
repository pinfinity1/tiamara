import axiosAuth from "@/lib/axios";
import { axiosPublic } from "@/lib/axios";
import { Product } from "./useProductStore";
import { create } from "zustand";

export interface FeatureBanner {
  id: string;
  imageUrl: string;
  altText?: string | null;
  title?: string | null;
  subtitle?: string | null;
  linkUrl?: string | null;
  buttonText?: string | null;
  order: number;
  isActive: boolean;
}

export interface HomepageSection {
  id: string;
  title: string;
  order: number;
  products: Product[];
}

interface HomepageState {
  banners: FeatureBanner[];
  sections: HomepageSection[];
  isLoading: boolean;
  error: string | null;
  // Banner Actions
  fetchBanners: () => Promise<void>;
  addBanner: (data: FormData) => Promise<FeatureBanner | null>;
  // Section Actions
  fetchSections: () => Promise<void>;
  createSection: (data: {
    title: string;
    order: number;
    productIds: string[];
  }) => Promise<HomepageSection | null>;
  updateSection: (
    id: string,
    data: { title: string; order: number; productIds: string[] }
  ) => Promise<HomepageSection | null>;
  deleteSection: (id: string) => Promise<boolean>;
}

export const useHomepageStore = create<HomepageState>((set) => ({
  banners: [],
  sections: [],
  isLoading: false,
  error: null,

  // --- Banner Actions Implementation ---
  fetchBanners: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosPublic.get(`/settings/banners`);
      set({ banners: response.data.banners, isLoading: false });
    } catch (e) {
      console.error(e);
      set({ error: "Failed to fetch banners", isLoading: false });
    }
  },
  addBanner: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.post(`/settings/banners/add`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set((state) => ({
        banners: [...state.banners, response.data.banner].sort(
          (a, b) => a.order - b.order
        ),
        isLoading: false,
      }));
      return response.data.banner;
    } catch (e) {
      console.error(e);
      set({ error: "Failed to add banner", isLoading: false });
      return null;
    }
  },

  // --- Homepage Section Actions Implementation ---
  fetchSections: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosPublic.get(`/settings/homepage-sections`);
      set({ sections: response.data.sections, isLoading: false });
    } catch (e) {
      console.error(e);
      set({ error: "Failed to fetch sections", isLoading: false });
    }
  },
  createSection: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.post(
        `/settings/homepage-sections/create`,
        data
      );
      set((state) => ({
        sections: [...state.sections, response.data.section].sort(
          (a, b) => a.order - b.order
        ),
        isLoading: false,
      }));
      return response.data.section;
    } catch (e) {
      console.error(e);
      set({ error: "Failed to create section", isLoading: false });
      return null;
    }
  },
  updateSection: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.put(
        `/settings/homepage-sections/update/${id}`,
        data
      );
      set((state) => ({
        sections: state.sections
          .map((s) => (s.id === id ? response.data.section : s))
          .sort((a, b) => a.order - b.order),
        isLoading: false,
      }));
      return response.data.section;
    } catch (e) {
      console.error(e);
      set({ error: "Failed to update section", isLoading: false });
      return null;
    }
  },
  deleteSection: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axiosAuth.delete(`/settings/homepage-sections/delete/${id}`);
      set((state) => ({
        sections: state.sections.filter((s) => s.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (e) {
      console.error(e);
      set({ error: "Failed to delete section", isLoading: false });
      return false;
    }
  },
}));

import axiosAuth from "@/lib/axios";
import { axiosPublic } from "@/lib/axios";
import { Product } from "./useProductStore";
import { create } from "zustand";

export enum SectionType {
  MANUAL = "MANUAL",
  DISCOUNTED = "DISCOUNTED",
  BEST_SELLING = "BEST_SELLING",
}

export interface FeatureBanner {
  id: string;
  imageUrl: string;
  altText?: string | null;
  linkUrl?: string | null;
  buttonText?: string | null;
  order: number;
  isActive: boolean;
}

export interface HomepageSection {
  id: string;
  title: string;
  order: number;
  type: SectionType;
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
  updateBanner: (id: string, data: FormData) => Promise<FeatureBanner | null>;
  deleteBanner: (id: string) => Promise<boolean>;
  reorderBanners: (reorderedBanners: FeatureBanner[]) => Promise<void>;
  // Section Actions
  fetchSections: () => Promise<void>;
  createSection: (data: FormData) => Promise<void>;
  updateSection: (id: string, data: FormData) => Promise<void>;
  deleteSection: (id: string) => Promise<boolean>;
}

export const useHomepageStore = create<HomepageState>((set, get) => ({
  banners: [],
  sections: [],
  isLoading: false,
  error: null,

  // --- Banner Actions Implementation ---
  fetchBanners: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosPublic.get(`/homepage/banners`);
      set({ banners: response.data.banners, isLoading: false });
    } catch (e) {
      console.error(e);
      set({ error: "Failed to fetch banners", isLoading: false });
    }
  },
  addBanner: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.post(`/homepage/banners/add`, data, {
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
  updateBanner: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.put(
        `/homepage/banners/update/${id}`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.data && Array.isArray(response.data.banners)) {
        set({
          banners: response.data.banners,
          isLoading: false,
        });
        return response.data.banners;
      } else {
        console.warn("پاسخ نامعتبر از سرور، در حال واکشی مجدد لیست بنرها...");
        await get().fetchBanners();
        return get().banners;
      }
    } catch (e) {
      console.error(e);
      set({ error: "Failed to update banner", isLoading: false });
      return null;
    }
  },
  deleteBanner: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axiosAuth.delete(`/homepage/banners/delete/${id}`);
      get().fetchBanners();
      set((state) => ({
        banners: state.banners.filter((b) => b.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (e) {
      console.error(e);
      set({ error: "Failed to delete banner", isLoading: false });
      return false;
    }
  },
  reorderBanners: async (reorderedBanners) => {
    set({ banners: reorderedBanners });

    try {
      const bannerIds = reorderedBanners.map((banner) => banner.id);
      await axiosAuth.post(`/homepage/banners/reorder`, { bannerIds });

      await get().fetchBanners();
    } catch (e) {
      console.error(e);
      get().fetchBanners();
      set({ error: "Failed to reorder banners" });
    }
  },

  // --- Homepage Section Actions Implementation ---
  fetchSections: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosPublic.get(`/homepage/homepage-sections`);
      set({ sections: response.data.sections, isLoading: false });
    } catch (e) {
      console.error(e);
      set({ error: "Failed to fetch sections", isLoading: false });
    }
  },
  createSection: async (data) => {
    try {
      const response = await axios.post("/homepage/sections", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        set((state) => ({
          sections: [...state.sections, response.data.section].sort(
            (a, b) => a.order - b.order
          ),
        }));
        toast({ title: "موفق", description: "سکشن با موفقیت ایجاد شد." });
      }
    } catch (error) {
      console.error("Failed to create section:", error);
      toast({
        title: "خطا",
        description: "ایجاد سکشن با خطا مواجه شد.",
        variant: "destructive",
      });
    }
  },

  updateSection: async (id, data) => {
    try {
      const response = await axios.put(`/homepage/sections/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        set((state) => ({
          sections: state.sections
            .map((s) => (s.id === id ? response.data.section : s))
            .sort((a, b) => a.order - b.order),
        }));
        toast({ title: "موفق", description: "سکشن با موفقیت به‌روز شد." });
      }
    } catch (error) {
      console.error("Failed to update section:", error);
      toast({
        title: "خطا",
        description: "به‌روزرسانی سکشن با خطا مواجه شد.",
        variant: "destructive",
      });
    }
  },
  deleteSection: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axiosAuth.delete(`/homepage/homepage-sections/delete/${id}`);
      await get().fetchSections();
      set({ isLoading: false });
      return true;
    } catch (e) {
      console.error(e);
      set({ error: "Failed to delete section", isLoading: false });
      return false;
    }
  },
}));

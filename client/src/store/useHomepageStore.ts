import { create } from "zustand";
import axiosAuth, { axiosPublic } from "@/lib/axios";
import { toast } from "@/hooks/use-toast";
import { Product } from "./useProductStore";

export enum SectionType {
  MANUAL = "MANUAL",
  DISCOUNTED = "DISCOUNTED",
  BEST_SELLING = "BEST_SELLING",
  BRAND = "BRAND",
}

export interface FeatureBanner {
  id: string;
  group: string;
  imageUrl: string;
  imageUrlMobile?: string | null;
  linkUrl?: string | null;
  altText?: string | null;
  order: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  views: number;
  clicks: number;
}

export interface HomepageSection {
  id: string;
  title: string;
  order: number;
  type: SectionType;
  products: Product[];
  location?: string;
  imageUrl?: string | null;
  brandId?: string | null;
}

interface HomepageState {
  banners: FeatureBanner[]; // For admin panel
  clientBanners: FeatureBanner[]; // For public website
  isLoading: boolean;
  error: string | null;
  // Admin actions
  fetchBanners: () => Promise<void>;
  addBanner: (data: FormData) => Promise<boolean>;
  updateBanner: (id: string, data: FormData) => Promise<boolean>;
  deleteBanner: (id: string) => Promise<boolean>;
  reorderBanners: (reorderedBanners: FeatureBanner[]) => Promise<boolean>;
  deleteBannerGroup: (groupName: string) => Promise<boolean>;
  // Client actions
  fetchBannersForClient: (group: string) => Promise<void>;
  trackClick: (id: string) => Promise<void>;
  // Section actions (placeholders)
  sections: HomepageSection[];
  fetchSections: (location?: string) => Promise<void>;
  createSection: (data: FormData) => Promise<HomepageSection | null>;
  updateSection: (
    id: string,
    data: FormData
  ) => Promise<HomepageSection | null>;
  deleteSection: (id: string) => Promise<boolean>;
}

export const useHomepageStore = create<HomepageState>((set, get) => ({
  banners: [],
  clientBanners: [],
  sections: [],
  isLoading: false,
  error: null,

  // --- Banner Actions for Admin Panel ---
  fetchBanners: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.get("/homepage/banners/admin");
      set({ banners: response.data.banners });
    } catch (e) {
      console.error(e);
      set({ error: "Failed to fetch banners" });
    } finally {
      set({ isLoading: false });
    }
  },

  addBanner: async (data) => {
    set({ isLoading: true });
    try {
      await axiosAuth.post("/homepage/banners/add", data);
      toast({ title: "بنر(ها) با موفقیت اضافه شدند." });
      await get().fetchBanners();
      return true;
    } catch (e) {
      toast({ title: "خطا در افزودن بنر", variant: "destructive" });
      console.error(e);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updateBanner: async (id, data) => {
    set({ isLoading: true });
    try {
      await axiosAuth.put(`/homepage/banners/update/${id}`, data);
      toast({ title: "بنر با موفقیت ویرایش شد." });
      await get().fetchBanners();
      return true;
    } catch (e) {
      toast({ title: "خطا در ویرایش بنر", variant: "destructive" });
      console.error(e);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteBanner: async (id: string) => {
    set({ isLoading: true });
    try {
      await axiosAuth.delete(`/homepage/banners/delete/${id}`);
      toast({ title: "بنر با موفقیت حذف شد." });
      await get().fetchBanners();
      return true;
    } catch (e) {
      toast({ title: "خطا در حذف بنر", variant: "destructive" });
      console.error(e);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteBannerGroup: async (groupName: string) => {
    set({ isLoading: true });
    try {
      await axiosAuth.delete(`/homepage/banners/group/${groupName}`);
      toast({ title: `گروه '${groupName}' حذف شد.` });
      await get().fetchBanners();
      return true;
    } catch (e) {
      toast({ title: "خطا در حذف گروه", variant: "destructive" });
      console.error(e);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  reorderBanners: async (reorderedBanners) => {
    const originalBanners = get().banners;
    set({ banners: reorderedBanners }); // Optimistic update
    set({ isLoading: true });
    try {
      const bannerIds = reorderedBanners.map((b) => b.id);
      await axiosAuth.post("/homepage/banners/reorder", { bannerIds });
      await get().fetchBanners();
      return true;
    } catch (e) {
      set({ banners: originalBanners }); // Revert on error
      toast({ title: "خطا در مرتب‌سازی بنرها", variant: "destructive" });
      console.error(e);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // --- Banner Actions for Client Website ---
  fetchBannersForClient: async (group: string) => {
    set({ isLoading: true });
    try {
      const response = await axiosPublic.get(
        `/homepage/banners?group=${group}`
      );
      set({ clientBanners: response.data.banners });
    } catch (e) {
      console.error(`Failed to fetch banners for group ${group}`, e);
    } finally {
      set({ isLoading: false });
    }
  },

  trackClick: async (id: string) => {
    try {
      await axiosPublic.post(`/homepage/banners/track-click/${id}`);
    } catch (e) {
      console.error("Failed to track click for banner:", id);
    }
  },

  // --- Homepage Section Actions (Placeholders) ---
  fetchSections: async (location = "homepage") => {
    // Implementation needed
  },
  createSection: async (data) => {
    // Implementation needed
    return null;
  },
  updateSection: async (id, data) => {
    // Implementation needed
    return null;
  },
  deleteSection: async (id) => {
    // Implementation needed
    return false;
  },
}));

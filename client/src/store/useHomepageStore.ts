import { create } from "zustand";
import axiosAuth, { axiosPublic } from "@/lib/axios";
import { toast } from "@/hooks/use-toast";
import { Product } from "./useProductStore";

export interface VideoShowcaseItem {
  id: string;
  videoUrl: string;
  order: number;
  product: Product;
  productId: string;
}

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

  // --- فیلدهای جدید اضافه شده ---
  title?: string | null;
  description?: string | null;
  buttonText?: string | null;
  textColor?: string | null;
  // ----------------------------

  order: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  views: number;
  clicks: number;
}

export interface ProductCollection {
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
  banners: FeatureBanner[];
  clientBanners: FeatureBanner[];
  collections: ProductCollection[];
  videoShowcaseItems: VideoShowcaseItem[];
  isLoading: boolean;
  error: string | null;
  // Admin banner actions
  fetchBanners: () => Promise<void>;
  addBanner: (data: FormData) => Promise<boolean>;
  updateBanner: (id: string, data: FormData) => Promise<boolean>;
  deleteBanner: (id: string) => Promise<boolean>;
  reorderBanners: (reorderedBanners: FeatureBanner[]) => Promise<boolean>;
  deleteBannerGroup: (groupName: string) => Promise<boolean>;
  // Client banner actions
  fetchBannersForClient: (group: string) => Promise<void>;
  trackClick: (id: string) => Promise<void>;
  // Collection actions
  fetchCollections: (location?: string) => Promise<void>;
  createCollection: (data: any) => Promise<ProductCollection | null>;
  updateCollection: (
    id: string,
    data: any
  ) => Promise<ProductCollection | null>;
  deleteCollection: (id: string) => Promise<boolean>;
  reorderCollections: (
    reorderedCollections: ProductCollection[]
  ) => Promise<boolean>;
  fetchVideoShowcaseItems: () => Promise<void>;
  addVideoShowcaseItem: (
    formData: FormData,
    onUploadProgress: (progressEvent: any) => void
  ) => Promise<void>;
  deleteVideoShowcaseItem: (id: string) => Promise<void>;
}

export const useHomepageStore = create<HomepageState>((set, get) => ({
  banners: [],
  clientBanners: [],
  collections: [],
  videoShowcaseItems: [],
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
      await axiosAuth.post("/homepage/banners/add", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
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
      await axiosAuth.put(`/homepage/banners/update/${id}`, data, {
        headers: { "Content-Type": undefined },
      });
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

  // --- Product Collection Actions ---
  fetchCollections: async (location) => {
    set({ isLoading: true });
    try {
      const url = location
        ? `/homepage/collections?location=${location}`
        : "/homepage/collections";
      const response = await axiosAuth.get(url);
      if (response.data.success) {
        set({ collections: response.data.collections, isLoading: false });
      }
    } catch (error) {
      set({ error: "Failed to fetch collections.", isLoading: false });
    }
  },
  createCollection: async (data) => {
    set({ isLoading: true });
    try {
      const response = await axiosAuth.post(
        "/homepage/collections/create",
        data
      );
      if (response.data.success) {
        await get().fetchCollections();
        toast({ title: "مجموعه با موفقیت ایجاد شد." });
        return response.data.collection;
      }
      return null;
    } catch (error) {
      toast({ title: "خطا در ایجاد مجموعه.", variant: "destructive" });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
  updateCollection: async (id, data) => {
    set({ isLoading: true });
    try {
      const response = await axiosAuth.put(
        `/homepage/collections/update/${id}`,
        data
      );
      if (response.data.success) {
        await get().fetchCollections();
        toast({ title: "مجموعه با موفقیت ویرایش شد." });
        return response.data.collection;
      }
      return null;
    } catch (error) {
      toast({ title: "خطا در ویرایش مجموعه.", variant: "destructive" });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
  deleteCollection: async (id) => {
    set({ isLoading: true });
    try {
      const response = await axiosAuth.delete(
        `/homepage/collections/delete/${id}`
      );
      if (response.data.success) {
        await get().fetchCollections();
        toast({ title: "مجموعه با موفقیت حذف شد." });
        return true;
      }
      return false;
    } catch (error) {
      toast({ title: "خطا در حذف مجموعه.", variant: "destructive" });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  reorderCollections: async (reorderedCollections) => {
    const originalCollections = get().collections;
    set({ collections: reorderedCollections }); // Optimistic update
    try {
      const collectionIds = reorderedCollections.map((c) => c.id);
      await axiosAuth.post("/homepage/collections/reorder", { collectionIds });
      await get().fetchCollections(); // Re-fetch to confirm
      return true;
    } catch (error) {
      set({ collections: originalCollections }); // Revert on error
      toast({ title: "خطا در مرتب‌سازی مجموعه‌ها", variant: "destructive" });
      return false;
    }
  },

  // ===============================================
  // ================ VIDEO SHOWCASE ===============
  // ===============================================

  fetchVideoShowcaseItems: async () => {
    try {
      set({ isLoading: true });
      const { data } = await axiosAuth.get("/homepage/showcase");
      if (data.success) {
        set({ videoShowcaseItems: data.items });
      }
    } catch (error) {
      toast({
        title: "خطا در دریافت لیست آیتم‌های نمایشی",
        variant: "destructive",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addVideoShowcaseItem: async (formData, onUploadProgress) => {
    try {
      set({ isLoading: true });
      const { data } = await axiosAuth.post(
        "/homepage/showcase/add",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress,
        }
      );
      if (data.success) {
        toast({ title: "آیتم جدید با موفقیت اضافه شد" });
        set((state) => ({
          videoShowcaseItems: [...state.videoShowcaseItems, data.item],
        }));
      }
    } catch (error) {
      toast({ title: "خطا در افزودن آیتم جدید", variant: "destructive" });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteVideoShowcaseItem: async (id: string) => {
    try {
      set({ isLoading: true });
      const { data } = await axiosAuth.delete(
        `/homepage/showcase/delete/${id}`
      );
      if (data.success) {
        toast({ title: "آیتم با موفقیت حذف شد" });
        set((state) => ({
          videoShowcaseItems: state.videoShowcaseItems.filter(
            (item) => item.id !== id
          ),
        }));
      }
    } catch (error) {
      toast({ title: "خطا در حذف آیتم", variant: "destructive" });
    } finally {
      set({ isLoading: false });
    }
  },
}));

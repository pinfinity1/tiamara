import { create } from "zustand";
import axiosAuth, { axiosPublic } from "@/lib/axios";

export interface Brand {
  id: string;
  name: string;
  englishName?: string | null;
  slug: string;
  logoUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

// Defines the shape of the Zustand store for brands
interface BrandState {
  brands: Brand[];
  isLoading: boolean;
  error: string | null;
  fetchBrands: () => Promise<void>;
  createBrand: (data: FormData) => Promise<Brand | null>;
  updateBrand: (id: string, data: FormData) => Promise<Brand | null>;
  deleteBrand: (id: string) => Promise<boolean>;
  uploadBrandsFromExcel: (
    file: File
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
}

export const useBrandStore = create<BrandState>((set, get) => ({
  brands: [],
  isLoading: false,
  error: null,

  fetchBrands: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosPublic.get("/brands");
      if (response.data.success) {
        set({ brands: response.data.brands, isLoading: false });
      }
    } catch (e) {
      set({ error: "Failed to fetch brands", isLoading: false });
    }
  },

  createBrand: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.post("/brands/create", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        set((state) => ({
          brands: [...state.brands, response.data.brand],
          isLoading: false,
        }));
        return response.data.brand;
      }
      return null;
    } catch (e) {
      set({ error: "Failed to create brand", isLoading: false });
      return null;
    }
  },

  updateBrand: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      // Use POST method for FormData with method override for PUT
      data.append("_method", "PUT");
      const response = await axiosAuth.put(`/brands/update/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        set((state) => ({
          brands: state.brands.map((b) =>
            b.id === id ? response.data.brand : b
          ),
          isLoading: false,
        }));
        return response.data.brand;
      }
      return null;
    } catch (e) {
      set({ error: "Failed to update brand", isLoading: false });
      return null;
    }
  },

  deleteBrand: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.delete(`/brands/delete/${id}`);
      if (response.data.success) {
        set((state) => ({
          brands: state.brands.filter((b) => b.id !== id),
          isLoading: false,
        }));
        return true;
      }
      return false;
    } catch (e) {
      set({ error: "Failed to delete brand", isLoading: false });
      return false;
    }
  },

  uploadBrandsFromExcel: async (file: File) => {
    set({ isLoading: true, error: null });
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axiosAuth.post("/brands/upload/excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      get().fetchBrands();
      return { success: true, data: response.data.data };
    } catch (e: any) {
      const errorMsg = e.response?.data?.message || "Failed to upload brands.";
      set({ error: errorMsg });
      return { success: false, error: errorMsg };
    } finally {
      set({ isLoading: false });
    }
  },
}));

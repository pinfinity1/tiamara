import { axiosPublic } from "@/lib/axios";
import axiosAuth from "@/lib/axios";
import { create } from "zustand";

// --- Supporting Types ---
interface Image {
  id: string;
  url: string;
  altText?: string | null;
}

interface Brand {
  id: string;
  name: string;
  englishName?: string | null;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

// --- Main Product Interface ---
export interface Product {
  id: string;
  name: string;
  englishName?: string | null;
  slug: string;
  description?: string | null;
  how_to_use?: string | null;
  caution?: string | null;
  price: number;
  discount_price?: number | null;
  stock: number;
  sku?: string | null;
  barcode?: string | null;
  volume?: number | null;
  unit?: string | null;
  expiry_date?: string | null;
  manufacture_date?: string | null;
  country_of_origin?: string | null;
  images: Image[];
  attributes?: any | null;
  skin_type: string[];
  concern: string[];
  product_form?: string | null;
  ingredients: string[];
  tags: string[];
  average_rating?: number | null;
  review_count?: number | null;
  soldCount: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  brandId?: string | null;
  brand?: Brand | null;
  categoryId?: string | null;
  category?: Category | null;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  adminProducts: Product[];
  adminTotalPages: number;
  adminTotalProducts: number;
  isAdminLoading: boolean;
  fetchAllProductsForAdmin: () => Promise<void>;
  createProduct: (productData: FormData) => Promise<Product | null>;
  updateProduct: (id: string, productData: FormData) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  getProductById: (id: string) => Promise<Product | null>;
  fetchProductsForClient: (params: {
    page?: number;
    limit?: number;
    categories?: string[];
    brands?: string[];
    skin_types?: string[];
    concerns?: string[];
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    profileBasedFilter?: boolean;
    hasDiscount?: boolean; // ✅ موجود است
  }) => Promise<void>;
  setCurrentPage: (page: number) => void;
  fetchProductsByIds: (ids: string[]) => Promise<Product[] | null>;
  uploadProductsFromExcel: (
    file: File
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  fetchAdminProducts: (params: {
    page?: number;
    limit?: number;
    search?: string;
    brandId?: string;
    categoryId?: string;
    sort?: string;
    order?: "asc" | "desc";
    stockStatus?: string;
  }) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: true,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalProducts: 0,
  adminProducts: [],
  adminTotalPages: 1,
  adminTotalProducts: 0,
  isAdminLoading: false,
  fetchAllProductsForAdmin: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.get(`/products/fetch-admin-products`);
      set({ products: response.data, isLoading: false });
    } catch (e) {
      set({ error: "Failed to fetch product", isLoading: false });
    }
  },
  fetchAdminProducts: async (params) => {
    set({ isAdminLoading: true });
    try {
      const response = await axiosAuth.get(`/products/admin/list`, { params });
      set({
        adminProducts: response.data.products,
        adminTotalPages: response.data.totalPages,
        adminTotalProducts: response.data.total,
        isAdminLoading: false,
      });
    } catch (e) {
      set({ error: "Failed to fetch admin products", isAdminLoading: false });
    }
  },
  createProduct: async (productData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.post(
        `/products/create-new-product`,
        productData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      set((state) => ({
        products: [response.data, ...state.products],
        isLoading: false,
      }));
      return response.data;
    } catch (e) {
      set({ error: "Failed to create product", isLoading: false });
      return null;
    }
  },
  updateProduct: async (id: string, productData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.put(`/products/${id}`, productData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      await get().fetchAllProductsForAdmin();
      set({ isLoading: false });
      return response.data;
    } catch (e) {
      set({ error: "Failed to update product", isLoading: false });
      return null;
    }
  },
  deleteProduct: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.delete(`/products/${id}`);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        isLoading: false,
      }));
      return response.data.success;
    } catch (e) {
      set({ error: "Failed to delete product", isLoading: false });
      return false;
    }
  },
  getProductBySlug: async (slug: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosPublic.get(`/products/slug/${slug}`);
      set({ isLoading: false });
      return response.data;
    } catch (e) {
      set({ error: "Failed to fetch product by slug", isLoading: false });
      return null;
    }
  },
  getProductById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.get(`/products/${id}`);
      set({ isLoading: false });
      return response.data;
    } catch (e) {
      set({ error: "Failed to fetch product by ID", isLoading: false });
      return null;
    }
  },

  fetchProductsForClient: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = {
        ...params,
        categories: params.categories?.join(","),
        brands: params.brands?.join(","),
        skin_types: params.skin_types?.join(","),
        concerns: params.concerns?.join(","),

        // ✅ اضافه کردن منطق تبدیل boolean به string برای API
        hasDiscount: params.hasDiscount ? "true" : undefined,
      };

      const response = await axiosPublic.get(
        `/products/fetch-client-products`,
        {
          params: queryParams,
        }
      );

      set({
        products: response.data.products,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalProducts: response.data.totalProducts,
        isLoading: false,
      });
    } catch (e) {
      set({ error: "Failed to fetch products", isLoading: false });
    }
  },

  fetchProductsByIds: async (ids) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosPublic.post(`/products/by-ids`, { ids });
      set({ isLoading: false });
      return response.data.products;
    } catch (e) {
      set({ error: "Failed to fetch products by IDs", isLoading: false });
      return null;
    }
  },
  setCurrentPage: (page: number) => set({ currentPage: page }),
  uploadProductsFromExcel: async (file: File) => {
    set({ isLoading: true, error: null });
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axiosAuth.post(
        "/products/upload/excel",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      set({ isLoading: false });
      get().fetchAllProductsForAdmin();
      return { success: true, data: response.data.data };
    } catch (e: any) {
      const errorMsg =
        e.response?.data?.message || "Failed to upload products.";
      set({ error: errorMsg, isLoading: false });
      return { success: false, error: errorMsg };
    }
  },
}));

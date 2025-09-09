import { API_ROUTES } from "@/utils/api";
import { axiosPublic } from "@/lib/axios";
import axiosAuth from "@/lib/axios";
import { create } from "zustand";

// --- Supporting Types ---
// These types should match your prisma schema for relations

interface Image {
  id: string;
  url: string;
  altText?: string | null;
}

interface Brand {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

// --- Main Product Interface (Updated to match the new schema) ---
export interface Product {
  id: string;
  name: string;
  slug: string; // Added for SEO
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
  expiry_date?: string | null; // Dates are often strings in JSON
  manufacture_date?: string | null;
  country_of_origin?: string | null;
  images: Image[]; // Updated to use the Image interface
  attributes?: any | null;
  skin_type: string[];
  concern: string[];
  product_form?: string | null;
  ingredients: string[];
  tags: string[];
  average_rating?: number | null;
  review_count?: number | null;
  soldCount: number;

  // SEO fields
  metaTitle?: string | null;
  metaDescription?: string | null;

  // Relational fields
  brandId?: string | null;
  brand?: Brand | null;
  categoryId?: string | null;
  category?: Category | null;
}

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalProducts: number;
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
  }) => Promise<void>;
  setCurrentPage: (page: number) => void;
  uploadProductsFromExcel: (
    file: File
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalProducts: 0,
  fetchAllProductsForAdmin: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.get(`/products/fetch-admin-products`);
      set({ products: response.data, isLoading: false });
    } catch (e) {
      set({ error: "Failed to fetch product", isLoading: false });
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
      get().fetchAllProductsForAdmin(); // لیست محصولات را مجدداً بارگذاری می‌کند
      return { success: true, data: response.data.data };
    } catch (e: any) {
      const errorMsg =
        e.response?.data?.message || "Failed to upload products.";
      set({ error: errorMsg, isLoading: false });
      return { success: false, error: errorMsg };
    }
  },
}));

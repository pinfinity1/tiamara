import { API_ROUTES } from "@/utils/api";
import axios from "axios";
import { create } from "zustand";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
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
  images: string[];
  attributes?: any | null;
  skin_type: string[];
  concern: string[];
  product_form?: string | null;
  ingredients: string[];
  tags: string[];
  average_rating?: number | null;
  review_count?: number | null;
  soldCount: number;
  isFeatured: boolean;
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
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: true,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalProducts: 0,
  fetchAllProductsForAdmin: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(
        `${API_ROUTES.PRODUCTS}/fetch-admin-products`,
        {
          withCredentials: true,
        }
      );
      set({ products: response.data, isLoading: false });
    } catch (e) {
      set({ error: "Failed to fetch product", isLoading: false });
    }
  },
  createProduct: async (productData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_ROUTES.PRODUCTS}/create-new-product`,
        productData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      set({ isLoading: false });
      return response.data;
    } catch (e) {
      set({ error: "Failed to create product", isLoading: false });
      return null;
    }
  },
  updateProduct: async (id: string, productData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        `${API_ROUTES.PRODUCTS}/${id}`,
        productData,
        {
          withCredentials: true,
          // FormData handles its own Content-Type header
        }
      );
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
      const response = await axios.delete(`${API_ROUTES.PRODUCTS}/${id}`, {
        withCredentials: true,
      });
      set({ isLoading: false });
      return response.data.success;
    } catch (e) {
      set({ error: "Failed to delete product", isLoading: false });
      return false;
    }
  },
  getProductById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_ROUTES.PRODUCTS}/${id}`, {
        withCredentials: true,
      });
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

      const response = await axios.get(
        `${API_ROUTES.PRODUCTS}/fetch-client-products`,
        {
          params: queryParams,
          withCredentials: true,
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
}));

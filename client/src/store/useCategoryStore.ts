"use client";

import { create } from "zustand";
import { axiosPublic } from "@/lib/axios";
import axiosAuth from "@/lib/axios";

// Define the type for a single category
export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

// Define the state and actions for the category store
interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (formData: FormData) => Promise<Category | null>;
  updateCategory: (id: string, formData: FormData) => Promise<Category | null>;
  deleteCategory: (id: string) => Promise<boolean>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  // Action to fetch all categories
  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosPublic.get("/categories");
      if (response.data.success) {
        set({ categories: response.data.categories, isLoading: false });
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      set({ error: "Failed to fetch categories.", isLoading: false });
    }
  },

  // Action to create a new category
  createCategory: async (formData: FormData) => {
    set({ isLoading: true });
    try {
      const response = await axiosAuth.post("/categories/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data.success) {
        const newCategory = response.data.category;
        set((state) => ({
          categories: [...state.categories, newCategory],
          isLoading: false,
        }));
        return newCategory;
      }
      return null;
    } catch (error) {
      console.error("Failed to create category:", error);
      set({ error: "Failed to create category.", isLoading: false });
      return null;
    }
  },

  // Action to update an existing category
  updateCategory: async (id: string, formData: FormData) => {
    set({ isLoading: true });
    try {
      const response = await axiosAuth.put(
        `/categories/update/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.success) {
        const updatedCategory = response.data.category;
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? updatedCategory : c
          ),
          isLoading: false,
        }));
        return updatedCategory;
      }
      return null;
    } catch (error) {
      console.error("Failed to update category:", error);
      set({ error: "Failed to update category.", isLoading: false });
      return null;
    }
  },

  // Action to delete a category
  deleteCategory: async (id: string) => {
    set({ isLoading: true });
    try {
      const response = await axiosAuth.delete(`/categories/delete/${id}`);
      if (response.data.success) {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
          isLoading: false,
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to delete category:", error);
      set({ error: "Failed to delete category.", isLoading: false });
      return false;
    }
  },
}));

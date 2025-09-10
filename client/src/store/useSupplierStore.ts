import { create } from "zustand";
import axiosAuth from "@/lib/axios";

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

interface SupplierState {
  suppliers: Supplier[];
  isLoading: boolean;
  error: string | null;
  fetchSuppliers: () => Promise<void>;
  createSupplier: (data: Omit<Supplier, "id">) => Promise<Supplier | null>;
  updateSupplier: (
    id: string,
    data: Partial<Supplier>
  ) => Promise<Supplier | null>;
  deleteSupplier: (id: string) => Promise<boolean>;
}

export const useSupplierStore = create<SupplierState>((set, get) => ({
  suppliers: [],
  isLoading: false,
  error: null,

  fetchSuppliers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.get("/suppliers");
      if (response.data.success) {
        set({ suppliers: response.data.suppliers, isLoading: false });
      }
    } catch (e) {
      set({ error: "Failed to fetch suppliers", isLoading: false });
    }
  },

  createSupplier: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.post("/suppliers/create", data);
      if (response.data.success) {
        await get().fetchSuppliers();
        set({ isLoading: false });
        return response.data.supplier;
      }
      return null;
    } catch (e) {
      set({ error: "Failed to create supplier", isLoading: false });
      return null;
    }
  },

  updateSupplier: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.put(`/suppliers/update/${id}`, data);
      if (response.data.success) {
        await get().fetchSuppliers();
        set({ isLoading: false });
        return response.data.supplier;
      }
      return null;
    } catch (e) {
      set({ error: "Failed to update supplier", isLoading: false });
      return null;
    }
  },

  deleteSupplier: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.delete(`/suppliers/delete/${id}`);
      if (response.data.success) {
        await get().fetchSuppliers();
        set({ isLoading: false });
        return true;
      }
      return false;
    } catch (e) {
      set({ error: "Failed to delete supplier", isLoading: false });
      return false;
    }
  },
}));

import { create } from "zustand";
import axiosAuth from "@/lib/axios";

export interface ShippingMethod {
  id: string;
  name: string;
  code: string;
  cost: number;
  description?: string;
  isActive: boolean;
}

interface ShippingState {
  shippingMethods: ShippingMethod[];
  isLoading: boolean;
  fetchShippingMethods: () => Promise<void>;
  createShippingMethod: (data: Partial<ShippingMethod>) => Promise<boolean>;
  updateShippingMethod: (
    id: string,
    data: Partial<ShippingMethod>
  ) => Promise<boolean>;
  deleteShippingMethod: (id: string) => Promise<boolean>;
}

export const useShippingStore = create<ShippingState>((set) => ({
  shippingMethods: [],
  isLoading: false,

  fetchShippingMethods: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosAuth.get("/shipping/admin/all");
      set({ shippingMethods: response.data, isLoading: false });
    } catch (error) {
      console.error("Error fetching shipping methods:", error);
      set({ isLoading: false });
    }
  },

  createShippingMethod: async (data) => {
    set({ isLoading: true });
    try {
      const response = await axiosAuth.post("/shipping", data);
      set((state) => ({
        shippingMethods: [response.data, ...state.shippingMethods],
        isLoading: false,
      }));
      return true;
    } catch (error) {
      console.error("Error creating shipping method:", error);
      set({ isLoading: false });
      return false;
    }
  },

  updateShippingMethod: async (id, data) => {
    set({ isLoading: true });
    try {
      const response = await axiosAuth.put(`/shipping/${id}`, data);
      set((state) => ({
        shippingMethods: state.shippingMethods.map((m) =>
          m.id === id ? response.data : m
        ),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      console.error("Error updating shipping method:", error);
      set({ isLoading: false });
      return false;
    }
  },

  deleteShippingMethod: async (id) => {
    set({ isLoading: true });
    try {
      await axiosAuth.delete(`/shipping/${id}`);
      set((state) => ({
        shippingMethods: state.shippingMethods.filter((m) => m.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      console.error("Error deleting shipping method:", error);
      set({ isLoading: false });
      return false;
    }
  },
}));

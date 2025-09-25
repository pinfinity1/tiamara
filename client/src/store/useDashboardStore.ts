import { create } from "zustand";
import axiosAuth from "@/lib/axios";
import { Order } from "./useOrderStore";
import { Product } from "./useProductStore";

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  lowStockProducts: Pick<Product, "id" | "name" | "stock">[];
  recentOrders: (Order & { user: { name: string | null } })[];
}

interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  fetchDashboardStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  isLoading: true,
  error: null,
  fetchDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.get("/dashboard/stats");
      if (response.data.success) {
        set({ stats: response.data.stats, isLoading: false });
      }
    } catch (e) {
      set({ error: "Failed to fetch dashboard stats", isLoading: false });
    }
  },
}));

import { create } from "zustand";
import axiosAuth from "@/lib/axios";
import { Product } from "./useProductStore";
import { User } from "next-auth";

export interface StockHistory {
  id: string;
  product: Product;
  change: number;
  newStock: number;
  type: string;
  notes?: string | null;
  createdAt: string;
  user?: { name: string | null } | null;
}

interface StockHistoryState {
  history: StockHistory[];
  isLoading: boolean;
  error: string | null;
  fetchHistory: (productId?: string) => Promise<void>;
}

export const useStockHistoryStore = create<StockHistoryState>((set) => ({
  history: [],
  isLoading: false,
  error: null,

  fetchHistory: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      const url = productId ? `/stock-history/${productId}` : "/stock-history";
      const response = await axiosAuth.get(url);
      if (response.data.success) {
        set({ history: response.data.history, isLoading: false });
      }
    } catch (e) {
      set({ error: "Failed to fetch stock history", isLoading: false });
    }
  },
}));

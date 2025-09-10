import { create } from "zustand";
import axiosAuth from "@/lib/axios";
import { Supplier } from "./useSupplierStore";
import { Product } from "./useProductStore";

export interface PurchaseOrderItem {
  id: string;
  product: { name: string; sku: string | null };
  quantity: number;
  unitPrice: number;
}

export interface PurchaseOrder {
  id: string;
  supplier: Supplier;
  orderDate: string;
  expectedDate?: string | null;
  status: "PENDING" | "ORDERED" | "RECEIVED" | "CANCELLED";
  totalAmount: number;
  notes?: string | null;
  items: PurchaseOrderItem[];
}

interface CreatePurchaseOrderData {
  supplierId: string;
  expectedDate?: string;
  notes?: string;
  totalAmount: number;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}

interface PurchaseOrderState {
  purchaseOrders: PurchaseOrder[];
  isLoading: boolean;
  error: string | null;
  fetchPurchaseOrders: () => Promise<void>;
  createPurchaseOrder: (
    data: CreatePurchaseOrderData
  ) => Promise<PurchaseOrder | null>;
  updatePurchaseOrderStatus: (
    id: string,
    status: PurchaseOrder["status"]
  ) => Promise<boolean>;
}

export const usePurchaseOrderStore = create<PurchaseOrderState>((set, get) => ({
  purchaseOrders: [],
  isLoading: false,
  error: null,

  fetchPurchaseOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.get("/purchase-orders");
      if (response.data.success) {
        set({ purchaseOrders: response.data.purchaseOrders, isLoading: false });
      }
    } catch (e) {
      set({ error: "Failed to fetch purchase orders", isLoading: false });
    }
  },

  createPurchaseOrder: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.post("/purchase-orders/create", data);
      if (response.data.success) {
        await get().fetchPurchaseOrders(); // Refresh list
        return response.data.purchaseOrder;
      }
      return null;
    } catch (e) {
      set({ error: "Failed to create purchase order", isLoading: false });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  updatePurchaseOrderStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.put(
        `/purchase-orders/update-status/${id}`,
        { status }
      );
      if (response.data.success) {
        await get().fetchPurchaseOrders(); // Refresh list
        return true;
      }
      return false;
    } catch (e) {
      set({
        error: "Failed to update purchase order status",
        isLoading: false,
      });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));

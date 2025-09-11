import axiosAuth from "@/lib/axios";
import { create } from "zustand";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productCategory: string;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  addressId: string;
  items: OrderItem[];
  couponId?: string;
  total: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";
  paymentMethod: "CREDIT_CARD";
  paymentStatus: "PENDING" | "COMPLETED";
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrder extends Order {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface CreateOrderData {
  userId: string;
  addressId: string;
  items: Omit<OrderItem, "id" | "productName" | "productCategory">[];
  couponId?: string;
  total: number;
}

interface OrderStore {
  currentOrder: Order | null;
  isLoading: boolean;
  isPaymentProcessing: boolean;
  userOrders: Order[];
  adminOrders: AdminOrder[];
  error: string | null;
  createFinalOrder: (
    orderData: CreateOrderData
  ) => Promise<{ success: boolean; paymentUrl?: string; order?: Order }>;
  getOrder: (orderId: string) => Promise<Order | null>;
  updateOrderStatus: (
    orderId: string,
    status: Order["status"]
  ) => Promise<boolean>;
  getAllOrders: () => Promise<AdminOrder[] | null>;
  getOrdersByUserId: () => Promise<Order[] | null>;
  setCurrentOrder: (order: Order | null) => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  currentOrder: null,
  isLoading: true,
  error: null,
  isPaymentProcessing: false,
  userOrders: [],
  adminOrders: [],

  createFinalOrder: async (orderData) => {
    set({ isLoading: true, error: null, isPaymentProcessing: true });
    try {
      const response = await axiosAuth.post(
        `/order/create-final-order`,
        orderData
      );
      set({
        isLoading: false,
        isPaymentProcessing: false,
        currentOrder: response.data.order,
      });
      return {
        success: true,
        paymentUrl: response.data.paymentUrl,
        order: response.data.order,
      };
    } catch (error) {
      set({
        error: "Failed to create final order",
        isLoading: false,
        isPaymentProcessing: false,
      });
      return { success: false };
    }
  },

  updateOrderStatus: async (orderId, status) => {
    set({ isLoading: true, error: null });
    try {
      await axiosAuth.put(`/order/${orderId}/status`, { status });
      set((state) => ({
        isLoading: false,
        adminOrders: state.adminOrders.map((item) =>
          item.id === orderId
            ? {
                ...item,
                status,
              }
            : item
        ),
      }));
      get().getOrdersByUserId();
      return true;
    } catch (error) {
      set({ error: "Failed to update order status", isLoading: false });
      return false;
    }
  },

  getAllOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.get(`/order/get-all-orders-for-admin`);
      set({ isLoading: false, adminOrders: response.data });
      return response.data;
    } catch (error) {
      set({ error: "Failed to fetch all orders for admin", isLoading: false });
      return null;
    }
  },

  getOrdersByUserId: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.get(`/order/get-order-by-user-id`);
      set({ isLoading: false, userOrders: response.data });
      return response.data;
    } catch (error) {
      set({ error: "Failed to fetch orders for user", isLoading: false });
      return null;
    }
  },

  setCurrentOrder: (order) => set({ currentOrder: order }),

  getOrder: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.get(
        `/order/get-single-order/${orderId}`
      );
      set({ isLoading: false, currentOrder: response.data });
      return response.data;
    } catch (error) {
      set({ error: "Failed to fetch order", isLoading: false });
      return null;
    }
  },
}));

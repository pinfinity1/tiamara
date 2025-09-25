import { create } from "zustand";
import axiosAuth from "@/lib/axios";
import { Address } from "./useAddressStore";
import { Coupon } from "./useCouponStore";

// --- All type definitions remain the same ---
export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";

export const statusTranslations: Record<OrderStatus, string> = {
  PENDING: "در انتظار",
  PROCESSING: "در حال پردازش",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل شده",
};

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    slug: string;
    images: { url: string }[];
  };
}

export interface Order {
  id: string;
  orderNumber: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  items: OrderItem[];
  address: Address;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone?: string | null;
  };
  coupon?: Coupon | null;
}

interface CreateOrderData {
  addressId: string;
  couponId?: string;
}

interface OrderStore {
  userOrders: Order[];
  adminOrders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  createFinalOrder: (
    orderData: CreateOrderData
  ) => Promise<{ success: boolean; paymentUrl?: string }>;
  getOrdersByUserId: () => Promise<void>;
  fetchOrdersForAdmin: (filters: {
    status?: string;
    paymentStatus?: string;
    search?: string;
  }) => Promise<void>;
  fetchSingleOrderForAdmin: (orderId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  setSelectedOrder: (order: Order | null) => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  userOrders: [],
  adminOrders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,

  createFinalOrder: async (orderData) => {
    set({ isLoading: true });
    try {
      // Corrected Path
      const response = await axiosAuth.post(
        "/order/create-final-order",
        orderData
      );
      return { success: true, paymentUrl: response.data.paymentUrl };
    } catch (error) {
      console.error("Failed to create final order", error);
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  getOrdersByUserId: async () => {
    set({ isLoading: true });
    try {
      // Corrected Path
      const response = await axiosAuth.get("/order/get-order-by-user-id");
      set({ userOrders: response.data });
    } catch (error) {
      console.error("Failed to fetch user orders", error);
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedOrder: (order) => {
    set({ selectedOrder: order });
    if (order) {
      get().fetchSingleOrderForAdmin(order.id);
    }
  },

  fetchOrdersForAdmin: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== "ALL")
        params.append("status", filters.status);
      if (filters.paymentStatus && filters.paymentStatus !== "ALL")
        params.append("paymentStatus", filters.paymentStatus);
      if (filters.search) params.append("search", filters.search);
      // Corrected Path
      const response = await axiosAuth.get(`/order/get-all-orders-for-admin`, {
        params,
      });
      set({ adminOrders: response.data, isLoading: false });
    } catch (e) {
      set({ error: "Failed to fetch orders for admin", isLoading: false });
    }
  },

  fetchSingleOrderForAdmin: async (orderId) => {
    set({ isLoading: true });
    try {
      // Corrected Path
      const response = await axiosAuth.get(
        `/order/admin/get-single-order/${orderId}`
      );
      if (response.data.success) {
        set({ selectedOrder: response.data.order, isLoading: false });
      } else {
        throw new Error(response.data.message);
      }
    } catch (e) {
      set({ error: "Failed to fetch single order", isLoading: false });
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      // Corrected Path
      const response = await axiosAuth.put(`/order/${orderId}/status`, {
        status,
      });
      if (response.data.success) {
        set((state) => ({
          adminOrders: state.adminOrders.map((order) =>
            order.id === orderId ? { ...order, status } : order
          ),
          selectedOrder:
            state.selectedOrder && state.selectedOrder.id === orderId
              ? { ...state.selectedOrder, status }
              : state.selectedOrder,
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update order status", error);
      return false;
    }
  },
}));

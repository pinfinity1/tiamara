// client/src/store/useOrderStore.ts

import { create } from "zustand";
import axiosAuth from "@/lib/axios";

// --- Enums and Types ---
export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  product?: {
    slug?: string;
    images: { url: string }[];
  };
}

export interface Order {
  id: string;
  orderNumber: number;
  createdAt: string;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentRefId?: string | null;
  paymentAuthority?: string | null;

  items: OrderItem[];

  // ✅ اصلاح شده: اضافه شدن province
  address: {
    name: string;
    address: string;
    city: string;
    province: string; // اضافه شد
    country: string;
    postalCode: string;
    phone: string;
  };

  user: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };

  coupon?: {
    code: string;
    discountValue: number;
  } | null;

  // ✅ اصلاح شده: اضافه شدن cost
  shippingMethod?: {
    name: string;
    cost: number; // اضافه شد
  } | null;
}

// Helper for translations
export const statusTranslations: Record<OrderStatus, string> = {
  PENDING: "در انتظار",
  PROCESSING: "در حال پردازش",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل داده شده",
};

export const paymentStatusTranslations: Record<PaymentStatus, string> = {
  PENDING: "در انتظار پرداخت",
  COMPLETED: "پرداخت موفق",
  FAILED: "پرداخت ناموفق",
  CANCELLED: "لغو شده",
};

export const getPaymentStatusVariant = (status: PaymentStatus) => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-800 border-green-300";
    case "FAILED":
      return "bg-red-100 text-red-800 border-red-300";
    case "CANCELLED":
      return "bg-gray-100 text-gray-800 border-gray-300";
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
  }
};

// --- Zustand Store Definition ---
interface OrderState {
  userOrders: Order[];
  adminOrders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  isPaymentProcessing: boolean;
  error: string | null;

  // User-facing actions
  getOrdersByUserId: () => Promise<void>;

  createFinalOrder: (data: {
    addressId: string;
    couponId?: string | null;
    shippingMethodId: string;
  }) => Promise<{ success: boolean; paymentUrl?: string }>;

  // Admin-facing actions
  fetchOrdersForAdmin: (filters: {
    status?: string;
    paymentStatus?: string;
    search?: string;
  }) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  setSelectedOrder: (order: Order | null) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  userOrders: [],
  adminOrders: [],
  selectedOrder: null,
  isLoading: false,
  isPaymentProcessing: false,
  error: null,

  // --- User-facing actions ---
  getOrdersByUserId: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosAuth.get("/order/my-orders");
      if (response.data.success) {
        set({ userOrders: response.data.orders, isLoading: false });
      }
    } catch (error) {
      set({ error: "Failed to fetch user orders.", isLoading: false });
    }
  },

  createFinalOrder: async (data) => {
    set({ isPaymentProcessing: true });
    try {
      const response = await axiosAuth.post("/order/create-final-order", data);
      if (response.data.success) {
        return { success: true, paymentUrl: response.data.paymentUrl };
      }
      return { success: false };
    } catch (error) {
      return { success: false };
    } finally {
      set({ isPaymentProcessing: false });
    }
  },

  // --- Admin-facing actions ---
  fetchOrdersForAdmin: async (filters) => {
    set({ isLoading: true });
    try {
      const response = await axiosAuth.get("/order/admin/all", {
        params: filters,
      });
      if (response.data.success) {
        set({ adminOrders: response.data.orders, isLoading: false });
      }
    } catch (error) {
      set({ error: "Failed to fetch admin orders.", isLoading: false });
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      await axiosAuth.put(`/order/admin/status/${orderId}`, { status });
      await get().fetchOrdersForAdmin({});
      if (get().userOrders.some((o) => o.id === orderId)) {
        await get().getOrdersByUserId();
      }
      const currentSelected = get().selectedOrder;
      if (currentSelected && currentSelected.id === orderId) {
        set({ selectedOrder: { ...currentSelected, status } });
      }
      return true;
    } catch (error) {
      return false;
    }
  },

  setSelectedOrder: async (order) => {
    if (!order) {
      set({ selectedOrder: null });
      return;
    }
    set({ isLoading: true, selectedOrder: order });
    try {
      const response = await axiosAuth.get(`/order/admin/single/${order.id}`);
      if (response.data.success) {
        set({ selectedOrder: response.data.order, isLoading: false });
      }
    } catch (error) {
      set({ error: "Failed to fetch order details.", isLoading: false });
    }
  },
}));

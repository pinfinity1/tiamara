import { create } from "zustand";
import axiosAuth from "@/lib/axios";
import { useCartStore } from "./useCartStore";
import { Address } from "./useAddressStore";
import { Coupon } from "./useCouponStore";

// --- انواع داده‌ها ---
export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";

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

// رابط داده‌های ارسالی به سرور
interface CreateOrderData {
  addressId: string;
  couponId?: string;
}

// رابط پاسخ دریافتی از سرور
interface CreateOrderResponse {
  success: boolean;
  paymentUrl?: string;
  message?: string;
}

// --- تعریف Store ---
interface OrderStore {
  userOrders: Order[];
  adminOrders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  isPaymentProcessing: boolean;
  error: string | null;
  createFinalOrder: (
    orderData: CreateOrderData
  ) => Promise<CreateOrderResponse>;
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
  isPaymentProcessing: false, // مقداردهی اولیه شد
  error: null,

  createFinalOrder: async (orderData) => {
    set({ isPaymentProcessing: true, error: null }); // شروع فرآیند پرداخت
    try {
      const response = await axiosAuth.post<CreateOrderResponse>(
        "/order/create-final-order",
        orderData
      );

      if (response.data.success && response.data.paymentUrl) {
        useCartStore.getState().clearCart(); // پاک کردن سبد خرید در کلاینت
        return { success: true, paymentUrl: response.data.paymentUrl };
      }
      // اگر عملیات موفق نبود ولی پیام داشت
      return { success: false, message: response.data.message };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "خطا در ایجاد سفارش";
      set({ error: errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      set({ isPaymentProcessing: false }); // پایان فرآیند پرداخت
    }
  },

  getOrdersByUserId: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.get("/order/my-orders");
      set({ userOrders: response.data, isLoading: false });
    } catch (error) {
      const errorMessage = "خطا در دریافت سفارشات کاربر";
      set({ error: errorMessage, isLoading: false });
      console.error(errorMessage, error);
    }
  },

  setSelectedOrder: (order) => {
    set({ selectedOrder: order });
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

      const response = await axiosAuth.get(`/order/admin/all`, { params });
      set({ adminOrders: response.data, isLoading: false });
    } catch (e) {
      set({ error: "Failed to fetch orders for admin", isLoading: false });
    }
  },

  fetchSingleOrderForAdmin: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.get(`/order/admin/single/${orderId}`);
      if (response.data.success) {
        set({ selectedOrder: response.data.order, isLoading: false });
      } else {
        throw new Error(response.data.message);
      }
    } catch (e: any) {
      const errorMessage = e.message || "Failed to fetch single order";
      set({ error: errorMessage, isLoading: false });
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await axiosAuth.put(`/order/admin/status/${orderId}`, {
        status,
      });
      if (response.data.success) {
        set((state) => ({
          adminOrders: state.adminOrders.map((order) =>
            order.id === orderId ? response.data.order : order
          ),
          selectedOrder:
            state.selectedOrder && state.selectedOrder.id === orderId
              ? response.data.order
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

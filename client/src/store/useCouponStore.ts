import { create } from "zustand";
import axiosAuth from "@/lib/axios";

export interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  expireDate: string;
  isActive: boolean;
  usageLimit: number;
  usageCount: number;
}

interface CouponState {
  coupons: Coupon[];
  selectedCoupon: Coupon | null;
  isLoading: boolean;
  error: string | null;
  fetchCoupons: () => Promise<void>;
  setSelectedCoupon: (coupon: Coupon | null) => void;
  createCoupon: (
    couponData: Omit<Coupon, "id" | "usageCount">
  ) => Promise<boolean>;
  updateCoupon: (
    id: string,
    couponData: Partial<Omit<Coupon, "id" | "usageCount">>
  ) => Promise<boolean>;
  deleteCoupon: (id: string) => Promise<boolean>;
  validateCoupon: (code: string) => Promise<{
    isValid: boolean;
    coupon?: Coupon;
    message?: string;
  }>;
}

export const useCouponStore = create<CouponState>((set, get) => ({
  coupons: [],
  selectedCoupon: null,
  isLoading: false,
  error: null,

  setSelectedCoupon: (coupon) => set({ selectedCoupon: coupon }),

  fetchCoupons: async () => {
    set({ isLoading: true, error: null });
    try {
      // Corrected Path
      const response = await axiosAuth.get("/coupon");
      set({ coupons: response.data.coupons, isLoading: false });
    } catch (error) {
      set({ error: "Failed to fetch coupons", isLoading: false });
    }
  },

  createCoupon: async (couponData) => {
    try {
      // Corrected Path
      await axiosAuth.post("/coupon", couponData);
      get().fetchCoupons();
      return true;
    } catch (error) {
      console.error("Failed to create coupon", error);
      return false;
    }
  },

  updateCoupon: async (id, couponData) => {
    try {
      // Corrected Path
      await axiosAuth.put(`/coupon/${id}`, couponData);
      get().fetchCoupons();
      return true;
    } catch (error) {
      console.error("Failed to update coupon", error);
      return false;
    }
  },

  deleteCoupon: async (id) => {
    try {
      // Corrected Path
      await axiosAuth.delete(`/coupon/${id}`);
      set((state) => ({
        coupons: state.coupons.filter((c) => c.id !== id),
      }));
      return true;
    } catch (error) {
      console.error("Failed to delete coupon", error);
      return false;
    }
  },

  validateCoupon: async (code) => {
    set({ isLoading: true });
    try {
      // Corrected Path
      const response = await axiosAuth.post("/coupon/validate", { code });
      return { isValid: true, coupon: response.data.coupon };
    } catch (error: any) {
      return {
        isValid: false,
        message:
          error.response?.data?.message || "An unexpected error occurred",
      };
    } finally {
      set({ isLoading: false });
    }
  },
}));

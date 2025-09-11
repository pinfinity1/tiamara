import axiosAuth from "@/lib/axios";
import { create } from "zustand";

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usageCount: number;
}

interface CouponStore {
  couponList: Coupon[];
  isLoading: boolean;
  error: string | null;
  fetchCoupons: () => Promise<void>;
  createCoupon: (
    coupon: Omit<Coupon, "id" | "usageCount">
  ) => Promise<Coupon | null>;
  deleteCoupon: (id: string) => Promise<boolean>;
}

export const useCouponStore = create<CouponStore>((set, get) => ({
  couponList: [],
  isLoading: false,
  error: null,
  fetchCoupons: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.get(`/coupon/fetch-all-coupons`);
      set({ couponList: response.data.couponList, isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: "Failed to fetch coupons" });
    }
  },
  createCoupon: async (coupon) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.post(`/coupon/create-coupon`, coupon);

      set({ isLoading: false });
      return response.data.coupon;
    } catch (e) {
      set({ isLoading: false, error: "Failed to create coupon" });
      return null;
    }
  },
  deleteCoupon: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosAuth.delete(`/coupon/${id}`);
      set({ isLoading: false });
      return response.data.success;
    } catch (error) {
      set({ isLoading: false, error: "Failed to delete coupon" });
      return false; // Changed from null to false for boolean return type
    }
  },
}));

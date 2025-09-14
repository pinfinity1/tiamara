// client/src/store/useUserStore.ts

import { create } from "zustand";
import axiosAuth from "@/lib/axios";

interface UserProfile {
  name: string | null;
  email: string | null;
  phone: string | null;
  skinType: string | null;
  skinConcerns: string[];
  skincareGoals: string[];
  productPreferences: string[];
}

interface UserStore {
  userProfile: UserProfile | null;
  isLoading: boolean;
  fetchProfile: () => Promise<void>;
  updateUserProfile: (
    data: Partial<UserProfile>
  ) => Promise<UserProfile | null>;
}

export const useUserStore = create<UserStore>((set) => ({
  userProfile: null,
  isLoading: false,
  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosAuth.get("/user/profile");
      set({ userProfile: response.data, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      set({ isLoading: false });
    }
  },
  updateUserProfile: async (data) => {
    set({ isLoading: true });
    try {
      const response = await axiosAuth.put("/user/profile", data);
      set({ userProfile: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      console.error("Failed to update user profile:", error);
      set({ isLoading: false });
      return null;
    }
  },
}));

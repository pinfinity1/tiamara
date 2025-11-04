import { create } from "zustand";
import axiosAuth from "@/lib/axios";

// ۱. اینترفیس UserProfile حالا با schema.prisma مطابقت کامل دارد
interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;

  // بخش ۱: اطلاعات پایه
  ageRange: string | null;
  gender: string | null;
  isPregnantOrNursing: boolean | null;

  // بخش ۲: ارزیابی پوست
  skinType: string | null;
  skinSensitivity: string | null;
  skinConcerns: string[];
  skincareGoals: string[];
  acneType: string | null;
  eyeConcerns: string[];

  // بخش ۳: سبک زندگی و محیط
  sleepHours: string | null;
  stressLevel: string | null;
  waterIntake: string | null;
  dietHabits: string[];
  smokingHabit: string | null;
  environmentType: string | null;
  climate: string | null;

  // بخش ۴: روتین فعلی و سابقه
  currentRoutineProducts: string[];
  activeIngredients: string[];
  medications: string | null;
  knownAllergies: string[];

  // بخش ۵: ترجیحات
  routineComplexity: string | null;
  texturePreferences: string[];
  productPreferences: string[];
}

interface UserStore {
  userProfile: UserProfile | null;
  isLoading: boolean;
  fetchProfile: () => Promise<void>;
  updateUserProfile: (
    data: Partial<UserProfile> // این بخش به لطف Partial<UserProfile> نیازی به تغییر ندارد
  ) => Promise<UserProfile | null>;
  clearSkinProfile: () => Promise<boolean>;
}

export const useUserStore = create<UserStore>((set, get) => ({
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
      // این تابع حالا می‌تواند تمام فیلدهای جدید را ارسال کند
      const response = await axiosAuth.put("/user/profile", data);
      set({ userProfile: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      console.error("Failed to update user profile:", error);
      set({ isLoading: false });
      return null;
    }
  },
  clearSkinProfile: async () => {
    set({ isLoading: true });
    try {
      await axiosAuth.delete("/user/profile/skin");
      // پس از موفقیت، پروفایل را دوباره فچ می‌کنیم تا اطلاعات خالی نمایش داده شود
      await get().fetchProfile();
      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error("Failed to clear skin profile:", error);
      set({ isLoading: false });
      return false;
    }
  },
}));

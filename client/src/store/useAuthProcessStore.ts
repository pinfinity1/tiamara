import { create } from "zustand";
import { axiosPublic } from "@/lib/axios";
import { toast } from "@/hooks/use-toast";
import { signIn } from "next-auth/react";
import { protectPhoneAuthAction } from "@/actions/auth";

type AuthStep =
  | "phone"
  | "password"
  | "otp"
  | "forgot-password-phone"
  | "forgot-password-reset";

interface AuthState {
  step: AuthStep;
  phone: string;
  isLoading: boolean;
  userHasPassword: boolean;
  setStep: (step: AuthStep) => void;
  setPhone: (phone: string) => void;

  // Actions
  checkPhone: (phone: string) => Promise<void>;
  finalLogin: (
    loginType: "password" | "otp",
    data: { password?: string; otp?: string },
    onSuccess: () => void
  ) => Promise<void>;
  requestPasswordReset: () => Promise<void>;
  resetPassword: (otp: string, password: string) => Promise<boolean>;
}

export const useAuthProcessStore = create<AuthState>((set, get) => ({
  step: "phone",
  phone: "",
  isLoading: false,
  userHasPassword: false,
  setStep: (step) => set({ step }),
  setPhone: (phone) => set({ phone }),

  checkPhone: async (phone) => {
    set({ isLoading: true, phone });
    try {
      // ++ ADDED: Call Arcjet action before proceeding
      const protection = await protectPhoneAuthAction(phone);
      if (!protection.success) {
        toast({
          title: "خطا",
          description: protection.error,
          variant: "destructive",
        });
        return;
      }

      const response = await axiosPublic.post(`/auth/check-phone`, { phone });
      if (response.data.success) {
        set({
          userHasPassword: response.data.hasPassword,
          step: response.data.hasPassword ? "password" : "otp",
        });
        toast({ title: "کد یکبار مصرف با موفقیت ارسال شد." });
      }
    } catch (error: any) {
      toast({
        title: "خطا",
        description:
          error.response?.data?.message || "مشکلی در ارسال کد پیش آمده است.",
        variant: "destructive",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  finalLogin: async (loginType, data, onSuccess) => {
    set({ isLoading: true });
    const phone = get().phone;
    const result = await signIn("credentials", {
      redirect: false,
      phone,
      password: data.password,
      otp: data.otp,
      loginType,
    });
    set({ isLoading: false });

    if (result?.error) {
      toast({
        title: "ورود ناموفق",
        description: result.error,
        variant: "destructive",
      });
    } else if (result?.ok) {
      toast({ title: "خوش آمدید!" });
      onSuccess();
    }
  },

  requestPasswordReset: async () => {
    set({ isLoading: true });
    const phone = get().phone;
    try {
      // ++ ADDED: Call Arcjet action before proceeding
      const protection = await protectPhoneAuthAction(phone);
      if (!protection.success) {
        toast({
          title: "خطا",
          description: protection.error,
          variant: "destructive",
        });
        return;
      }

      await axiosPublic.post("/auth/forgot-password", { phone });
      toast({ title: "کد بازنشانی رمز عبور برای شما ارسال شد." });
      set({ step: "forgot-password-reset" });
    } catch (error: any) {
      toast({
        title: "خطا",
        description:
          error.response?.data?.message || "کاربری با این شماره یافت نشد.",
        variant: "destructive",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (otp, password) => {
    set({ isLoading: true });
    try {
      await axiosPublic.post("/auth/reset-password", {
        phone: get().phone,
        otp,
        password,
      });
      toast({ title: "رمز عبور شما با موفقیت تغییر کرد." });
      set({ step: "phone", phone: "" }); // Reset to initial state
      return true;
    } catch (error: any) {
      toast({
        title: "خطا",
        description:
          error.response?.data?.message || "بازنشانی رمز عبور ناموفق بود.",
        variant: "destructive",
      });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));

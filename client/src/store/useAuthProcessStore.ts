import { create } from "zustand";
import { axiosPublic } from "@/lib/axios";
import axiosAuth from "@/lib/axios"; // axiosAuth برای ارسال‌های نیازمند توکن
import { toast } from "@/hooks/use-toast";
import { signIn, getSession, signOut } from "next-auth/react";
import { protectPhoneAuthAction } from "@/actions/auth";
import { useCartStore } from "./useCartStore";

// یک مرحله جدید برای اجبار به تعیین رمز عبور اضافه می‌شود
type AuthStep =
  | "phone"
  | "password"
  | "otp"
  | "forgot-password-phone"
  | "forgot-password-reset"
  | "force-password-setup"; // <-- مرحله جدید

interface AuthState {
  step: AuthStep;
  phone: string;
  isLoading: boolean;
  userHasPassword: boolean;
  setStep: (step: AuthStep) => void;
  setPhone: (phone: string) => void;
  checkPhone: (phone: string, forceOtp?: boolean) => Promise<void>;
  finalLogin: (
    loginType: "password" | "otp",
    data: { password?: string; otp?: string },
    onSuccess: () => void
  ) => Promise<void>;
  requestPasswordReset: () => Promise<void>;
  resetPassword: (otp: string, password: string) => Promise<boolean>;
  // تابع جدید برای تنظیم رمز عبور اجباری
  setPasswordAndFinalize: (
    password: string,
    onSuccess: () => void
  ) => Promise<void>;
}

export const useAuthProcessStore = create<AuthState>((set, get) => ({
  step: "phone",
  phone: "",
  isLoading: false,
  userHasPassword: false,
  setStep: (step) => set({ step }),
  setPhone: (phone) => set({ phone }),

  checkPhone: async (phone, forceOtp = false) => {
    set({ isLoading: true, phone });
    try {
      const protection = await protectPhoneAuthAction(phone);
      if (!protection.success) {
        toast({
          title: "خطا",
          description: protection.error,
          variant: "destructive",
        });
        return;
      }

      const response = await axiosPublic.post(`/auth/check-phone`, {
        phone,
        forceOtp,
      });
      if (response.data.success) {
        const { hasPassword } = response.data;

        // *** تغییر کلیدی ۳: منطق جدید برای مدیریت step ***
        if (forceOtp) {
          // اگر ارسال OTP اجباری بود، همیشه به صفحه OTP برو
          set({ userHasPassword: hasPassword, step: "otp" });
          toast({ title: "کد یکبار مصرف با موفقیت ارسال شد." });
        } else {
          // در غیر این صورت، از منطق قبلی استفاده کن
          set({
            userHasPassword: hasPassword,
            step: hasPassword ? "password" : "otp",
          });
          if (!hasPassword) {
            toast({ title: "کد یکبار مصرف با موفقیت ارسال شد." });
          }
        }
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

    if (result?.error) {
      toast({
        title: "ورود ناموفق",
        description: result.error,
        variant: "destructive",
      });
      set({ isLoading: false });
    } else if (result?.ok) {
      toast({ title: "خوش آمدید!" });

      // دریافت سشن جدید برای بررسی وضعیت کاربر
      const session = await getSession();

      // ✅ لاجیک جدید: اگر کاربر نیاز به تعیین رمز دارد، در همین فرم بماند
      // @ts-ignore
      if (session?.user?.requiresPasswordSetup) {
        set({ step: "force-password-setup", isLoading: false });
        // مودال بسته نمی‌شود، فقط مرحله عوض می‌شود
      } else {
        // اگر کاربر قدیمی است و رمز دارد، کار تمام است
        await useCartStore.getState().fetchCart();
        onSuccess(); // فرم بسته می‌شود یا ریدارکت می‌شود
        set({ isLoading: false });
      }
    }
  },

  // تابع جدید برای تنظیم رمز عبور و نهایی کردن ورود
  setPasswordAndFinalize: async (password, onSuccess) => {
    set({ isLoading: true });
    try {
      // این درخواست با توکن موقت کاربر ارسال می‌شود
      await axiosAuth.post("/auth/set-password", { password });

      // پس از تنظیم رمز، سشن را آپدیت می‌کنیم تا فلگ requiresPasswordSetup حذف شود
      await getSession({ broadcast: true });

      toast({ title: "رمز عبور با موفقیت تنظیم شد. خوش آمدید!" });
      await useCartStore.getState().fetchCart();
      onSuccess(); // اجرای کامل ورود
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.response?.data?.message || "خطا در تنظیم رمز عبور.",
        variant: "destructive",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  requestPasswordReset: async () => {
    set({ isLoading: true });
    const phone = get().phone;
    try {
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
      set({ step: "phone", phone: "" });
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

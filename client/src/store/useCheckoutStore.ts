// client/src/store/useCheckoutStore.ts

import { create } from "zustand";

// تعریف ساختار اطلاعاتی برای همخوانی با سرور و کامپوننت نمایش
interface ShippingMethod {
  id: string;
  code: string; // این فیلد برای ارسال به سرور لازم است
  name: string;
  description: string | null; // این فیلد از سرور می‌آید
  cost: number;
}

// تعریف وضعیت‌ها و اکشن‌های مربوط به پرداخت
interface CheckoutState {
  shippingMethod: ShippingMethod | null;
  setShippingMethod: (method: ShippingMethod) => void;
}

// ایجاد store
export const useCheckoutStore = create<CheckoutState>((set) => ({
  shippingMethod: null, // در ابتدا هیچ روشی انتخاب نشده
  setShippingMethod: (method) => set({ shippingMethod: method }), // تابعی برای به‌روزرسانی روش ارسال
}));

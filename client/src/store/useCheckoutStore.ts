import { create } from "zustand";

interface ShippingMethod {
  id: string;
  code: string;
  name: string;
  description: string | null;
  cost: number;
}

export type PaymentMethodType = "CREDIT_CARD" | "CARD_TO_CARD";

interface CheckoutState {
  shippingMethod: ShippingMethod | null;
  setShippingMethod: (method: ShippingMethod) => void;

  // ✅ اضافه شده‌ها
  paymentMethod: PaymentMethodType;
  setPaymentMethod: (method: PaymentMethodType) => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  shippingMethod: null,
  setShippingMethod: (method) => set({ shippingMethod: method }),
  paymentMethod: "CREDIT_CARD",
  setPaymentMethod: (method) => set({ paymentMethod: method }),
}));

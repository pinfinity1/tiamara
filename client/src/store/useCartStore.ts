// client/src/store/useCartStore.ts

import { create } from "zustand";
import axiosAuth from "@/lib/axios";
import { useUserStore } from "./useUserStore";
import { toast } from "@/hooks/use-toast";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  original_price: number;
  price: number;
  image: string;
  quantity: number;
  slug: string;
  stock: number;
}

interface CartState {
  items: CartItem[];
  cartId: string | null;
  isLoading: boolean;
  error: string | null; // ✅  ویژگی `error` به اینترفیس اضافه شد
  initializeCart: () => Promise<void>;
  addToCart: (
    product: Omit<CartItem, "id" | "original_price">
  ) => Promise<void>;
  updateCartItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  mergeCartsOnLogin: () => Promise<void>;
  setItems: (items: CartItem[]) => void;
}

const getGuestCartId = () =>
  typeof window !== "undefined" ? localStorage.getItem("guestCartId") : null;
const setGuestCartId = (id: string) =>
  typeof window !== "undefined"
    ? localStorage.setItem("guestCartId", id)
    : null;
const removeGuestCartId = () =>
  typeof window !== "undefined" ? localStorage.removeItem("guestCartId") : null;

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  cartId: null,
  isLoading: false,
  error: null, // ✅ مقداردهی اولیه برای `error`

  setItems: (items) => set({ items }),

  initializeCart: async () => {
    set({ isLoading: true, error: null }); // ✅ ریست کردن خطا در ابتدای هر درخواست

    const isLoggedIn = !!useUserStore.getState().userProfile;
    const guestCartId = getGuestCartId();
    const url = isLoggedIn
      ? "/cart/fetch-cart"
      : `/cart/fetch-cart?guestCartId=${guestCartId || ""}`;

    try {
      const response = await axiosAuth.get(url);
      const { data: items, cartId } = response.data;
      set({ items, cartId });
      if (!isLoggedIn && cartId) {
        setGuestCartId(cartId);
      }
    } catch (error) {
      const errorMessage = "خطا در بارگذاری سبد خرید.";
      console.error(errorMessage, error);
      set({ error: errorMessage }); // ✅ ثبت خطا در استیت
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (product) => {
    try {
      // ✅ با فراخوانی `initializeCart`، دیگر نیازی به منطق پیچیده در اینجا نیست
      await axiosAuth.post("/cart/add", {
        ...product,
        guestCartId: getGuestCartId(),
      });
      await get().initializeCart(); // ✅ پس از افزودن، کل سبد را مجددا از سرور میخوانیم تا همگام شود
      toast({ title: "محصول به سبد خرید اضافه شد." });
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast({
        title: "خطا در افزودن محصول",
        variant: "destructive",
      });
    }
  },

  updateCartItemQuantity: async (itemId, quantity) => {
    const originalItems = get().items;

    // Optimistic UI update
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item
      ),
    }));

    if (quantity === 0) {
      get().removeFromCart(itemId);
      return;
    }

    try {
      await axiosAuth.put(`/cart/update/${itemId}`, {
        quantity,
        guestCartId: getGuestCartId(),
      });
    } catch (error: any) {
      // Revert UI on error
      set({ items: originalItems });
      const stock = error.response?.data?.stock;
      if (stock !== undefined) {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity: stock } : item
          ),
        }));
      }
      toast({
        title: "موجودی محصول کافی نیست.",
        variant: "destructive",
      });
    }
  },

  removeFromCart: async (itemId: string) => {
    const originalItems = get().items;
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    }));
    try {
      const guestCartId = getGuestCartId();
      const url = `/cart/remove/${itemId}${
        guestCartId ? `?guestCartId=${guestCartId}` : ""
      }`;
      await axiosAuth.delete(url);
      toast({
        title: "محصول از سبد خرید حذف شد.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Failed to remove item:", error);
      set({ items: originalItems }); // ✅ بازگرداندن به حالت قبل در صورت خطا
    }
  },

  clearCart: async () => {
    set({ items: [] });
    try {
      await axiosAuth.post("/cart/clear", { guestCartId: getGuestCartId() });
    } catch (error) {
      console.error("Failed to clear cart:", error);
      await get().initializeCart(); // ✅ در صورت خطا، سبد را مجددا از سرور بخوان
    }
  },

  mergeCartsOnLogin: async () => {
    const guestCartId = getGuestCartId();
    if (!guestCartId) return;
    try {
      await axiosAuth.post("/cart/merge", { guestCartId });
      removeGuestCartId();
      await get().initializeCart();
    } catch (error) {
      console.error("Failed to merge carts:", error);
    }
  },
}));

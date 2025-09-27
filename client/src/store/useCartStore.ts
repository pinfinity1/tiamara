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
  error: string | null;
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
  error: null,

  setItems: (items) => set({ items }),

  initializeCart: async () => {
    // برای جلوگیری از درخواست‌های تکراری، در ابتدای لود صفحه، isLoading را true می‌کنیم
    set({ isLoading: true, error: null });

    const isLoggedIn = !!useUserStore.getState().userProfile;
    const guestCartId = getGuestCartId();
    const url = isLoggedIn
      ? "/cart/fetch-cart"
      : `/cart/fetch-cart?guestCartId=${guestCartId || ""}`;

    try {
      const response = await axiosAuth.get(url);
      const { data: items, cartId } = response.data;
      set({ items, cartId, isLoading: false });
      if (!isLoggedIn && cartId) {
        setGuestCartId(cartId);
      }
    } catch (error) {
      const errorMessage = "خطا در بارگذاری سبد خرید.";
      console.error(errorMessage, error);
      set({ error: errorMessage, isLoading: false });
    }
  },

  addToCart: async (product) => {
    const { items, updateCartItemQuantity, initializeCart } = get();
    const existingItem = items.find(
      (item) => item.productId === product.productId
    );

    // اگر محصول از قبل وجود دارد، فقط تعداد آن را زیاد می‌کنیم
    if (existingItem) {
      await updateCartItemQuantity(existingItem.id, existingItem.quantity + 1);
      return;
    }

    // در غیر این صورت، محصول جدید را اضافه می‌کنیم
    set({ isLoading: true });
    try {
      await axiosAuth.post("/cart/add", {
        ...product,
        guestCartId: getGuestCartId(),
      });
      // **نکته کلیدی:** پس از موفقیت، کل سبد خرید را مجدداً از سرور می‌خوانیم
      await initializeCart();
      toast({ title: "محصول به سبد خرید اضافه شد." });
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast({
        title: "خطا در افزودن محصول",
        variant: "destructive",
      });
      // در صورت خطا، isLoading را false می‌کنیم
      set({ isLoading: false });
    }
  },

  updateCartItemQuantity: async (itemId, quantity) => {
    // اگر تعداد به صفر برسد، آیتم را حذف می‌کنیم
    if (quantity === 0) {
      await get().removeFromCart(itemId);
      return;
    }

    set({ isLoading: true });
    try {
      await axiosAuth.put(`/cart/update/${itemId}`, {
        quantity,
        guestCartId: getGuestCartId(),
      });
      // **نکته کلیدی:** پس از موفقیت، کل سبد خرید را مجدداً از سرور می‌خوانیم
      await get().initializeCart();
    } catch (error: any) {
      toast({
        title: "موجودی محصول کافی نیست.",
        variant: "destructive",
      });
      // در صورت خطا نیز سبد خرید را مجدداً می‌خوانیم تا به حالت صحیح برگردد
      await get().initializeCart();
    }
  },

  removeFromCart: async (itemId: string) => {
    set({ isLoading: true });
    try {
      const guestCartId = getGuestCartId();
      const url = `/cart/remove/${itemId}${
        guestCartId ? `?guestCartId=${guestCartId}` : ""
      }`;
      await axiosAuth.delete(url);
      // **نکته کلیدی:** پس از موفقیت، کل سبد خرید را مجدداً از سرور می‌خوانیم
      await get().initializeCart();
      toast({
        title: "محصول از سبد خرید حذف شد.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Failed to remove item:", error);
      // در صورت خطا نیز سبد خرید را مجدداً می‌خوانیم
      await get().initializeCart();
    }
  },

  clearCart: async () => {
    set({ items: [] });
    try {
      await axiosAuth.post("/cart/clear", { guestCartId: getGuestCartId() });
    } catch (error) {
      console.error("Failed to clear cart:", error);
      await get().initializeCart();
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

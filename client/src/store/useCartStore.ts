// client/src/store/useCartStore.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axiosAuth, { axiosPublic } from "@/lib/axios";
import { toast } from "@/hooks/use-toast";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (item: Omit<CartItem, "id">) => Promise<void>;
  updateCartItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  clearLocalCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosPublic.get("/cart");
      const fetchedItems = response.data.cart.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.discount_price || item.product.price,
        quantity: item.quantity,
        image: item.product.images[0]?.url || "/images/placeholder.png",
        stock: item.product.stock,
      }));
      set({ items: fetchedItems, isLoading: false });
    } catch (error) {
      set({ error: "Failed to fetch cart.", isLoading: false });
    }
  },

  addToCart: async (item) => {
    set({ isLoading: true });
    try {
      await axiosPublic.post("/cart/add", {
        productId: item.productId,
        quantity: item.quantity,
      });
      await get().fetchCart();
    } catch (error) {
      toast({ title: "خطا در افزودن به سبد", variant: "destructive" });
    } finally {
      set({ isLoading: false });
    }
  },

  updateCartItemQuantity: async (itemId, quantity) => {
    set({ isLoading: true });
    try {
      await axiosPublic.put(`/cart/item/${itemId}`, { quantity });
      await get().fetchCart();
    } catch (error) {
      toast({ title: "خطا در آپدیت سبد", variant: "destructive" });
    } finally {
      set({ isLoading: false });
    }
  },

  removeFromCart: async (itemId) => {
    set({ isLoading: true });
    try {
      await axiosPublic.delete(`/cart/item/${itemId}`);
      await get().fetchCart();
    } catch (error) {
      toast({ title: "خطا در حذف از سبد", variant: "destructive" });
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: async () => {
    set({ isLoading: true });
    try {
      await axiosPublic.delete("/cart/clear");
      set({ items: [], isLoading: false });
    } catch (error) {
      toast({ title: "خطا در پاک کردن سبد", variant: "destructive" });
      set({ isLoading: false });
    }
  },

  clearLocalCart: () => {
    set({ items: [], isLoading: false, error: null });
  },
}));

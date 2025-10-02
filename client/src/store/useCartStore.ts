// client/src/store/useCartStore.ts

import { create } from "zustand";
import axiosAuth from "@/lib/axios";
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
      const response = await axiosAuth.get("/cart");
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
    const existingItem = get().items.find(
      (i) => i.productId === item.productId
    );

    if (existingItem) {
      // If item already exists, just update the quantity
      get().updateCartItemQuantity(existingItem.id, existingItem.quantity + 1);
      return;
    }

    // Optimistically add the new item
    const tempId = `temp-${Date.now()}`;
    const newItem = { ...item, id: tempId };
    set((state) => ({ items: [...state.items, newItem] }));

    try {
      await axiosAuth.post("/cart/add", {
        productId: item.productId,
        quantity: item.quantity,
      });
      // Re-fetch to get the real ID and confirm
      await get().fetchCart();
    } catch (error) {
      toast({ title: "خطا در افزودن به سبد", variant: "destructive" });
      // Revert on error
      set((state) => ({
        items: state.items.filter((i) => i.id !== tempId),
      }));
    }
  },

  updateCartItemQuantity: async (itemId, quantity) => {
    const originalItems = get().items;
    const itemToUpdate = originalItems.find((item) => item.id === itemId);

    if (!itemToUpdate || quantity < 1 || quantity > itemToUpdate.stock) {
      return;
    }

    // Optimistic update
    const newItems = originalItems.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );
    set({ items: newItems });

    try {
      await axiosAuth.put(`/cart/item/${itemId}`, { quantity });
      // No re-fetch needed on success, the local state is already correct
    } catch (error) {
      toast({ title: "خطا در آپدیت سبد", variant: "destructive" });
      // Revert on error
      set({ items: originalItems });
    }
  },

  removeFromCart: async (itemId: string) => {
    const originalItems = get().items;

    // Optimistic update
    const newItems = originalItems.filter((item) => item.id !== itemId);
    set({ items: newItems });

    try {
      await axiosAuth.delete(`/cart/item/${itemId}`);
      // No re-fetch needed
    } catch (error) {
      toast({ title: "خطا در حذف از سبد", variant: "destructive" });
      // Revert on error
      set({ items: originalItems });
    }
  },

  clearCart: async () => {
    const originalItems = get().items;
    set({ items: [] });
    try {
      await axiosAuth.delete("/cart/clear");
    } catch (error) {
      toast({ title: "خطا در پاک کردن سبد", variant: "destructive" });
      set({ items: originalItems });
    }
  },

  clearLocalCart: () => {
    set({ items: [], isLoading: false, error: null });
  },
}));

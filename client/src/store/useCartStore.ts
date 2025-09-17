import { create } from "zustand";
import axiosAuth from "@/lib/axios";
import { useUserStore } from "./useUserStore";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  cartId: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  initializeCart: () => Promise<void>;
  addToCart: (product: Omit<CartItem, "id">) => Promise<void>;
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
  isInitialized: false,

  setItems: (items) => set({ items }),

  initializeCart: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });

    const isLoggedIn = !!useUserStore.getState().userProfile;
    const guestCartId = getGuestCartId();
    const url = isLoggedIn
      ? "/cart/fetch-cart"
      : `/cart/fetch-cart?guestCartId=${guestCartId || ""}`;

    try {
      const response = await axiosAuth.get(url);
      const { data: items, cartId } = response.data;
      set({ items, cartId, isInitialized: true });
      if (!isLoggedIn && cartId) {
        setGuestCartId(cartId);
      }
    } catch (error) {
      console.error("Failed to initialize cart:", error);
    } finally {
      // این بخش اطمینان می‌دهد که isLoading همیشه به false تغییر می‌کند
      // و مهم‌تر از آن، isInitialized همیشه به true تنظیم می‌شود تا از حلقه بی‌نهایت جلوگیری شود.
      set({ isLoading: false, isInitialized: true });
    }
  },

  addToCart: async (product) => {
    try {
      const response = await axiosAuth.post("/cart/add", {
        ...product,
        guestCartId: getGuestCartId(),
      });
      const { data: newItem, cartId } = response.data;

      set((state) => {
        const existingItemIndex = state.items.findIndex(
          (i) => i.productId === newItem.productId
        );
        if (existingItemIndex > -1) {
          const newItems = [...state.items];
          newItems[existingItemIndex] = newItem;
          return { items: newItems };
        }
        return { items: [...state.items, newItem] };
      });

      if (!useUserStore.getState().userProfile) {
        setGuestCartId(cartId);
      }
      set({ cartId });
      useToast().toast({ title: "محصول به سبد خرید اضافه شد." });
    } catch (error) {
      console.error("Failed to add to cart:", error);
      useToast().toast({
        title: "خطا در افزودن محصول",
        variant: "destructive",
      });
    }
  },

  updateCartItemQuantity: async (itemId, quantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    }));
    try {
      await axiosAuth.put(`/cart/update/${itemId}`, {
        quantity,
        guestCartId: getGuestCartId(),
      });
    } catch (error) {
      console.error("Failed to update quantity:", error);
      get().initializeCart(); // Re-sync with server on error
    }
  },

  removeFromCart: async (itemId: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    }));
    try {
      const guestCartId = getGuestCartId();
      const url = `/cart/remove/${itemId}${
        guestCartId ? `?guestCartId=${guestCartId}` : ""
      }`;
      await axiosAuth.delete(url);
      useToast().toast({
        title: "محصول از سبد خرید حذف شد.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Failed to remove item:", error);
      get().initializeCart();
    }
  },

  clearCart: async () => {
    set({ items: [] });
    try {
      await axiosAuth.post("/cart/clear", { guestCartId: getGuestCartId() });
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  },

  mergeCartsOnLogin: async () => {
    const guestCartId = getGuestCartId();
    if (!guestCartId) return;
    try {
      await axiosAuth.post("/cart/merge", { guestCartId });
      removeGuestCartId();
      // Force a full re-initialization to get the merged cart
      set({ isInitialized: false });
      await get().initializeCart();
    } catch (error) {
      console.error("Failed to merge carts:", error);
    }
  },
}));

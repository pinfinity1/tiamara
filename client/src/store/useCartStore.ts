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
  isInitialized: boolean;
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
  isInitialized: false,

  setItems: (items) => set({ items }),

  initializeCart: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true, error: null });

    const isLoggedIn = !!useUserStore.getState().userProfile;
    const guestCartId = getGuestCartId();
    const url = isLoggedIn
      ? "/cart/fetch-cart"
      : `/cart/fetch-cart?guestCartId=${guestCartId || ""}`;

    try {
      const response = await axiosAuth.get(url);
      const { data: items, cartId } = response.data;
      set({ items, cartId, isLoading: false, isInitialized: true });
      if (!isLoggedIn && cartId) {
        setGuestCartId(cartId);
      }
    } catch (error) {
      const errorMessage = "خطا در بارگذاری سبد خرید.";
      console.error(errorMessage, error);
      set({ error: errorMessage, isLoading: false, isInitialized: true });
    }
  },

  addToCart: async (product) => {
    const { items, updateCartItemQuantity } = get();
    const existingItem = items.find(
      (item) => item.productId === product.productId
    );

    if (existingItem) {
      await updateCartItemQuantity(existingItem.id, existingItem.quantity + 1);
      return;
    }

    set({ isLoading: true });
    try {
      const response = await axiosAuth.post("/cart/add", {
        ...product,
        guestCartId: getGuestCartId(),
      });
      if (response.data.success) {
        const newItem = response.data.data;
        set((state) => ({
          items: [...state.items, newItem],
          cartId: response.data.cartId,
          isLoading: false,
        }));
        if (!useUserStore.getState().userProfile && response.data.cartId) {
          setGuestCartId(response.data.cartId);
        }
        toast({ title: "محصول به سبد خرید اضافه شد." });
      } else {
        throw new Error("Failed to add product");
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast({
        title: "خطا در افزودن محصول",
        variant: "destructive",
      });
      set({ isLoading: false });
    }
  },

  updateCartItemQuantity: async (itemId, quantity) => {
    if (quantity === 0) {
      await get().removeFromCart(itemId);
      return;
    }

    const originalItems = get().items;
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    }));

    try {
      const response = await axiosAuth.put(`/cart/update/${itemId}`, {
        quantity,
        guestCartId: getGuestCartId(),
      });
      if (!response.data.success) {
        set({ items: originalItems });
      }
    } catch (error: any) {
      toast({
        title: "موجودی محصول کافی نیست.",
        variant: "destructive",
      });
      set({ items: originalItems });
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
      set({ items: originalItems });
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
      set({ isInitialized: false }); // برای فراخوانی مجدد و به‌روزرسانی سبد خرید
      await get().initializeCart();
    } catch (error) {
      console.error("Failed to merge carts:", error);
    }
  },
}));

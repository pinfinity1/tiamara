import { create } from "zustand";
import axiosAuth, { axiosPublic } from "@/lib/axios";
import { toast } from "@/hooks/use-toast";
import { getSession } from "next-auth/react";

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

  initializeCart: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true, error: null });

    const session = await getSession();
    const isLoggedIn = !!session?.user;
    const guestCartId = getGuestCartId();

    // از axiosAuth استفاده می‌کنیم که توکن را در صورت وجود ارسال کند
    const url = `/cart/fetch-cart${
      !isLoggedIn && guestCartId ? `?guestCartId=${guestCartId}` : ""
    }`;

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
      if (existingItem.quantity < product.stock) {
        await updateCartItemQuantity(
          existingItem.id,
          existingItem.quantity + 1
        );
      } else {
        toast({ title: "موجودی محصول کافی نیست.", variant: "destructive" });
      }
      return;
    }

    set({ isLoading: true });
    try {
      const session = await getSession();
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
        if (!session?.user && response.data.cartId) {
          setGuestCartId(response.data.cartId);
        }
        toast({ title: "محصول به سبد خرید اضافه شد." });
      } else {
        throw new Error(response.data.message || "Failed to add product");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "خطا در افزودن محصول";
      toast({
        title: errorMessage,
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
    const itemToUpdate = originalItems.find((item) => item.id === itemId);
    if (itemToUpdate && quantity > itemToUpdate.stock) {
      toast({ title: "موجودی محصول کافی نیست.", variant: "destructive" });
      return;
    }

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
        // بازگرداندن به حالت قبل در صورت خطا
        set({ items: originalItems });
      }
    } catch (error: any) {
      toast({
        title: error.response?.data?.message || "خطا در به‌روزرسانی",
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
      // در صورت خطا، سبد خرید را از سرور مجدداً بارگذاری می‌کنیم
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

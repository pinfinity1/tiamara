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
  pendingItemIds: Set<string>;
  fetchCart: () => Promise<void>;
  addToCart: (item: Omit<CartItem, "id">) => Promise<void>;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  clearLocalCart: () => void;
}

const debounceTimers = new Map<string, NodeJS.Timeout>();

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  pendingItemIds: new Set<string>(),

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
      set({ error: "Failed to fetch cart", isLoading: false });
    }
  },

  addToCart: async (item) => {
    const existingItem = get().items.find(
      (i) => i.productId === item.productId
    );

    if (existingItem) {
      get().updateCartItemQuantity(existingItem.id, existingItem.quantity + 1);
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const newItem = { ...item, id: tempId };
    set((state) => ({ items: [...state.items, newItem] }));

    try {
      await axiosAuth.post("/cart/add", {
        productId: item.productId,
        quantity: item.quantity,
      });
      await get().fetchCart();
    } catch (error) {
      toast({ title: "خطا در افزودن به سبد", variant: "destructive" });
      set((state) => ({ items: state.items.filter((i) => i.id !== tempId) }));
    }
  },

  updateCartItemQuantity: (itemId, quantity) => {
    const originalItems = get().items;
    const itemToUpdate = originalItems.find((item) => item.id === itemId);

    if (!itemToUpdate || quantity < 1 || quantity > itemToUpdate.stock) return;

    // 1. آپدیت فوری UI
    const newItems = originalItems.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );
    set({ items: newItems });

    // 2. افزودن به لیست انتظار
    set((state) => ({
      pendingItemIds: new Set(state.pendingItemIds).add(itemId),
    }));

    // 3. مدیریت تایمر
    if (debounceTimers.has(itemId)) clearTimeout(debounceTimers.get(itemId)!);

    const newTimer = setTimeout(async () => {
      try {
        await axiosAuth.put(`/cart/item/${itemId}`, { quantity });
      } catch (error) {
        // 🛑 FIX مهم: بررسی وضعیت آیتم قبل از بازگردانی
        // اگر آیتم در حین ارسال درخواست توسط کاربر حذف شده باشد، نباید آن را برگردانیم.
        const isItemStillInCart = get().items.some((i) => i.id === itemId);

        if (!isItemStillInCart) {
          // کاربر آیتم را حذف کرده، پس خطای آپدیت مهم نیست. نادیده بگیر.
          return;
        }

        toast({ title: "خطا در آپدیت سبد", variant: "destructive" });
        set({ items: originalItems });
      } finally {
        set((state) => {
          const newSet = new Set(state.pendingItemIds);
          newSet.delete(itemId);
          return { pendingItemIds: newSet };
        });
        debounceTimers.delete(itemId);
      }
    }, 700);

    debounceTimers.set(itemId, newTimer);
  },

  removeFromCart: async (itemId: string) => {
    // 1. کنسل کردن هرگونه تایمر آپدیت فعال برای این آیتم
    // این یعنی اگر کاربر سریع روی (-) و بعد (حذف) زد، درخواست آپدیت اصلا ارسال نمی‌شود.
    if (debounceTimers.has(itemId)) {
      clearTimeout(debounceTimers.get(itemId)!);
      debounceTimers.delete(itemId);
    }

    const originalItems = get().items;

    // 2. حذف فوری از UI
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
      // آیتم را از لیست pending هم حذف می‌کنیم تا UI قفل نماند
      pendingItemIds: new Set(
        [...state.pendingItemIds].filter((id) => id !== itemId)
      ),
    }));

    try {
      await axiosAuth.delete(`/cart/item/${itemId}`);
    } catch (error) {
      toast({ title: "خطا در حذف از سبد", variant: "destructive" });
      // فقط در صورت خطای واقعی حذف، آیتم را برگردان
      set({ items: originalItems });
    }
  },

  clearCart: async () => {
    debounceTimers.forEach((timer) => clearTimeout(timer));
    debounceTimers.clear();

    const originalItems = get().items;
    set({ items: [], pendingItemIds: new Set() });

    try {
      await axiosAuth.delete("/cart/clear");
    } catch (error) {
      toast({ title: "خطا در پاک کردن سبد", variant: "destructive" });
      set({ items: originalItems });
    }
  },

  clearLocalCart: () => {
    debounceTimers.forEach((timer) => clearTimeout(timer));
    debounceTimers.clear();
    set({
      items: [],
      isLoading: false,
      error: null,
      pendingItemIds: new Set(),
    });
  },
}));

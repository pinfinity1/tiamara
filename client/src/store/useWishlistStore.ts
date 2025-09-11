import { create } from "zustand";
import axiosAuth from "@/lib/axios";

interface WishlistState {
  wishlistItems: string[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlistItem: (
    productId: string
  ) => Promise<"added" | "removed" | null>;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlistItems: [],
  isLoading: false,

  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosAuth.get("/wishlist");
      if (response.data.success) {
        set({ wishlistItems: response.data.wishlist, isLoading: false });
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
      set({ isLoading: false });
    }
  },

  toggleWishlistItem: async (productId: string) => {
    const originalItems = get().wishlistItems;

    const isCurrentlyWishlisted = get().isWishlisted(productId);
    const newItems = isCurrentlyWishlisted
      ? originalItems.filter((id) => id !== productId)
      : [...originalItems, productId];
    set({ wishlistItems: newItems });

    try {
      const response = await axiosAuth.post("/wishlist/toggle", { productId });
      if (response.data.success) {
        return response.data.action;
      }
      throw new Error("Failed to toggle wishlist item");
    } catch (error) {
      console.error("Failed to toggle wishlist item:", error);
      set({ wishlistItems: originalItems });
      return null;
    }
  },

  isWishlisted: (productId: string) => {
    return get().wishlistItems.includes(productId);
  },

  clearWishlist: () => {
    set({ wishlistItems: [] });
  },
}));

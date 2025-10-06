import { create } from "zustand";
import type { Product } from "@/components/layout/home/VideoCarousel/ProductCard";

interface ProductModalStore {
  product: Product | null;
  isOpen: boolean;
  onOpen: (product: Product) => void;
  onClose: () => void;
}

export const useProductModalStore = create<ProductModalStore>((set) => ({
  product: null,
  isOpen: false,
  onOpen: (product) => set({ isOpen: true, product }),
  onClose: () => set({ isOpen: false, product: null }),
}));

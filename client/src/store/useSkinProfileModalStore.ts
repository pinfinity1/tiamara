import { create } from "zustand";

interface SkinProfileModalState {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useSkinProfileModalStore = create<SkinProfileModalState>(
  (set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
  })
);

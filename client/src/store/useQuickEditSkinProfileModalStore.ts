// project/client/src/store/useQuickEditSkinProfileModalStore.ts
import { create } from "zustand";

interface QuickEditSkinProfileModalState {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useQuickEditSkinProfileModalStore =
  create<QuickEditSkinProfileModalState>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
  }));

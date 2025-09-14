import { create } from "zustand";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
}

interface ChatState {
  isOpen: boolean;
  isExpanded: boolean;
  messages: Message[];
  openChat: () => void;
  closeChat: () => void;
  toggleExpanded: () => void;
  addMessage: (message: Message) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  isExpanded: false,
  messages: [],
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
}));

// client/src/store/useChatStore.ts

import { create } from "zustand";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
}

type ViewMode = "closed" | "widget" | "half";

interface ChatState {
  viewMode: ViewMode;
  messages: Message[];
  setViewMode: (mode: ViewMode) => void;
  addMessage: (message: Message) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  viewMode: "closed",
  messages: [],
  setViewMode: (mode) => set({ viewMode: mode }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
}));

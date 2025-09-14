// client/src/store/useChatStore.ts

import { create } from "zustand";
import axiosAuth from "@/lib/axios";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
}

type ViewMode = "closed" | "widget" | "half";

interface ChatState {
  viewMode: ViewMode;
  messages: Message[];
  isLoading: boolean;
  setViewMode: (mode: ViewMode) => void;
  addMessage: (message: Message) => void;
  sendMessage: (messageText: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  viewMode: "closed",
  messages: [],
  isLoading: false,
  setViewMode: (mode) => set({ viewMode: mode }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  sendMessage: async (messageText) => {
    set({ isLoading: true });
    try {
      const response = await axiosAuth.post("/ai/chat", {
        message: messageText,
      });
      const aiMessage = {
        id: Date.now().toString(),
        text: response.data.reply,
        sender: "ai" as const,
      };
      get().addMessage(aiMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: Date.now().toString(),
        text: "متاسفانه خطایی رخ داد. لطفا دوباره تلاش کنید.",
        sender: "ai" as const,
      };
      get().addMessage(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },
}));

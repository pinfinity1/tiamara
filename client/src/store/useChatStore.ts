import { create } from "zustand";
import axiosAuth from "@/lib/axios";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  suggestions?: string[];
}

type ViewMode = "closed" | "widget" | "half";

interface ChatState {
  viewMode: ViewMode;
  messages: Message[];
  isLoading: boolean;
  setViewMode: (mode: ViewMode) => void;
  addMessage: (message: Message) => void;
  sendMessage: (messageText: string) => Promise<void>;
  sendSuggestion: (suggestionText: string) => void;
}

const initialWelcomeMessage: Message = {
  id: "initial-welcome",
  sender: "ai",
  text: "سلام! من تیام، دستیار هوشمند شما در تیامارا هستم. چطور می‌تونم کمکتون کنم؟",
  suggestions: [
    "به من محصول پیشنهاد بده",
    "در مورد یک مشکل پوستی سوال دارم",
    "پیگیری سفارشات",
  ],
};

export const useChatStore = create<ChatState>((set, get) => ({
  viewMode: "closed",
  messages: [initialWelcomeMessage],
  isLoading: false,
  setViewMode: (mode) => set({ viewMode: mode }),
  addMessage: (message) =>
    set((state) => {
      const newMessages = state.messages.map((m) =>
        m.id === "initial-welcome" ? { ...m, suggestions: [] } : m
      );
      return { messages: [...newMessages, message] };
    }),

  sendMessage: async (messageText) => {
    set({ isLoading: true });
    set((state) => ({
      messages: state.messages.map((m) => ({ ...m, suggestions: [] })),
    }));

    const currentMessages = get().messages;

    try {
      const response = await axiosAuth.post("/ai/chat", {
        message: messageText,
        messages: currentMessages.slice(0, -1),
      });

      const aiReply = response.data.reply;
      let aiMessage: Message;

      try {
        const parsedReply = JSON.parse(aiReply);
        aiMessage = {
          id: Date.now().toString(),
          text: parsedReply.response,
          sender: "ai" as const,
          suggestions: parsedReply.suggestions || [],
        };
      } catch (e) {
        aiMessage = {
          id: Date.now().toString(),
          text: aiReply,
          sender: "ai" as const,
          suggestions: [],
        };
      }

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

  sendSuggestion: (suggestionText: string) => {
    set((state) => ({
      messages: state.messages.map((m) => ({ ...m, suggestions: [] })),
    }));

    const userMessage = {
      id: (Date.now() + 1).toString(),
      text: suggestionText,
      sender: "user" as const,
    };
    get().addMessage(userMessage);
    get().sendMessage(suggestionText);
  },
}));

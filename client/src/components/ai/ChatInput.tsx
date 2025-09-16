// client/src/components/ai/ChatInput.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
// آیکون Wand2 (عصای جادویی) را برای دکمه پیشنهاد اضافه می‌کنیم
import { SendHorizonal, Wand2 } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import TextareaAutosize from "react-textarea-autosize";

export default function ChatInput() {
  const [input, setInput] = useState("");
  // تابع sendSuggestion را از استور دریافت می‌کنیم
  const { addMessage, sendMessage, isLoading, sendSuggestion } = useChatStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: input,
      sender: "user" as const,
    };
    addMessage(userMessage);
    sendMessage(input);
    setInput("");
  };

  const handleSuggestionClick = () => {
    if (isLoading) return;
    sendSuggestion("پیشنهاد بده");
  };

  return (
    <div className="p-4 border-t bg-white">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !input.trim()}
          className="shrink-0"
        >
          <SendHorizonal className="h-4 w-4" />
        </Button>
        <TextareaAutosize
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="سوال خود را از تیام بپرسید..."
          className="w-full resize-none border rounded-md py-2 px-3 text-sm focus:outline-none "
          minRows={1}
          maxRows={4}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={isLoading}
        />

        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={handleSuggestionClick}
          disabled={isLoading}
          className="shrink-0"
          title="دریافت پیشنهاد"
        >
          <Wand2 className="h-4 w-4" />
        </Button>
      </form>

      <p className="text-xs text-center text-gray-400 mt-2 px-4">
        تیام یک دستیار هوشمند است و ممکن است اشتباه کند.
      </p>
    </div>
  );
}

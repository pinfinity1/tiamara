// client/src/components/ai/ChatInput.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SendHorizonal } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import TextareaAutosize from "react-textarea-autosize";

export default function ChatInput() {
  const [input, setInput] = useState("");
  const { addMessage, sendMessage, isLoading } = useChatStore();

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

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 p-4 border-t bg-white "
    >
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
    </form>
  );
}

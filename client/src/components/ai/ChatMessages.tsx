// client/src/components/ai/ChatMessages.tsx

"use client";

import { useChatStore } from "@/store/useChatStore";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

export default function ChatMessages() {
  const { messages, isLoading } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn("flex items-end gap-3", {
            "justify-start": msg.sender === "user",
            "justify-end": msg.sender === "ai",
          })}
        >
          <div
            className={cn("px-3 py-2 rounded-lg max-w-md", {
              "bg-primary text-primary-foreground": msg.sender === "user",
              "bg-gray-100": msg.sender === "ai",
            })}
          >
            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex items-start gap-3 justify-end">
          <div className="p-3 rounded-lg bg-gray-100">
            <p className="text-sm text-gray-500 animate-pulse">
              تیام در حال تایپ کردن است...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

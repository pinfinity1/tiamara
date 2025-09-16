// client/src/components/ai/ChatMessages.tsx

import { useChatStore } from "@/store/useChatStore";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { Product } from "@/store/useProductStore";
import { getProductBySlug } from "@/lib/data-fetching";
import AiProductCard from "./AiProductCard";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button"; // وارد کردن کامپوننت دکمه

// کامپوننت کمکی بدون تغییر باقی می‌ماند
const ChatMessageContent = ({ text }: { text: string }) => {
  // ... (کد این کامپوننت از پاسخ قبلی بدون تغییر است)
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const { cleanText, productSlug } = useMemo(() => {
    const productTagRegex = /\[PRODUCT_RECOMMENDATION:(.*?)\]/;
    const match = text.match(productTagRegex);
    if (match && match[1]) {
      return {
        cleanText: text.replace(productTagRegex, "").trim(),
        productSlug: match[1],
      };
    }
    return { cleanText: text, productSlug: null };
  }, [text]);

  useEffect(() => {
    if (productSlug) {
      setIsLoading(true);
      setError(false);
      const fetchProduct = async () => {
        const fetchedProduct = await getProductBySlug(productSlug);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
        } else {
          setError(true);
          console.error(
            `AI hallucinated a slug that was not found: ${productSlug}`
          );
        }
        setIsLoading(false);
      };
      fetchProduct();
    }
  }, [productSlug]);

  if (error || !productSlug) {
    return <p className="text-sm whitespace-pre-wrap">{cleanText || text}</p>;
  }

  return (
    <div className="space-y-3">
      {cleanText && <p className="text-sm whitespace-pre-wrap">{cleanText}</p>}
      <div>
        {isLoading && <Skeleton className="w-80 h-28 rounded-lg" />}
        {product && <AiProductCard product={product} />}
      </div>
    </div>
  );
};

export default function ChatMessages() {
  const { messages, isLoading, sendSuggestion } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-2">
      {messages.map((msg) => (
        <div key={msg.id} className="flex flex-col items-stretch">
          <div
            className={cn("flex items-end gap-3", {
              "justify-start": msg.sender === "user",
              "justify-end": msg.sender === "ai",
            })}
          >
            <div
              className={cn("max-w-md p-3", {
                "bg-primary text-primary-foreground rounded-[8px_8px_0_8px]":
                  msg.sender === "user",
                "bg-gray-100 rounded-[8px_8px_8px_0]": msg.sender === "ai",
                "p-1":
                  msg.sender === "ai" &&
                  msg.text.includes("[PRODUCT_RECOMMENDATION:"),
              })}
            >
              {msg.sender === "user" ? (
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              ) : (
                <ChatMessageContent text={msg.text} />
              )}
            </div>
          </div>

          {/* بخش جدید: نمایش دکمه‌های پیشنهادی */}
          {msg.sender === "ai" &&
            msg.suggestions &&
            msg.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 justify-end">
                {msg.suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => sendSuggestion(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
        </div>
      ))}
      {isLoading && (
        <div className="flex items-start gap-3 justify-end">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
    </div>
  );
}

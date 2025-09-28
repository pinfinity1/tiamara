"use client";

import ChatConversation from "@/components/ai/ChatConversation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ChatPage() {
  const router = useRouter();
  const showChatFeature = process.env.NEXT_PUBLIC_CHAT_ENABLED === "true";

  useEffect(() => {
    if (!showChatFeature) {
      router.replace("/");
    }
  }, [showChatFeature, router]);

  return (
    <div className="container mx-auto py-8">
      <Card className="h-[calc(100vh-200px)] flex flex-col w-full max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center gap-4 p-4 border-b">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="text-right">
            <CardTitle className="font-bold text-lg">
              گفتگوی اختصاصی با تیام
            </CardTitle>
            <p className="text-sm text-gray-500">
              دستیار هوشمند شما برای انتخاب بهترین محصولات
            </p>
          </div>
        </CardHeader>
        <ChatConversation />
      </Card>
    </div>
  );
}

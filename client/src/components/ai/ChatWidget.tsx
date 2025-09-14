"use client";

import { useChatStore } from "@/store/useChatStore";
import { Button } from "../ui/button";
import {
  Sparkles,
  X,
  Minimize2,
  ArrowUpRightFromSquare,
  GripVertical,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import Link from "next/link";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const ChatCard = ({
  dragListeners,
  isPaneView = false,
}: {
  dragListeners?: any;
  isPaneView?: boolean;
}) => {
  const { setViewMode } = useChatStore();

  if (isPaneView) {
    return (
      <Card className="h-full rounded-none border-0 flex flex-col">
        {/* Special Header for Pane View (Tab-like) */}
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b h-14 bg-white rounded-tr-lg border-t">
          <div className="text-right">
            <CardTitle className="font-bold text-base">تیام</CardTitle>
            <p className="text-xs text-gray-500">دستیار هوشمند شما</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("widget")}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button asChild variant="ghost" size="icon">
              <Link href="/chat" target="_blank">
                <ArrowUpRightFromSquare className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("closed")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4 overflow-y-auto">
          <p>محل نمایش پیام‌ها...</p>
        </CardContent>
        <CardFooter className="p-4 border-t">
          <p>محل فرم ارسال پیام...</p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-2xl border flex flex-col w-96 h-[600px] bg-background">
      <CardHeader
        className="flex flex-row items-center justify-between p-4 border-b"
        {...dragListeners} // اعمال شنونده‌های جابجایی
      >
        <div className="flex items-center gap-2 cursor-grab">
          <GripVertical className="h-5 w-5 text-gray-400" />
          <div className="text-right">
            <CardTitle className="font-bold text-base">تیام</CardTitle>
            <p className="text-xs text-gray-500">دستیار هوشمند شما</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode("half")}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button asChild variant="ghost" size="icon">
            <Link href="/chat" target="_blank">
              <ArrowUpRightFromSquare className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode("closed")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-y-auto">
        <p>محل نمایش پیام‌ها...</p>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <p>محل فرم ارسال پیام...</p>
      </CardFooter>
    </Card>
  );
};

// کامپوننت اصلی که بین حالت‌های مختلف جابجا می‌شود
export default function ChatWidget({ isPaneView = false }) {
  const { viewMode, setViewMode } = useChatStore();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "chat-widget",
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : {};

  if (isPaneView) {
    return <ChatCard isPaneView={true} />;
  }

  if (viewMode === "closed") {
    return (
      <div className="fixed bottom-5 left-5 z-[2147483647] group">
        <Button
          size="icon"
          className="rounded-full w-16 h-16 shadow-lg"
          onClick={() => setViewMode("widget")}
        >
          <Sparkles className="h-8 w-8" />
        </Button>
      </div>
    );
  }

  if (viewMode === "widget") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="fixed bottom-5 left-5 z-[2147483647]"
        {...attributes}
      >
        <ChatCard dragListeners={listeners} />
      </div>
    );
  }

  return null;
}

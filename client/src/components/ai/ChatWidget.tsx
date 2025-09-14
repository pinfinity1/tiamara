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
import Image from "next/image";
import tiamIcon from "../../../public/images/Logo/tiamara-icon-white.png";
import ChatConversation from "./ChatConversation";

const ChatCard = ({ dragListeners }: { dragListeners?: any }) => {
  const { setViewMode } = useChatStore();

  return (
    <Card className="rounded-2xl shadow-2xl border flex flex-col w-96 h-[600px] bg-background">
      <CardHeader
        className="flex flex-row items-center justify-between p-4 border-b"
        {...dragListeners}
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
      <ChatConversation />
    </Card>
  );
};

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
    return (
      <Card className="h-full rounded-none border-0 border-l flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between p-4 border-b h-20">
          <div className="text-right">
            <CardTitle className="font-bold text-base">
              تیام{" "}
              <span className="font-normal text-[12px] mr-2">
                دستیار هوشمند شما
              </span>
            </CardTitle>
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
        <ChatConversation />
      </Card>
    );
  }

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-32 -left-8 z-[2147483647]">
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            viewMode === "closed"
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none"
          )}
        >
          <Button
            size="icon"
            className="group rounded-full w-16 h-16 shadow-lg transition-all duration-700 hover:rotate-90"
            onClick={() => setViewMode("widget")}
          >
            <Image
              src={tiamIcon}
              alt="tiam icon"
              width={24}
              height={24}
              className="group-hover:scale-110"
            />
          </Button>
        </div>
      </div>

      {/* Draggable widget */}
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "fixed bottom-5 left-5 z-[2147483647] transition-all duration-300 ease-in-out",
          viewMode === "widget"
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        )}
        {...attributes}
      >
        <ChatCard dragListeners={listeners} />
      </div>
    </>
  );
}

"use client";

import { useChatStore } from "@/store/useChatStore";
import { Button } from "../ui/button";
import { MessageSquare, X, Minimize, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";
import { DndContext, useDraggable, DragEndEvent } from "@dnd-kit/core";
import { useState } from "react";

function DraggableChat({
  children,
  pos,
}: {
  children: (props: { listeners: any; attributes: any }) => React.ReactNode;
  pos: { x: number; y: number };
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "chat-widget",
  });

  const style = {
    transform: transform
      ? `translate3d(${pos.x + transform.x}px, ${pos.y + transform.y}px, 0)`
      : `translate3d(${pos.x}px, ${pos.y}px, 0)`,
  };

  return (
    <div ref={setNodeRef} style={style} className="absolute z-50">
      {children({ attributes, listeners })}
    </div>
  );
}

export default function ChatWidget() {
  const { isOpen, isExpanded, openChat, closeChat, toggleExpanded } =
    useChatStore();

  const [pos, setPos] = useState({ x: 100, y: 100 });

  const handleDragEnd = (event: DragEndEvent) => {
    const { delta, active } = event;
    if (active.id === "chat-widget") {
      setPos((prev) => ({
        x: prev.x + delta.x,
        y: prev.y + delta.y,
      }));
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-5 left-5 z-50">
        <Button
          size="icon"
          className="rounded-full w-16 h-16 shadow-lg"
          onClick={openChat}
        >
          <MessageSquare className="h-8 w-8" />
        </Button>
      </div>
    );
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <DraggableChat pos={pos}>
        {({ attributes, listeners }) => (
          <div
            className={cn(
              "bg-white rounded-lg shadow-2xl border flex flex-col transition-all duration-300",
              isExpanded ? "w-[calc(100%-100px)] h-[70%]" : "w-96 h-[600px]"
            )}
          >
            <div
              className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg cursor-grab"
              {...listeners}
              {...attributes}
            >
              <h3 className="font-bold">گفتگو با تیام</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={toggleExpanded}>
                  {isExpanded ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={closeChat}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* بدنه چت */}
            <div className="flex-1 p-4 overflow-y-auto">
              <p>محل نمایش پیام‌ها...</p>
            </div>

            {/* فرم پیام */}
            <div className="p-4 border-t">
              <p>محل فرم ارسال پیام...</p>
            </div>
          </div>
        )}
      </DraggableChat>
    </DndContext>
  );
}

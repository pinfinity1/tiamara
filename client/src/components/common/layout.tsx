"use client";

import { usePathname } from "next/navigation";
import Header from "../user/header";
import AuthModal from "../auth/AuthModal";
import SkinProfileModal from "./SkinProfileModal";
import ChatWidget from "../ai/ChatWidget";
import { useChatStore } from "@/store/useChatStore";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

const pathsNotToShowHeaders = ["/auth", "/super-admin", "/chat"];

function CommonLayout({ children }: { children: React.ReactNode }) {
  const pathName = usePathname();
  const { viewMode } = useChatStore();

  const showHeader = !pathsNotToShowHeaders.some((currentPath) =>
    pathName.startsWith(currentPath)
  );

  // اگر چت در حالت نیم‌صفحه نیست، ساختار عادی سایت را نمایش بده
  if (viewMode !== "half") {
    return (
      <div className="min-h-screen bg-white">
        <AuthModal />
        <SkinProfileModal />
        <ChatWidget />
        <div className="flex flex-col flex-1">
          {showHeader && <Header />}
          <main className={`pt-[80px] lg:pt-[128px] ${!showHeader && "!pt-0"}`}>
            {children}
          </main>
        </div>
      </div>
    );
  }

  // اگر چت در حالت نیم‌صفحه است، ساختار جدید با پنل‌های قابل تنظیم را نمایش بده
  return (
    <div className="min-h-screen bg-white">
      <AuthModal />
      <SkinProfileModal />
      <ChatWidget />
      <PanelGroup direction="horizontal">
        <Panel defaultSize={50} minSize={30}>
          <div className="flex flex-col h-full">
            {showHeader && <Header />}
            <main
              className={`pt-[80px] lg:pt-[128px] ${
                !showHeader && "!pt-0"
              } flex-1 overflow-y-auto`}
            >
              {children}
            </main>
          </div>
        </Panel>
        <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-primary transition-colors" />
        <Panel defaultSize={50} minSize={30} className="z-[1001]">
          {/* ChatWidget در حالت نیم‌صفحه خودش را رندر می‌کند */}
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default CommonLayout;

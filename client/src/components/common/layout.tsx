"use client";

import { usePathname } from "next/navigation";
import Header from "../user/header";
import AuthModal from "../auth/AuthModal";
import SkinProfileModal from "./SkinProfileModal";
import ChatWidget from "../ai/ChatWidget";
import { useChatStore } from "@/store/useChatStore";

const pathsNotToShowHeaders = ["/auth", "/super-admin", "/chat"];

function CommonLayout({ children }: { children: React.ReactNode }) {
  const pathName = usePathname();
  const { viewMode } = useChatStore();

  const showHeader = !pathsNotToShowHeaders.some((currentPath) =>
    pathName.startsWith(currentPath)
  );

  if (viewMode !== "half") {
    return (
      <div className="min-h-screen bg-white">
        <AuthModal />
        <SkinProfileModal />
        <ChatWidget />
        <div className="flex flex-col flex-1">
          <Header />
          <main className={`pt-[80px] lg:pt-[128px] ${!showHeader && "!pt-0"}`}>
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex h-screen overflow-hidden">
      <AuthModal />
      <SkinProfileModal />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col" style={{ flexBasis: "70%" }}>
        {showHeader && <Header isPaneView={true} />}
        <main className={`flex-1 overflow-y-auto ${!showHeader && "!pt-0"}`}>
          {children}
        </main>
      </div>

      {/* Separator */}
      <div className="w-px bg-gray-200" />

      {/* Chat Widget Panel */}
      <div className="flex-shrink-0" style={{ flexBasis: "30%" }}>
        <ChatWidget />
      </div>
    </div>
  );
}

export default CommonLayout;

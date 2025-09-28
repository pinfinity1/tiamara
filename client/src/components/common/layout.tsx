"use client";

import { usePathname } from "next/navigation";
import Header from "../user/header";
import AuthModal from "../auth/AuthModal";
import SkinProfileModal from "./SkinProfileModal";
import ChatWidget from "../ai/ChatWidget";
import { useChatStore } from "@/store/useChatStore";
import { cn } from "@/lib/utils";
import Footer from "./Footer";

const pathsNotToShowHeaders = ["/auth", "/super-admin", "/chat"];

const pathsNotToShowLayout = ["/auth", "/super-admin", "/chat"];

function CommonLayout({ children }: { children: React.ReactNode }) {
  const pathName = usePathname();
  const { viewMode } = useChatStore();

  const showHeader = !pathsNotToShowHeaders.some((currentPath) =>
    pathName.startsWith(currentPath)
  );

  const showLayout = !pathsNotToShowLayout.some((currentPath) =>
    pathName.startsWith(currentPath)
  );

  const showAiFeatures = process.env.NEXT_PUBLIC_CHAT_ENABLED === "true";

  const isHalfMode = viewMode === "half";

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      <AuthModal />
      {showAiFeatures && <SkinProfileModal />}

      <div
        className={cn(
          "h-full flex flex-col transition-all duration-300 ease-in-out",
          isHalfMode ? "w-[70%]" : "w-full"
        )}
      >
        {showHeader && <Header isPaneView={isHalfMode} />}
        <main
          id="main-content"
          className={cn(
            "flex-1 overflow-y-auto",
            !isHalfMode && `pt-[80px] lg:pt-[128px]`,
            !showHeader && "!pt-0"
          )}
        >
          {children}
          {showLayout && <Footer />}
        </main>
      </div>

      {showAiFeatures && (
        <>
          <div
            className={cn(
              "h-full flex-shrink-0 bg-white transition-all duration-300 ease-in-out overflow-hidden flex",
              isHalfMode ? "w-[30%]" : "w-0"
            )}
          >
            <div className="w-1.5 h-full flex-shrink-0 bg-black/20" />
            <div className="flex-1">
              <ChatWidget isPaneView={isHalfMode} />
            </div>
          </div>

          {!isHalfMode && <ChatWidget />}
        </>
      )}
    </div>
  );
}

export default CommonLayout;

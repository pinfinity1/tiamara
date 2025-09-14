"use client";

import { usePathname } from "next/navigation";
import Header from "../user/header";
import AuthModal from "../auth/AuthModal";
import SkinProfileModal from "./SkinProfileModal";
import ChatWidget from "../ai/ChatWidget";
import { useChatStore } from "@/store/useChatStore";
import Image from "next/image";
import logo from "../../../public/images/Logo/tiamara-logo.png";
import Link from "next/link";

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

  // ساختار جدید با هدر تبی-شکل برای حالت نیم‌صفحه
  return (
    <div className="min-h-screen bg-white flex flex-col h-screen overflow-hidden">
      <AuthModal />
      <SkinProfileModal />

      {/* Unified Tab-like Header */}
      <div className="flex-shrink-0 h-14 flex items-end border-b bg-gray-50">
        {/* Main Content Tab */}
        <div className="flex-1 h-full flex items-center px-4 border-r rounded-tl-lg bg-white border-b-0">
          <Link className="text-2xl font-bold" href="/">
            <div className="overflow-hidden w-[80px] h-[50px] relative">
              <Image
                src={logo}
                fill
                priority
                alt="Logo"
                className="object-cover"
              />
            </div>
          </Link>
        </div>

        {/* Chat Widget Tab (Handled inside ChatWidget component) */}
        <div className="w-[30%] h-full">
          {/* The header part of ChatWidget will act as the tab */}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col" style={{ flexBasis: "70%" }}>
          <main className="flex-1 overflow-y-auto bg-white p-4">
            {children}
          </main>
        </div>

        {/* Separator */}
        <div className="w-1 bg-gray-200 cursor-ew-resize" />

        {/* Chat Widget Panel */}
        <div className="flex-shrink-0" style={{ flexBasis: "30%" }}>
          <ChatWidget isPaneView={true} />
        </div>
      </div>
    </div>
  );
}

export default CommonLayout;

"use client";

import { usePathname } from "next/navigation";
import Header from "../user/header";
import AuthModal from "../auth/AuthModal";
import SkinProfileModal from "./SkinProfileModal";

const pathsNotToShowHeaders = ["/auth", "/super-admin"];

function CommonLayout({ children }: { children: React.ReactNode }) {
  const pathName = usePathname();

  const showHeader = !pathsNotToShowHeaders.some((currentPath) =>
    pathName.startsWith(currentPath)
  );

  return (
    <div className="min-h-screen bg-white">
      <AuthModal />
      <SkinProfileModal />
      {showHeader && <Header />}
      <main className={`pt-[80px] lg:pt-[128px] ${!showHeader && "!pt-0"}`}>
        {children}
      </main>
    </div>
  );
}

export default CommonLayout;

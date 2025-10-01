"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { Session } from "next-auth";

import { useBrandStore } from "@/store/useBrandStore";
import { useCategoryStore } from "@/store/useCategoryStore";

import { cn } from "@/lib/utils";
import SearchModal from "../common/search/SearchModal";
import GlobalSearch from "../common/search/GlobalSearch";

import logo from "../../../public/images/Logo/tiamara-logo.png";
import DesktopNav from "./header/DesktopNav";
import MobileNav from "./header/MobileNav";
import HeaderActions from "./header/HeaderActions";

// =======================================================================
// Main Header Component
// =======================================================================
function Header({
  session: initialSession,
  isPaneView,
}: {
  session: Session | null;
  isPaneView?: boolean;
}) {
  const { data: clientSession, status: clientStatus } = useSession();
  const { brands, fetchBrands } = useBrandStore();
  const { categories, fetchCategories } = useCategoryStore();

  const session = clientSession ?? initialSession;
  const status = session ? "authenticated" : "unauthenticated";
  const isLoading = clientStatus === "loading" && !initialSession;

  const [isSubNavVisible, setIsSubNavVisible] = useState(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isDesktopSearchFocused, setIsDesktopSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, [fetchBrands, fetchCategories]);

  useEffect(() => {
    // @ts-ignore
    if (clientSession?.error === "RefreshAccessTokenError") {
      signOut({ callbackUrl: "/" });
    }
  }, [clientSession]);

  useEffect(() => {
    const scrollContainer = document.getElementById("main-content");
    if (!scrollContainer) {
      console.warn("main-content not found");
      return;
    }
    let lastScrollY = scrollContainer.scrollTop;
    let ticking = false;
    const scrollThreshold = 50;

    const updateScroll = () => {
      if (Math.abs(scrollContainer.scrollTop - lastScrollY) > scrollThreshold) {
        if (scrollContainer.scrollTop > lastScrollY) {
          setIsSubNavVisible(false);
        } else {
          setIsSubNavVisible(true);
        }
        lastScrollY = scrollContainer.scrollTop;
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isDesktopSearchFocused ? "hidden" : "";
  }, [isDesktopSearchFocused]);

  return (
    <>
      <header className={cn("w-full", !isPaneView && "fixed top-0 z-50")}>
        <div
          className={`w-full h-20 bg-white ${
            !isSubNavVisible ? "shadow-lg" : "shadow-lg lg:shadow-none"
          }`}
        >
          <div className="container mx-auto flex items-center justify-between w-full h-full px-4">
            {/* Left Section: Mobile Menu & Logo */}
            <div className="flex items-center gap-1">
              <MobileNav
                isOpen={isMobileMenuOpen}
                setIsOpen={setIsMobileMenuOpen}
                brands={brands}
                categories={categories}
              />
              <Link className="text-2xl font-bold" href="/">
                <div className="overflow-hidden w-[100px] h-[56px] relative">
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

            {/* Center Section: Desktop Search */}
            <div className="hidden lg:flex justify-center w-full max-w-lg">
              <GlobalSearch
                onFocusChange={setIsDesktopSearchFocused}
                isFocusedMode={isDesktopSearchFocused}
              />
            </div>

            {/* Right Section: Actions */}
            <HeaderActions
              status={status}
              isLoading={isLoading}
              session={session}
              onSearchClick={() => setIsSearchModalOpen(true)}
            />
          </div>
        </div>

        {/* Desktop Sub-Navigation */}
        <DesktopNav
          isVisible={isSubNavVisible}
          brands={brands}
          categories={categories}
        />
      </header>

      {/* Modals */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      {isDesktopSearchFocused && (
        <div
          className="fixed top-20 left-0 right-0 bottom-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsDesktopSearchFocused(false)}
        />
      )}
    </>
  );
}

export default Header;

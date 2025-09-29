"use client";

import { Search, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import logo from "../../../public/images/Logo/tiamara-logo.png";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import GlobalSearch from "../common/search/GlobalSearch";
import CartModal from "../common/modal/CartModal";
import SearchModal from "../common/search/SearchModal";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { Session } from "next-auth";

const navItems = [
  {
    title: "خانه",
    to: "/",
  },
  {
    title: "محصولات",
    to: "/products",
  },
];

interface HeaderProps {
  session: Session | null;
  isPaneView?: boolean;
}

function Header({ session: initialSession, isPaneView }: HeaderProps) {
  const router = useRouter();
  const { data: clientSession, status: clientStatus } = useSession();

  // ✅ منطق جدید برای جلوگیری از چشمک زدن
  // برای رندر اولیه، به پراپی که از سرور آمده اعتماد می‌کنیم
  // برای آپدیت‌های بعدی (مثل لاگین/لاگ‌اوت)، از هوک کلاینت استفاده می‌کنیم
  const session = clientSession ?? initialSession;
  const status = session ? "authenticated" : "unauthenticated";

  // حالت لودینگ فقط زمانی نمایش داده می‌شود که هیچ سشنی از سرور نیامده باشد
  // و کلاینت در حال بررسی وضعیت باشد (این حالت در بارگذاری اولیه رخ نمی‌دهد)
  const isLoading = clientStatus === "loading" && !initialSession;

  const [showCategories, setShowCategories] = useState(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isDesktopSearchFocused, setIsDesktopSearchFocused] = useState(false);

  useEffect(() => {
    // @ts-ignore
    if (clientSession?.error === "RefreshAccessTokenError") {
      signOut({ callbackUrl: "/" });
    }
  }, [clientSession]);

  async function handleLogout() {
    await signOut({ redirect: true, callbackUrl: "/" });
  }

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
          setShowCategories(false);
        } else {
          setShowCategories(true);
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
    if (isDesktopSearchFocused) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isDesktopSearchFocused]);

  return (
    <>
      <header className={cn("w-full", !isPaneView && "fixed top-0 z-50")}>
        <div
          className={`w-full h-20 bg-white ${
            !showCategories ? "shadow-lg" : "shadow-lg lg:shadow-none"
          }`}
        >
          <div
            className={`container mx-auto flex items-center justify-between w-full h-[80px] px-4`}
          >
            <div className="flex items-center gap-2">
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

            <div className="hidden lg:flex justify-center w-[40%]">
              <GlobalSearch
                onFocusChange={(focused) => setIsDesktopSearchFocused(focused)}
                isFocusedMode={isDesktopSearchFocused}
              />
            </div>

            <div className="flex items-center gap-2">
              {session?.user?.role === "SUPER_ADMIN" && (
                <Button
                  size="icon"
                  variant={"ghost"}
                  className="relative group w-fit px-2"
                  onClick={() => router.push("/super-admin")}
                >
                  بخش مدیریت
                </Button>
              )}
              <div className="lg:hidden">
                <Button
                  size="icon"
                  variant={"ghost"}
                  onClick={() => setIsSearchModalOpen(true)}
                >
                  <Search className="size-5" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <CartModal />
                {status === "authenticated" ? (
                  <>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger
                        asChild
                        className="data-[state=open]:bg-accent"
                      >
                        <Button size="icon" variant={"ghost"}>
                          <User className="size-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="text-right">
                        <DropdownMenuItem
                          onClick={() => router.push("/account")}
                        >
                          پروفایل
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleLogout}
                          className="hover:!bg-red-50"
                        >
                          خروج
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  !isLoading && (
                    <Button onClick={() => router.push("/auth/login")}>
                      ورود / ثبت‌نام
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
        <div
          className={cn(
            "hidden lg:flex items-center space-x-8 transition-transform duration-300 h-12 shadow-sm bg-white px-[20px] md:px-[40px] lg:px-[80px] border-t",
            showCategories
              ? "translate-y-0 visible opacity-100"
              : "-translate-y-full invisible opacity-0"
          )}
        >
          <nav className="flex items-center gap-4">
            {navItems.map((item, index) => (
              <Link
                href={item.to}
                key={index}
                className="text-sm font-semibold hover:text-gray-700"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />

      {/* Desktop Search Overlay - Starts below the header */}
      <div
        className={cn(
          "fixed top-20 left-0 right-0 bottom-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity",
          isDesktopSearchFocused
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsDesktopSearchFocused(false)}
      />
    </>
  );
}

export default Header;

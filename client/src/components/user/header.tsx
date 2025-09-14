"use client";

import {
  ArrowLeft,
  Menu,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import logo from "../../../public/images/Logo/tiamara-logo.png";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import GlobalSearch from "../common/search/GlobalSearch";
import CartModal from "../common/modal/CartModal";
import SearchModal from "../common/search/SearchModal";
import { cn } from "@/lib/utils";

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

function Header({ isPaneView = false }: { isPaneView?: boolean }) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  const [mobileView, setMobileView] = useState<"menu" | "account">("menu");
  const [showSheetDialog, setShowSheetDialog] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isDesktopSearchFocused, setIsDesktopSearchFocused] = useState(false);

  const { fetchCart, items } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [fetchCart, isAuthenticated]);

  async function handleLogout() {
    await signOut({ redirect: true, callbackUrl: "/" });
  }

  const renderMobileMenuItems = () => {
    if (isAuthenticated) {
      switch (mobileView) {
        case "account":
          return (
            <div className="space-y-2">
              <div className="flex items-center">
                <Button
                  onClick={() => setMobileView("menu")}
                  variant="ghost"
                  size="icon"
                >
                  <ArrowLeft />
                </Button>
              </div>
              <nav className="space-y-2">
                <p
                  onClick={() => {
                    setShowSheetDialog(false);
                    router.push("/account");
                  }}
                  className="block cursor-pointer w-full p-2"
                >
                  Your Account
                </p>
                <Button
                  onClick={() => {
                    setShowSheetDialog(false);
                    setMobileView("menu");
                    handleLogout();
                  }}
                >
                  Logout
                </Button>
              </nav>
            </div>
          );

        default:
          return (
            <div className="space-y-6 py-6">
              <div className="space-y-3">
                {navItems.map((navItem) => (
                  <p
                    className="block w-full font-semibold p-2 cursor-pointer hover:bg-black/5 rounded transition-all duration-200"
                    onClick={() => {
                      setShowSheetDialog(false);
                      router.push(navItem.to);
                    }}
                    key={navItem.title}
                  >
                    {navItem.title}
                  </p>
                ))}
              </div>
              <div className="space-y-4">
                <Button
                  onClick={() => setMobileView("account")}
                  className="w-full justify-start"
                >
                  <User className="mr-1 h-4 w-4" />
                  Account
                </Button>
                <Button
                  onClick={() => {
                    setShowSheetDialog(false);
                    router.push("/cart");
                  }}
                  className="w-full justify-start"
                >
                  <ShoppingBag className="mr-1 h-4 w-4" />
                  Cart ({items?.length || 0})
                </Button>
              </div>
              {session.user?.role === "SUPER_ADMIN" && (
                <Button
                  size="icon"
                  variant={"ghost"}
                  className="relative group w-fit px-2"
                  onClick={() => router.push("/super-admin")}
                >
                  رفتن بخش مدیریت
                </Button>
              )}
            </div>
          );
      }
    } else {
      return (
        <div className="space-y-6 py-6">
          <div className="space-y-3">
            {navItems.map((navItem) => (
              <p
                className="block w-full font-semibold p-2 cursor-pointer"
                onClick={() => {
                  setShowSheetDialog(false);
                  router.push(navItem.to);
                }}
                key={navItem.title}
              >
                {navItem.title}
              </p>
            ))}
          </div>
          <Button
            onClick={() => {
              setShowSheetDialog(false);
              router.push("/auth/login");
            }}
            className="w-full"
          >
            ورود / ثبت‌نام
          </Button>
        </div>
      );
    }
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    const scrollThreshold = 50;

    const updateScroll = () => {
      if (Math.abs(window.scrollY - lastScrollY) > scrollThreshold) {
        if (window.scrollY > lastScrollY) {
          setShowCategories(false);
        } else {
          setShowCategories(true);
        }
        lastScrollY = window.scrollY;
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
              <div className="lg:hidden">
                <Sheet
                  open={showSheetDialog}
                  onOpenChange={() => {
                    setShowSheetDialog(false);
                    setMobileView("menu");
                  }}
                >
                  <Button
                    onClick={() => setShowSheetDialog(!showSheetDialog)}
                    size="icon"
                    variant="ghost"
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle className="pt-3 flex justify-center">
                        <div className="w-[100px] h-[60px] relative">
                          <Image
                            src={logo}
                            fill
                            priority
                            alt="Logo"
                            className="object-cover object-center"
                          />
                        </div>
                      </SheetTitle>
                    </SheetHeader>
                    {renderMobileMenuItems()}
                  </SheetContent>
                </Sheet>
              </div>
              <Link className="text-2xl font-bold" href="/">
                <div className="overflow-hidden w-[100px] h-[60px] relative">
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
              <div className="lg:hidden">
                <Button
                  size="icon"
                  variant={"ghost"}
                  onClick={() => setIsSearchModalOpen(true)}
                >
                  <Search className="size-5" />
                </Button>
              </div>
              <div className="hidden lg:flex items-center gap-4">
                {isAuthenticated ? (
                  <>
                    {session.user?.role === "SUPER_ADMIN" && (
                      <Button
                        size="icon"
                        variant={"ghost"}
                        className="relative group w-fit px-2"
                        onClick={() => router.push("/super-admin")}
                      >
                        بخش مدیریت
                      </Button>
                    )}
                    <CartModal />
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
              <div className="lg:hidden">
                <CartModal />
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

"use client";

import { ArrowLeft, Menu, ShoppingBag, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import logo from "../../../public/images/Logo/tiamara-logo.png";
import Image from "next/image";

const navItems = [
  {
    title: "خانه",
    to: "/",
  },
  {
    title: "محصولات",
    to: "/listing",
  },
];

function Header() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [mobileView, setMobileView] = useState<"menu" | "account">("menu");
  const [showSheetDialog, setShowSheetDialog] = useState(false);
  const { fetchCart, items } = useCartStore();

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [fetchCart, user]);

  async function handleLogout() {
    await logout();
    router.push("/auth/login");
  }

  const renderMobileMenuItems = () => {
    if (user) {
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

  return (
    <header className="sticky bg-white  top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
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
          <div className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
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
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <>
                <Button
                  size="icon"
                  variant={"ghost"}
                  className="relative group"
                  onClick={() => router.push("/cart")}
                >
                  <ShoppingCart className="size-5" />
                  <span className="absolute top-0 right-0 size-4 bg-black/20 backdrop-blur-lg text-black text-xs rounded-full flex items-center justify-center pt-0.5 group-hover:-top-1 group-hover:-right-1 group-hover:bg-black/30 transition-all duration-200 ">
                    {items?.length}
                  </span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant={"ghost"}>
                      <User className="size-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="text-right">
                    <DropdownMenuItem onClick={() => router.push("/account")}>
                      پروفایل
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      خروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={() => router.push("/auth/login")}>
                ورود / ثبت‌نام
              </Button>
            )}
          </div>
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
        </div>
      </div>
    </header>
  );
}

export default Header;

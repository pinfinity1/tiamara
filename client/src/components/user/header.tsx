"use client";

import { Search, User, Menu, Instagram } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import React, { useEffect, useState } from "react";
import logo from "../../../public/images/Logo/tiamara-logo.png";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import GlobalSearch from "../common/search/GlobalSearch";
import CartModal from "../common/modal/CartModal";
import SearchModal from "../common/search/SearchModal";
import { cn } from "@/lib/utils";
import { Session } from "next-auth";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useBrandStore } from "@/store/useBrandStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "../ui/separator";
import { useDropdownPosition } from "@/hooks/useDropdownPosition";

// کامپوننت کمکی برای آیتم‌های داخل مگا منو
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

// کامپوننت اصلی هدر
function Header({
  session: initialSession,
  isPaneView,
}: {
  session: Session | null;
  isPaneView?: boolean;
}) {
  const router = useRouter();
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

  const { menuRef, position } = useDropdownPosition<HTMLDivElement>();

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
            <div className="flex items-center gap-1">
              <div className="lg:hidden">
                <Sheet
                  open={isMobileMenuOpen}
                  onOpenChange={setIsMobileMenuOpen}
                >
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-[300px] p-0 flex flex-col"
                  >
                    <div className="p-4 border-b">
                      <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                        <Image src={logo} alt="Logo" width={120} height={56} />
                      </Link>
                    </div>
                    <nav className="flex-1 overflow-y-auto">
                      <div className="p-4 flex flex-col gap-4">
                        <Link
                          href="/products"
                          className="text-base font-medium"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          محصولات
                        </Link>
                        <Accordion type="multiple" className="w-full">
                          <AccordionItem value="brands">
                            <AccordionTrigger>برندها</AccordionTrigger>
                            <AccordionContent className="pr-2">
                              {brands.slice(0, 10).map((brand) => (
                                <Link
                                  key={brand.id}
                                  href={`/brands/${brand.slug}`}
                                  className="block py-1.5 text-gray-700 text-sm"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {brand.name}
                                </Link>
                              ))}
                              {brands.length > 10 && (
                                <Link
                                  href="/brands"
                                  className="block py-1.5 text-primary font-semibold text-sm"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  همه برندها...
                                </Link>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="categories">
                            <AccordionTrigger>دسته‌بندی‌ها</AccordionTrigger>
                            <AccordionContent className="pr-2">
                              {categories.slice(0, 10).map((cat) => (
                                <Link
                                  key={cat.id}
                                  href={`/categories/${cat.slug}`}
                                  className="block py-1.5 text-gray-700 text-sm"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {cat.name}
                                </Link>
                              ))}
                              {categories.length > 10 && (
                                <Link
                                  href="/categories"
                                  className="block py-1.5 text-primary font-semibold text-sm"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  همه دسته‌بندی‌ها...
                                </Link>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </nav>
                    <div className="p-4 mt-auto border-t">
                      <p className="text-xs text-muted-foreground mb-4">
                        تیامارا، مقصد شما برای کشف زیبایی و اصالت.
                      </p>
                      <Button variant="outline" className="w-full" asChild>
                        <a
                          href="https://instagram.com"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Instagram className="w-4 h-4 ml-2" />
                          ما را در اینستاگرام دنبال کنید
                        </a>
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
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

            <div className="hidden lg:flex justify-center w-full max-w-lg">
              <GlobalSearch
                onFocusChange={setIsDesktopSearchFocused}
                isFocusedMode={isDesktopSearchFocused}
              />
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <div className="lg:hidden">
                <Button
                  size="icon"
                  variant={"ghost"}
                  onClick={() => setIsSearchModalOpen(true)}
                >
                  <Search className="size-5" />
                </Button>
              </div>
              <CartModal />
              {status === "authenticated" ? (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant={"ghost"}>
                      <User className="size-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="text-right">
                    {session?.user?.role === "SUPER_ADMIN" && (
                      <DropdownMenuItem
                        onClick={() => router.push("/super-admin")}
                      >
                        پنل مدیریت
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => router.push("/account")}>
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
              ) : (
                !isLoading && (
                  <Button
                    onClick={() => router.push("/auth/login")}
                    className="hidden md:flex"
                  >
                    ورود / ثبت‌نام
                  </Button>
                )
              )}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "hidden lg:flex items-center pr-20 w-full transition-transform duration-300 h-12 border-t bg-white shadow-sm",
            isSubNavVisible
              ? "translate-y-0 visible opacity-100"
              : "-translate-y-[30%] invisible opacity-0"
          )}
        >
          <NavigationMenu className="[&_div.absolute]:left-auto [&_div.absolute]:right-0 ">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/products" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    محصولات
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>برندها</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="p-4 w-[500px] max-h-[400px] overflow-y-auto grid grid-cols-3 gap-3">
                    {brands.map((brand) => (
                      <ListItem
                        key={brand.id}
                        href={`/brands/${brand.slug}`}
                        title={brand.name}
                      >
                        {brand.metaDescription?.substring(0, 60) ??
                          `محصولات برند ${brand.name}`}
                      </ListItem>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>دسته‌بندی‌ها</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] max-h-[400px] overflow-y-auto">
                    {categories.map((category) => (
                      <ListItem
                        key={category.id}
                        href={`/categories/${category.slug}`}
                        title={category.name}
                      >
                        {category.metaDescription}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </header>

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

"use client";

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import ListItem from "./ListItem";
import { Brand } from "@/store/useBrandStore";
import { Category } from "@/store/useCategoryStore";
import { cn } from "@/lib/utils";
import { AnimatedGrid } from "@/components/ui/animated-grid";

interface DesktopNavProps {
  isVisible: boolean;
  brands: Brand[];
  categories: Category[];
}

const DesktopNav = ({ isVisible, brands, categories }: DesktopNavProps) => {
  return (
    <div
      className={cn(
        "hidden lg:flex items-center pr-20 w-full transition-transform duration-300 h-12 border-t bg-white shadow-sm",
        isVisible
          ? "translate-y-0 visible opacity-100"
          : "-translate-y-[30%] invisible opacity-0"
      )}
    >
      <NavigationMenu
        dir="rtl"
        className="[&_div.absolute]:left-auto [&_div.absolute]:right-0"
      >
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link href="/products" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                محصولات
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>

          {/* ==================== BRANDS ==================== */}
          <NavigationMenuItem>
            <NavigationMenuTrigger>برندها</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid grid-cols-2 gap-x-6 w-[600px] p-4 bg-white">
                <ul className="grid grid-cols-2 gap-x-3 gap-y-1 self-start max-h-56 overflow-y-auto p-2 rounded-lg bg-gray-50">
                  {brands.map((brand) => (
                    <ListItem
                      key={brand.id}
                      href={`/brands/${brand.slug}`}
                      title={brand.name}
                    />
                  ))}
                </ul>

                <Link
                  href="/brands"
                  passHref
                  className="block relative h-full min-h-[192px] w-full overflow-hidden group border border-white/10 bg-neutral-950 rounded-[2px]"
                >
                  {/* 2. استفاده از کامپوننت پیشرفته */}
                  <AnimatedGrid />

                  <div className="absolute inset-0 bg-transparent flex items-center justify-center w-full h-full z-20">
                    <span className="text-white text-xl font-bold tracking-widest uppercase group-hover:scale-105 transition-transform duration-500 drop-shadow-lg">
                      همه برندها
                    </span>
                  </div>
                </Link>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* ==================== CATEGORIES ==================== */}
          <NavigationMenuItem>
            <NavigationMenuTrigger>دسته‌بندی‌ها</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid grid-cols-2 gap-x-6 w-[600px] p-4 bg-white">
                <ul className="grid grid-cols-2 gap-x-3 gap-y-1 self-start max-h-56 overflow-y-auto p-2 rounded-lg bg-gray-50">
                  {categories.map((category) => (
                    <ListItem
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      title={category.name}
                    />
                  ))}
                </ul>

                <Link
                  href="/categories"
                  passHref
                  className="block relative h-full min-h-[192px] w-full overflow-hidden group border border-white/10 bg-neutral-950 rounded-[2px]"
                >
                  {/* استفاده مجدد برای هماهنگی (چون رندوم است، تکراری به نظر نمی‌رسد) */}
                  <AnimatedGrid />

                  <div className="absolute inset-0 bg-transparent flex items-center justify-center w-full h-full z-20">
                    <span className="text-white text-xl font-bold tracking-widest uppercase group-hover:scale-105 transition-transform duration-500 drop-shadow-lg">
                      همه دسته‌بندی‌ها
                    </span>
                  </div>
                </Link>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

export default DesktopNav;

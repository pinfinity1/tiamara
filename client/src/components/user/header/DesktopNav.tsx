// client/src/components/user/header/DesktopNav.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
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
          <NavigationMenuItem>
            <NavigationMenuTrigger>برندها</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid grid-cols-2 gap-x-6 w-[600px] p-4">
                {/* افزودن پس‌زمینه طوسی، پدینگ و گوشه‌های گرد */}
                <ul className="grid grid-cols-2 gap-x-3 gap-y-1 self-start max-h-56 overflow-y-auto p-2 rounded-lg bg-gray-50 [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)]">
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
                  className="block relative h-full min-h-[192px] w-full bg-gray-100 rounded-md overflow-hidden transition-transform hover:scale-[101%]"
                >
                  <Image
                    src="/images/brand-banner.png"
                    alt="Brands"
                    fill
                    className="object-cover pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px] rounded-md flex items-center justify-center w-full h-full">
                    <span className="text-white text-lg font-semibold">
                      همه برندها
                    </span>
                  </div>
                </Link>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>دسته‌بندی‌ها</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid grid-cols-2 gap-x-6 w-[600px] p-4">
                {/* افزودن پس‌زمینه طوسی، پدینگ و گوشه‌های گرد */}
                <ul className="grid grid-cols-2 gap-x-3 gap-y-1 self-start max-h-56 overflow-y-auto p-2 rounded-lg bg-gray-50 [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)]">
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
                  className="block relative h-full min-h-[192px] w-full bg-gray-100 rounded-md overflow-hidden transition-transform hover:scale-[101%]"
                >
                  <Image
                    src="/images/category-banner.png"
                    alt="Categories"
                    fill
                    className="object-cover pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-black/15 backdrop-blur-[2px] rounded-md flex items-center justify-center w-full h-full">
                    <span className="text-white text-lg font-semibold">
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

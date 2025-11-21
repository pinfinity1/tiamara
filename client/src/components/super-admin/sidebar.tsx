"use client";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Package,
  Tag,
  Ticket,
  Truck,
  LucideProps,
  LayoutGrid,
  ExternalLink,
  Warehouse,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

// Define a unified type for all menu items
type MenuItem = {
  name: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  href?: string;
  action?: () => void;
  group: string;
};

// Menu items are grouped for better organization
const menuItems: MenuItem[] = [
  {
    name: "داشبورد",
    icon: LayoutDashboard,
    href: "/super-admin",
    group: "اصلی",
  },
  {
    name: "سفارشات",
    icon: FileText,
    href: "/super-admin/orders",
    group: "اصلی",
  },
  {
    name: "محصولات",
    icon: Package,
    href: "/super-admin/products",
    group: "کاتالوگ",
  },
  {
    name: "برندها",
    icon: Tag,
    href: "/super-admin/brands",
    group: "کاتالوگ",
  },
  {
    name: "دسته‌بندی‌ها",
    icon: LayoutGrid,
    href: "/super-admin/categories",
    group: "کاتالوگ",
  },
  {
    name: "کوپن‌ها",
    icon: Ticket,
    href: "/super-admin/coupons",
    group: "بازاریابی",
  },
  {
    name: "روش‌های ارسال",
    icon: Truck,
    href: "/super-admin/shipping",
    group: "بازاریابی",
  },
  {
    name: "انبارداری",
    icon: Warehouse,
    href: "/super-admin/inventory",
    group: "مدیریت",
  },
  {
    name: "مدیریت صفحه اصلی",
    icon: Home,
    href: "/super-admin/homepage",
    group: "ظاهر فروشگاه",
  },
];

// Bottom menu items like logout
const bottomMenuItems: MenuItem[] = [
  {
    name: "مشاهده فروشگاه",
    icon: ExternalLink,
    href: "/",
    group: "System",
  },
  {
    name: "خروج",
    icon: LogOut,
    action: async () => {
      await signOut({ redirect: true, callbackUrl: "/" });
    },
    group: "System", // Added group for consistency
  },
];

/**
 * The main sidebar component for the super admin panel.
 * @param {boolean} isOpen - Controls whether the sidebar is expanded or collapsed.
 * @param {function} toggle - Function to toggle the sidebar state.
 */
function SuperAdminSidebar({
  isOpen,
  toggle,
}: {
  isOpen: boolean;
  toggle: () => void;
}) {
  const router = useRouter();

  const handleNavigation = (href?: string, action?: () => void) => {
    if (href) {
      router.push(href);
    } else if (action) {
      action();
    }
  };

  // Group menu items by their 'group' property for structured rendering
  const menuGroups = menuItems.reduce((acc, item) => {
    (acc[item.group] = acc[item.group] || []).push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-gray-50 flex flex-col transition-all duration-300",
        isOpen ? "w-64" : "w-18",
        "border-r"
      )}
    >
      <div className="flex h-16 items-center justify-start px-2 sm:px-4 border-b">
        <Button
          variant={"ghost"}
          size={"icon"}
          className={`${isOpen ? "w-fit px-2" : "mx-auto"}`}
          onClick={toggle}
        >
          <h1 className={cn("font-semibold text-lg", !isOpen && "hidden")}>
            پنل مدیریت
          </h1>
          {isOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </Button>
      </div>

      <nav className="flex-1 space-y-2 py-4 overflow-y-auto">
        {Object.entries(menuGroups).map(([groupName, items]) => (
          <div key={groupName} className="px-4">
            <h2
              className={cn(
                "mt-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider",
                !isOpen && "text-center"
              )}
            >
              {isOpen ? groupName : "•"}
            </h2>
            {items.map((item) => (
              <div
                onClick={() => handleNavigation(item.href, item.action)}
                key={item.name}
                className={cn(
                  "flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200",
                  !isOpen && "justify-center"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className={cn(!isOpen && "hidden")}>{item.name}</span>
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t p-4">
        {bottomMenuItems.map((item) => (
          <div
            onClick={() => handleNavigation(item.href, item.action)}
            key={item.name}
            className={cn(
              "flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200",
              !isOpen && "justify-center"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className={cn(!isOpen && "hidden")}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SuperAdminSidebar;

"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import {
  Search,
  User,
  LayoutDashboard,
  LogOut,
  LogIn,
  FileText,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CartModal from "@/components/common/modal/CartModal";
import { Skeleton } from "@/components/ui/skeleton"; // <-- برای حالت لودینگ

interface HeaderActionsProps {
  status: "authenticated" | "unauthenticated" | "loading";
  isLoading: boolean;
  session: Session | null;
  onSearchClick: () => void;
}

const HeaderActions = ({
  status,
  isLoading,
  session,
  onSearchClick,
}: HeaderActionsProps) => {
  const router = useRouter();

  async function handleLogout() {
    await signOut({ redirect: true, callbackUrl: "/" });
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {/* دکمه جستجو در موبایل (بدون تغییر) */}
      <div className="lg:hidden">
        <Button size="icon" variant={"ghost"} onClick={onSearchClick}>
          <Search className="size-5" />
        </Button>
      </div>

      {/* مدال سبد خرید (بدون تغییر) */}
      <CartModal />

      {/* --- بخش پروفایل / ورود (تغییر یافته) --- */}
      {isLoading ? (
        // نمایش اسکلتون در زمان لود شدن وضعیت کاربر
        <Skeleton className="h-10 w-10 rounded-full" />
      ) : (
        // نمایش منوی پروفایل (همیشه)
        <DropdownMenu dir="rtl" modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant={"ghost"}>
              <User className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 text-right">
            {status === "authenticated" ? (
              //  === محتوای منو برای کاربر لاگین کرده ===
              <>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium leading-none">
                      {session?.user?.name || "کاربر"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session?.user?.phone}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {session?.user?.role === "SUPER_ADMIN" && (
                  <DropdownMenuItem
                    onClick={() => router.push("/super-admin")}
                    className="cursor-pointer flex items-center"
                  >
                    <LayoutDashboard className="ml-2 h-4 w-4" />
                    <span>پنل مدیریت</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => router.push("/account")}
                  className="cursor-pointer flex items-center"
                >
                  <User className="ml-2 h-4 w-4" />
                  <span>پروفایل</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/account?tab=orders")}
                  className="cursor-pointer flex items-center"
                >
                  <FileText className="ml-2 h-4 w-4" />
                  <span>سفارشات من</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/account?tab=addresses")}
                  className="cursor-pointer flex items-center"
                >
                  <MapPin className="ml-2 h-4 w-4" />
                  <span>آدرس‌های من</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 hover:!text-red-600 focus:!bg-red-50 focus:!text-red-600 cursor-pointer flex items-center"
                >
                  <LogOut className="ml-2 h-4 w-4" />
                  <span>خروج</span>
                </DropdownMenuItem>
              </>
            ) : (
              // === محتوای منو برای کاربر لاگین نکرده ===
              <DropdownMenuItem
                onClick={() => router.push("/auth/login")}
                className="cursor-pointer flex items-center"
              >
                <LogIn className="ml-2 h-4 w-4" />
                <span>ورود / ثبت‌نام</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {/* دکمه قبلی "ورود / ثبت‌نام" حذف شد */}
    </div>
  );
};

export default HeaderActions;

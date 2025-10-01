"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import { Search, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CartModal from "@/components/common/modal/CartModal";

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
      <div className="lg:hidden">
        <Button size="icon" variant={"ghost"} onClick={onSearchClick}>
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
              <DropdownMenuItem onClick={() => router.push("/super-admin")}>
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
  );
};

export default HeaderActions;

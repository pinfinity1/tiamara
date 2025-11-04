"use client";

import { useUserStore } from "@/store/useUserStore"; //
import { useSkinProfileModalStore } from "@/store/useSkinProfileModalStore"; //
import { Button } from "@/components/ui/button"; //
import { Skeleton } from "@/components/ui/skeleton"; //
import { useSession } from "next-auth/react";

export function SkinProfilePromptBanner() {
  const { status } = useSession();
  const { userProfile, isLoading } = useUserStore();
  const { onOpen } = useSkinProfileModalStore();

  const isLoggedIn = status === "authenticated";

  // این منطق لودینگ از GlobalProfileLoader پشتیبانی می‌کند
  // ما در حال "بررسی پروفایل" هستیم اگر:
  // ۱. سشن در حال لود شدن است
  // ۲. یا، سشن لاگین شده، اما ما هنوز آبجکت userProfile را از استور نگرفته‌ایم
  const isProfileCheckLoading =
    status === "loading" || (isLoggedIn && isLoading && !userProfile);

  // پروفایل کامل است اگر:
  // آبجکت userProfile وجود داشته باشد AND فیلد skinType داخل آن باشد
  const isProfileComplete = !!userProfile?.skinType;

  // ۱. اگر در حال لودینگ هستیم، یک اسکلتون کوچک نشان بده
  if (isProfileCheckLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  // ۲. اگر لاگین نکرده، یا پروفایلش کامل است، هیچی نشان نده
  if (!isLoggedIn || isProfileComplete) {
    return null;
  }

  // ۳. (حالت اصلی) لاگین کرده و پروفایل ناقص است: بنر را نشان بده
  return (
    <div className="bg-primary/10 dark:bg-primary/20 p-6 rounded-lg container mx-auto px-4 sm:px-6 lg:px-8 my-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-right">
          <h3 className="text-lg font-semibold text-primary dark:text-white">
            روتین شخصی خود را کشف کنید!
          </h3>
        </div>
        <Button
          onClick={onOpen} // <-- مودال ۱۰ مرحله‌ای را باز می‌کند
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0 w-full sm:w-auto"
        >
          شروع تکمیل پروفایل
        </Button>
      </div>
    </div>
  );
}

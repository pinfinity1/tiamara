"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/store/useUserStore";
import { useAuthModalStore } from "@/store/useAuthModalStore";
import { useAuthProcessStore } from "@/store/useAuthProcessStore";

export function GlobalProfileLoader() {
  const { data: session, status } = useSession();
  const { fetchProfile, userProfile, isLoading } = useUserStore();

  const { onOpen } = useAuthModalStore();
  const { setStep } = useAuthProcessStore();

  const fetchCalledRef = useRef(false);

  useEffect(() => {
    // اگر کاربر لاگین کرده (authenticated)
    if (status === "authenticated" && session) {
      // --- بخش قبلی شما (برای فچ کردن پروفایل) ---
      if (!userProfile && !isLoading && !fetchCalledRef.current) {
        fetchProfile();
        fetchCalledRef.current = true;
      }

      // --- !! ۳. بخش جدید (اجبار سراسری تنظیم رمز) !! ---
      // از سشن چک می‌کنیم که آیا کاربر نیاز به تنظیم رمز دارد یا نه
      if (session.user.requiresPasswordSetup) {
        setStep("force-password-setup"); // مودال را روی مرحله درست تنظیم کن
        onOpen(); // مودال را باز کن
      }
      // --- !! پایان بخش جدید !! ---
    }

    // اگر کاربر لاگ‌آوت کرد (unauthenticated)
    if (status === "unauthenticated" && userProfile) {
      useUserStore.setState({ userProfile: null });
      fetchCalledRef.current = false;
    }
  }, [
    status,
    session, // <-- سشن به وابستگی‌ها اضافه شد
    userProfile,
    isLoading,
    fetchProfile,
    // !! --- ۴. افزودن وابستگی‌های جدید --- !!
    onOpen,
    setStep,
  ]);

  // این کامپوننت هیچ چیزی را رندر نمی‌کند
  return null;
}

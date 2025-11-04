// project/client/src/components/common/GlobalProfileLoader.tsx
"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/store/useUserStore";

export function GlobalProfileLoader() {
  const { data: session, status } = useSession();
  const { fetchProfile, userProfile, isLoading } = useUserStore();

  // از useRef استفاده می‌کنیم تا مطمئن شویم fetchProfile فقط یک بار اجرا می‌شود
  const fetchCalledRef = useRef(false);

  useEffect(() => {
    // اگر کاربر لاگین کرده،
    // و پروفایل هنوز در استور نیست (null)،
    // و در حال حاضر در حال فچ شدن نیست،
    // و ما قبلاً درخواست فچ نداده‌ایم
    if (
      status === "authenticated" &&
      !userProfile &&
      !isLoading &&
      !fetchCalledRef.current
    ) {
      fetchProfile();
      fetchCalledRef.current = true; // ثبت می‌کنیم که درخواست داده شد
    }

    // اگر کاربر لاگ‌آوت کرد، پروفایل را از استور پاک می‌کنیم
    if (status === "unauthenticated" && userProfile) {
      useUserStore.setState({ userProfile: null });
      fetchCalledRef.current = false; // برای لاگین بعدی آماده شو
    }
  }, [status, userProfile, isLoading, fetchProfile]);

  // این کامپوننت هیچ چیزی را رندر نمی‌کند
  return null;
}

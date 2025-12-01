"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function AutoScrollTop() {
  const searchParams = useSearchParams();
  // استفاده از ref برای ذخیره پارامترهای قبلی جهت مقایسه (اختیاری ولی برای پرفورمنس خوب است)
  const prevParams = useRef(searchParams.toString());

  useEffect(() => {
    // پیدا کردن کانتینر اصلی که اسکرول دارد
    const mainContent = document.getElementById("main-content");

    if (mainContent) {
      // اسکرول نرم به بالا
      mainContent.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      // فال‌بک برای حالتی که اسکرول روی بادی باشد
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    prevParams.current = searchParams.toString();
  }, [searchParams]); // هر بار URL عوض شد اجرا شود

  return null; // این کامپوننت چیزی رندر نمی‌کند
}

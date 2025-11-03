import { useState, useEffect } from "react";

// نقطه‌ی شکست دسکتاپ ما (مطابق با Tailwind)
// md = 768px
const DESKTOP_BREAKPOINT = 768;

export const useIsDesktop = () => {
  // برای رندر اولیه (SSR) فرض را بر دسکتاپ می‌گذاریم
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    // این کد فقط در کلاینت (مرورگر) اجرا می‌شود
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    };

    // در اولین بارگیری، وضعیت را بررسی کن
    checkIsDesktop();

    // هر بار که اندازه صفحه تغییر کرد، دوباره بررسی کن
    window.addEventListener("resize", checkIsDesktop);

    // در زمان پاکسازی، شنونده رویداد را حذف کن
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  return isDesktop;
};

import { auth } from "@/auth";
import { NextResponse } from "next/server";

// مسیرهایی که حتماً نیاز به لاگین دارند
const protectedRoutes = ["/account"];
const superAdminRoutes = ["/super-admin"];

// مسیر چت (اختیاری)
const chatRoutes = ["/chat"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // وضعیت لاگین بودن کاربر
  const isLoggedIn = !!req.auth;
  // @ts-ignore
  const userRole = req.auth?.user?.role;

  const isChatFeatureEnabled = process.env.NEXT_PUBLIC_CHAT_ENABLED === "true";

  // ۱. حفاظت از مسیر چت (بر اساس تنظیمات محیطی)
  const isChatRoute = chatRoutes.some((route) => pathname.startsWith(route));
  if (isChatRoute && !isChatFeatureEnabled) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ۲. حفاظت از مسیرهای سوپر ادمین
  // اگر کسی بخواهد برود /super-admin و ادمین نباشد، پرت می‌شود بیرون
  const isAdminRoute = superAdminRoutes.some((route) =>
    pathname.startsWith(route)
  );
  if (isAdminRoute) {
    if (!isLoggedIn || userRole !== "SUPER_ADMIN") {
      // اگر لاگین نیست یا ادمین نیست، برود به لاگین
      // (یا می‌توانید به صفحه اصلی بفرستید: new URL("/", req.url))
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  // ۳. حفاظت از حساب کاربری (/account)
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // *** تغییر مهم: حذف محدودیت صفحه لاگین ***
  // قبلاً اینجا کدی بود که می‌گفت "اگر لاگین هستی، حق نداری صفحه لاگین را ببینی".
  // آن کد حذف شد تا اگر مشکلی پیش آمد، کاربر در لوپ گیر نکند و بتواند آزادانه رفتار کند.

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

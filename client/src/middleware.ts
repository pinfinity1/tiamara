import { auth } from "@/auth";
import { NextResponse } from "next/server";

// مسیرهایی که حتماً نیاز به لاگین دارند
const protectedRoutes = ["/account"];
const superAdminRoutes = ["/super-admin"];

// مسیرهای مربوط به احراز هویت (که کاربر لاگین شده نباید ببیند)
const authRoutes = ["/auth/login"];

// مسیر چت (اختیاری)
const chatRoutes = ["/chat"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // وضعیت لاگین بودن کاربر
  const isLoggedIn = !!req.auth;
  // @ts-ignore
  const userRole = req.auth?.user?.role;

  const isChatFeatureEnabled = process.env.NEXT_PUBLIC_CHAT_ENABLED === "true";

  // ۱. اگر کاربر لاگین است و می‌خواهد به صفحه لاگین برود، به خانه برگردد
  if (isLoggedIn && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ۲. حفاظت از مسیر چت
  const isChatRoute = chatRoutes.some((route) => pathname.startsWith(route));
  if (isChatRoute && !isChatFeatureEnabled) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ۳. حفاظت از مسیرهای سوپر ادمین
  const isAdminRoute = superAdminRoutes.some((route) =>
    pathname.startsWith(route)
  );
  if (isAdminRoute) {
    if (!isLoggedIn || userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  // ۴. حفاظت از حساب کاربری
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

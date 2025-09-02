import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// مسیرهایی که حتما نیاز به لاگین دارند
const protectedRoutes = ["/account", "/checkout", "/cart"];

// مسیرهایی که فقط ادمین به آن‌ها دسترسی دارد
const superAdminRoutes = ["/super-admin"];

// مسیرهای مربوط به احراز هویت
const authRoutes = ["/auth/login", "/auth/register"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const accessToken = request.cookies.get("accessToken")?.value;

    // ۱. بررسی دسترسی به مسیرهای محافظت‌شده برای کاربران لاگین نکرده
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
    const isAdminRoute = superAdminRoutes.some((route) => pathname.startsWith(route));

    if (!accessToken && (isProtectedRoute || isAdminRoute)) {
        // اگر کاربر لاگین نکرده و می‌خواهد به صفحه محافظت‌شده برود، به صفحه لاگین هدایتش کن
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // ۲. منطق برای کاربران لاگین کرده
    if (accessToken) {
        try {
            const { payload } = await jwtVerify(
                accessToken,
                new TextEncoder().encode(process.env.JWT_SECRET!),
                { algorithms: ["HS256"] }
            );
            const role = (payload as { role: string }).role;

            // اگر کاربر لاگین کرده و به صفحات لاگین/ثبت‌نام می‌رود، او را هدایت کن
            if (authRoutes.some(route => pathname.startsWith(route))) {
                const url = role === "SUPER_ADMIN" ? "/super-admin" : "/home";
                return NextResponse.redirect(new URL(url, request.url));
            }

            // اگر کاربر عادی است و می‌خواهد به پنل ادمین برود، او را به صفحه اصلی هدایت کن
            if (isAdminRoute && role !== "SUPER_ADMIN") {
                return NextResponse.redirect(new URL("/home", request.url));
            }

        } catch (error) {
            // اگر توکن نامعتبر بود، کوکی‌ها را پاک کن
            console.error("Token verification failed, clearing cookies.", error);
            const response = NextResponse.next();
            response.cookies.delete("accessToken");
            response.cookies.delete("refreshToken");

            // اگر در حال تلاش برای دسترسی به صفحه محافظت شده بود، به لاگین هدایتش کن
            if (isProtectedRoute || isAdminRoute) {
                return NextResponse.redirect(new URL("/auth/login", request.url));
            }
            return response;
        }
    }

    // ۳. اگر هیچ‌کدام از شرایط بالا برقرار نبود، اجازه دسترسی بده (برای صفحات عمومی)
    return NextResponse.next();
}

export const config = {
    // این matcher تمام مسیرها را به جز فایل‌های استاتیک و api بررسی می‌کند
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
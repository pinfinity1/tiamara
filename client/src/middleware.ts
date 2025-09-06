import { auth } from "@/auth";
import { NextResponse } from "next/server";

const protectedRoutes = ["/account", "/checkout", "/cart"];
const superAdminRoutes = ["/super-admin"];
const authRoutes = ["/auth/login"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  // @ts-ignore
  const userRole = req.auth?.user?.role;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = superAdminRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if ((isProtectedRoute || isAdminRoute) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (isAuthRoute && isLoggedIn) {
    const url = userRole === "SUPER_ADMIN" ? "/super-admin" : "/";
    return NextResponse.redirect(new URL(url, req.url));
  }

  if (isAdminRoute && userRole !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

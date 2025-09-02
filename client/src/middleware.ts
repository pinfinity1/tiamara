import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const protectedRoutes = ["/account", "/checkout", "/cart"];
const superAdminRoutes = ["/super-admin"];
const authRoutes = ["/auth/login", "/auth/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = superAdminRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!accessToken && (isProtectedRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (accessToken) {
    try {
      const { payload } = await jwtVerify(
        accessToken,
        new TextEncoder().encode(process.env.JWT_SECRET!),
        { algorithms: ["HS256"] }
      );
      const role = (payload as { role: string }).role;

      if (authRoutes.some((route) => pathname.startsWith(route))) {
        const url = role === "SUPER_ADMIN" ? "/super-admin" : "/home";
        return NextResponse.redirect(new URL(url, request.url));
      }

      if (isAdminRoute && role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/home", request.url));
      }
    } catch (error) {
      console.error("Token verification failed, clearing cookies.", error);
      const response = NextResponse.next();
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");

      if (isProtectedRoute || isAdminRoute) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

"use client";
import { useCartStore } from "@/store/useCartStore";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import FullPageLoader from "@/components/common/FullPageLoader"; // <--- ایمپورت جدید

const SessionManager = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const { fetchCart } = useCartStore();
  const pathname = usePathname();
  const router = useRouter();
  const isSigningOut = useRef(false);

  // منطق خروج (که در پاسخ قبلی اصلاح کردیم)
  useEffect(() => {
    // @ts-ignore
    if (session?.error === "RefreshAccessTokenError" && !isSigningOut.current) {
      isSigningOut.current = true;
      signOut({ redirect: false }).then(() => {
        if (pathname.includes("/account") || pathname.includes("/checkout")) {
          router.push("/auth/login");
        } else {
          router.refresh();
        }
        isSigningOut.current = false;
      });
    }
  }, [session, pathname, router]);

  // دریافت سبد خرید
  useEffect(() => {
    if (status === "authenticated") {
      fetchCart();
    }
  }, [status, fetchCart]);

  // !! --- بخش جدید: نمایش لودینگ --- !!
  // وقتی کاربر بعد از چند ساعت می‌آید، NextAuth ابتدا در حالت 'loading' است
  // تا زمانی که توکن را چک کند. در این فاصله ما لودینگ نشان می‌دهیم.
  if (status === "loading") {
    return <FullPageLoader />;
  }

  return <>{children}</>;
};

export default function NextAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SessionManager>{children}</SessionManager>
    </SessionProvider>
  );
}

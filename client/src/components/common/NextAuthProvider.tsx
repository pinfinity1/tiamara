"use client";
import { useCartStore } from "@/store/useCartStore";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import FullPageLoader from "./FullPageLoader";

const SessionManager = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const { fetchCart } = useCartStore();
  const pathname = usePathname();
  const router = useRouter();
  const isSigningOut = useRef(false);

  // منطق خروج
  useEffect(() => {
    // @ts-ignore
    if (session?.error === "RefreshAccessTokenError" && !isSigningOut.current) {
      isSigningOut.current = true;
      // وقتی توکن خراب است، فقط خارج شویم. رفرش نکنیم!
      signOut({ redirect: false }).then(() => {
        // فقط اگر کاربر در صفحات محافظت شده بود، او را به لاگین ببر
        if (pathname.includes("/account") || pathname.includes("/checkout")) {
          router.push("/auth/login");
        }
        // نکته مهم: خط router.refresh() را حذف کردیم تا لوپ درست نشود
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

  // !! --- حذف لودینگ تمام صفحه --- !!
  // این بخش باعث پرش سفید (Flicker) می‌شد. آن را حذف می‌کنیم تا سایت بلافاصله نمایش داده شود.
  // حتی اگر هنوز وضعیت لاگین مشخص نباشد، هدر و فوتر دیده می‌شوند که تجربه بهتری است.
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

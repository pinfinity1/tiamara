"use client";
import { useCartStore } from "@/store/useCartStore";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SessionManager = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const { fetchCart } = useCartStore();
  const pathname = usePathname();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      console.warn("Session expired. Signing out to Homepage...");

      // ✅ اصلاح مهم: هدایت به صفحه اصلی (/) به جای لاگین
      signOut({
        callbackUrl: "/", // کاربر به صفحه خانه می‌رود و مهمان می‌شود
        redirect: true,
      });
    }
  }, [session, pathname]);

  useEffect(() => {
    if (status !== "loading") {
      fetchCart();
    }
  }, [status, fetchCart]);

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

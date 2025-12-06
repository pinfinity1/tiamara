"use client";

import { useCartStore } from "@/store/useCartStore";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Session } from "next-auth";

const SessionManager = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const { fetchCart } = useCartStore();
  const pathname = usePathname();
  const router = useRouter();
  const isSigningOut = useRef(false);

  // لاجیک خروج در صورت خرابی توکن
  useEffect(() => {
    // @ts-ignore
    if (session?.error === "RefreshAccessTokenError" && !isSigningOut.current) {
      isSigningOut.current = true;
      signOut({ redirect: false }).then(() => {
        if (pathname.includes("/account") || pathname.includes("/checkout")) {
          router.push("/auth/login");
        }
        isSigningOut.current = false;
      });
    }
  }, [session, pathname, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchCart();
    }
  }, [status, fetchCart]);

  return <>{children}</>;
};

export default function NextAuthProvider({
  children,
  session, // <--- دریافت سشن از پراپس
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    // پاس دادن سشن به SessionProvider برای جلوگیری از لودینگ اولیه کلاینت
    <SessionProvider session={session}>
      <SessionManager>{children}</SessionManager>
    </SessionProvider>
  );
}

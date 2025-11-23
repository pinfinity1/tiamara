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
    if (
      session?.error === "RefreshAccessTokenError" &&
      pathname !== "/auth/login"
    ) {
      console.warn("Session expired. Redirecting to login...");
      signOut({
        callbackUrl: "/auth/login",
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

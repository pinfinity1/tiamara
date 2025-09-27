"use client";

import { useCartStore } from "@/store/useCartStore";
import { SessionProvider, useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useEffect } from "react";

const SessionManager = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const { fetchCart, clearLocalCart } = useCartStore();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signOut({
        callbackUrl: "/",
        redirect: true,
      });
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchCart();
    }
    if (status === "unauthenticated") {
      clearLocalCart();
    }
  }, [status, fetchCart, clearLocalCart]);

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

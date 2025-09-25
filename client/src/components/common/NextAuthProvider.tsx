"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useEffect } from "react";

const SessionErrorHandler = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signOut({
        callbackUrl: "/",
        redirect: true,
      });
    }
  }, [session]);

  return <>{children}</>;
};

export default function NextAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SessionErrorHandler>{children}</SessionErrorHandler>
    </SessionProvider>
  );
}

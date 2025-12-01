"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/store/useUserStore";

export function GlobalProfileLoader() {
  const { data: session, status } = useSession();
  const { fetchProfile, userProfile, isLoading } = useUserStore();

  const fetchCalledRef = useRef(false);

  useEffect(() => {
    if (status === "authenticated" && session) {
      if (!userProfile && !isLoading && !fetchCalledRef.current) {
        fetchProfile();
        fetchCalledRef.current = true;
      }
    }

    if (status === "unauthenticated" && userProfile) {
      useUserStore.setState({ userProfile: null });
      fetchCalledRef.current = false;
    }
  }, [status, session, userProfile, isLoading, fetchProfile]);

  return null;
}

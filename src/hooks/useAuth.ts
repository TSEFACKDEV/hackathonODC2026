"use client";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuth(redirectTo = "/login") {
  const { user, token } = useSelector((s: RootState) => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (!user || !token) {
      const currentPath = window.location.pathname + window.location.search + window.location.hash;
      router.replace(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, token, router, redirectTo]);

  return { user, token, isAuthenticated: !!user && !!token };
}

export function useRequireRole(roles: string[], redirectTo = "/") {
  const { user } = useSelector((s: RootState) => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    if (!roles.includes(user.role)) router.replace(redirectTo);
  }, [user, router, roles, redirectTo]);

  return { user };
}
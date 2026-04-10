"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children, reqRole }: { children: React.ReactNode, reqRole?: "admin" | "trainer" }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || !profile) {
        router.push("/login");
      } else if (reqRole && profile.role !== reqRole && profile.role !== "admin") {
        router.push("/");
      }
    }
  }, [user, profile, loading, router, reqRole]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (!user || !profile || (reqRole && profile.role !== reqRole && profile.role !== "admin")) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}

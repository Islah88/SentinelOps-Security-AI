"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && !user) router.push("/login"); }, [user, loading, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="flex flex-col items-center gap-4"><div className="w-10 h-10 border-2 border-accent-amber border-t-transparent rounded-full animate-spin" /><span className="text-sm text-text-secondary">Chargement...</span></div></div>;
  if (!user) return null;
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 lg:ml-[260px]"><Header /><main className="p-4 lg:p-6">{children}</main></div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider><DashboardGuard>{children}</DashboardGuard></AuthProvider>;
}

"use client";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="h-16 border-b border-border-subtle bg-bg-surface/60 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="pl-10 lg:pl-0">
        <h2 className="text-sm font-medium text-text-secondary">Bienvenue, <span className="text-text-primary font-semibold">{user?.full_name || user?.email || "Manager"}</span></h2>
      </div>
      <div className="flex items-center gap-2 lg:gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-border-glass">
          <User className="w-4 h-4 text-text-secondary" />
          <span className="text-xs text-text-secondary font-medium">{user?.role?.toUpperCase()}</span>
        </div>
        <button onClick={logout} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-text-muted hover:text-accent-red hover:bg-accent-red/5 transition-all cursor-pointer" title="Déconnexion">
          <LogOut className="w-4 h-4" /><span className="text-xs font-medium hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}

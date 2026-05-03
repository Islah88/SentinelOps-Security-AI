"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Calendar, Users, AlertTriangle, ShieldCheck, ChevronLeft, ChevronRight, Siren, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/planning", label: "Planning", icon: Calendar },
  { href: "/dashboard/agents", label: "Agents", icon: Users },
  { href: "/dashboard/incidents", label: "Incidents", icon: AlertTriangle },
  { href: "/dashboard/compliance", label: "Conformité CNAPS", icon: ShieldCheck },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const sidebarContent = (isMobile: boolean) => (
    <>
      <div className="h-16 flex items-center justify-between gap-3 px-4 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-amber to-accent-red flex items-center justify-center shrink-0">
            <Siren className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {(isMobile || !collapsed) && (
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="text-lg font-bold gradient-text-sentinel whitespace-nowrap">SentinelOps</motion.span>
            )}
          </AnimatePresence>
        </div>
        {isMobile && <button onClick={() => setMobileOpen(false)} className="text-text-muted hover:text-text-primary cursor-pointer"><X className="w-5 h-5" /></button>}
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive ? "bg-gradient-to-r from-accent-amber/15 to-accent-red/15 text-accent-amber border border-accent-amber/20" : "text-text-secondary hover:text-text-primary hover:bg-white/5")}>
              <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-accent-amber" : "")} />
              <AnimatePresence>{(isMobile || !collapsed) && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">{item.label}</motion.span>}</AnimatePresence>
            </Link>
          );
        })}
      </nav>
      {!isMobile && (
        <div className="p-3 border-t border-border-subtle">
          <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-text-muted hover:text-text-secondary hover:bg-white/5 transition-colors cursor-pointer">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span className="text-xs">Réduire</span></>}
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl glass text-text-secondary hover:text-text-primary cursor-pointer">
        <Menu className="w-5 h-5" />
      </button>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/60 z-40 lg:hidden" />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-0 left-0 h-screen w-[260px] z-50 flex flex-col border-r border-border-subtle bg-bg-surface lg:hidden">
              {sidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <motion.aside animate={{ width: collapsed ? 72 : 260 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex fixed top-0 left-0 h-screen z-40 flex-col border-r border-border-subtle bg-bg-surface/80 backdrop-blur-xl">
        {sidebarContent(false)}
      </motion.aside>
    </>
  );
}

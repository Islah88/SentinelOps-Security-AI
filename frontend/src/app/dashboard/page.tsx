"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, MapPin, Calendar, AlertTriangle, ShieldCheck, Clock } from "lucide-react";
import { api } from "@/lib/api";
import type { Dashboard, Incident } from "@/lib/api";
import { GlassCard } from "@/components/ui/glass-card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { timeAgo, severityColor, statusLabel, statusColor } from "@/lib/utils";

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getDashboard().then(setData).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="space-y-6"><div className="h-8 w-48 shimmer rounded-lg" /><div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 shimmer rounded-2xl" />)}</div></div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-sm text-text-secondary mt-1">Vue d&apos;ensemble de vos opérations de sécurité</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Agents total" value={data.total_agents} icon={Users} color="amber" delay={0} />
        <StatCard label="En service" value={data.agents_on_duty} icon={UserCheck} color="green" delay={0.05} />
        <StatCard label="Sites actifs" value={data.total_sites} icon={MapPin} color="cyan" delay={0.1} />
        <StatCard label="Vacations aujourd'hui" value={data.active_shifts_today} icon={Calendar} color="violet" delay={0.15} />
        <StatCard label="Incidents ouverts" value={data.open_incidents} icon={AlertTriangle} color={data.open_incidents > 0 ? "red" : "green"} delay={0.2} />
        <StatCard label="Expirations proches" value={data.upcoming_expirations} icon={Clock} color={data.upcoming_expirations > 0 ? "orange" : "green"} delay={0.25} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Rate */}
        <GlassCard glow="amber" delay={0.1}>
          <h3 className="text-lg font-semibold mb-4">Conformité CNAPS</h3>
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(220,15%,15%)" strokeWidth="8" />
                <motion.circle cx="50" cy="50" r="42" fill="none" stroke={data.compliance_rate >= 80 ? "hsl(155,70%,50%)" : data.compliance_rate >= 60 ? "hsl(38,92%,55%)" : "hsl(0,75%,55%)"} strokeWidth="8" strokeLinecap="round" strokeDasharray={264} initial={{ strokeDashoffset: 264 }} animate={{ strokeDashoffset: 264 - (data.compliance_rate / 100) * 264 }} transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{data.compliance_rate}%</span>
                <span className="text-[10px] text-text-muted">Taux</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                <span className="text-xs text-text-secondary">Agents conformes</span>
                <Badge variant="success">{data.total_agents - (data.upcoming_expirations || 0)}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                <span className="text-xs text-text-secondary">Expirations &lt; 60j</span>
                <Badge variant={data.upcoming_expirations > 0 ? "warning" : "success"}>{data.upcoming_expirations}</Badge>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Recent Incidents */}
        <GlassCard delay={0.2}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Incidents récents</h3>
            {data.open_incidents > 0 && <Badge variant="danger">{data.open_incidents} ouverts</Badge>}
          </div>
          <div className="space-y-3">
            {data.recent_incidents.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">Aucun incident récent 🎉</p>
            ) : data.recent_incidents.map((inc, i) => (
              <motion.div key={inc.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }} className="p-3 rounded-xl bg-white/[0.02] border border-border-glass flex items-start gap-3">
                <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${inc.severity === "critical" || inc.severity === "high" ? "text-accent-red" : "text-accent-amber"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-medium truncate">{inc.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${severityColor(inc.severity)}`}>{inc.severity}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColor(inc.status)}`}>{statusLabel(inc.status)}</span>
                    <span className="text-[10px] text-text-muted">{timeAgo(inc.reported_at)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import type { ComplianceOverview, CNAPSRecord } from "@/lib/api";
import { GlassCard } from "@/components/ui/glass-card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { statusColor, statusLabel } from "@/lib/utils";

const typeLabels: Record<string, string> = { card_renewal: "Renouvellement carte", mac_training: "Recyclage MAC", ssiap_renewal: "Recyclage SSIAP", sst_renewal: "Recyclage SST" };

export default function CompliancePage() {
  const [data, setData] = useState<ComplianceOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getCompliance().then(setData).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 shimmer rounded-2xl" />)}</div>;
  if (!data) return null;

  const complianceRate = data.total_agents > 0 ? Math.round((data.compliant_agents / data.total_agents) * 100) : 100;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-2xl font-bold">Conformité CNAPS</h1>
        <p className="text-sm text-text-secondary mt-1">Suivi des cartes professionnelles et formations obligatoires</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Agents total" value={data.total_agents} icon={ShieldCheck} color="amber" delay={0} />
        <StatCard label="Conformes" value={data.compliant_agents} icon={CheckCircle2} color="green" delay={0.05} />
        <StatCard label="Expire < 30j" value={data.expiring_soon_30d} icon={AlertCircle} color={data.expiring_soon_30d > 0 ? "red" : "green"} delay={0.1} />
        <StatCard label="Expire < 60j" value={data.expiring_soon_60d} icon={Clock} color={data.expiring_soon_60d > 0 ? "orange" : "green"} delay={0.15} />
        <StatCard label="En retard" value={data.overdue} icon={AlertCircle} color={data.overdue > 0 ? "red" : "green"} delay={0.2} />
      </div>

      <GlassCard glow="amber" delay={0.1}>
        <h3 className="text-lg font-semibold mb-4">Taux de conformité global</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">{data.compliant_agents} / {data.total_agents} agents conformes</span>
            <span className="font-bold text-lg">{complianceRate}%</span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
            <motion.div className={`h-full rounded-full ${complianceRate >= 80 ? "bg-accent-green" : complianceRate >= 60 ? "bg-accent-amber" : "bg-accent-red"}`} initial={{ width: 0 }} animate={{ width: `${complianceRate}%` }} transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }} />
          </div>
        </div>
      </GlassCard>

      <GlassCard delay={0.2}>
        <h3 className="text-lg font-semibold mb-4">Échéances et formations</h3>
        {data.records.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">Aucune échéance enregistrée</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border-subtle">
                <th className="text-left py-3 px-2 text-text-muted font-medium">Type</th>
                <th className="text-left py-3 px-2 text-text-muted font-medium">Description</th>
                <th className="text-left py-3 px-2 text-text-muted font-medium">Échéance</th>
                <th className="text-left py-3 px-2 text-text-muted font-medium">Statut</th>
              </tr></thead>
              <tbody>
                {data.records.map((r) => (
                  <tr key={r.id} className="border-b border-border-subtle/50 hover:bg-white/[0.02]">
                    <td className="py-3 px-2 font-medium">{typeLabels[r.record_type] || r.record_type}</td>
                    <td className="py-3 px-2 text-text-secondary">{r.description || "—"}</td>
                    <td className="py-3 px-2">{new Date(r.due_date).toLocaleDateString("fr-FR")}</td>
                    <td className="py-3 px-2"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(r.status)}`}>{statusLabel(r.status)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

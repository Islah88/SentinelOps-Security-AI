"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Shield, Clock, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import type { Agent } from "@/lib/api";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { statusColor, statusLabel } from "@/lib/utils";

function cnapsStatus(expiry: string | null): { label: string; variant: string; icon: typeof Clock } {
  if (!expiry) return { label: "Non renseigné", variant: "default", icon: AlertCircle };
  const d = new Date(expiry); const diff = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (diff < 0) return { label: "Expirée", variant: "danger", icon: AlertCircle };
  if (diff < 30) return { label: `Expire dans ${Math.ceil(diff)}j`, variant: "danger", icon: Clock };
  if (diff < 60) return { label: `Expire dans ${Math.ceil(diff)}j`, variant: "warning", icon: Clock };
  return { label: "Valide", variant: "success", icon: Shield };
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getAgents().then(setAgents).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 shimmer rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-2xl font-bold">Agents de sécurité</h1>
        <p className="text-sm text-text-secondary mt-1">{agents.length} agents enregistrés</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {agents.map((a, i) => {
          const cnaps = cnapsStatus(a.cnaps_card_expiry);
          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard hover className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-amber/20 to-accent-red/20 border border-accent-amber/20 flex items-center justify-center text-accent-amber font-bold text-sm">
                      {a.first_name[0]}{a.last_name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold">{a.first_name} {a.last_name}</h3>
                      <p className="text-xs text-text-muted">{a.phone || "—"}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(a.status)}`}>{statusLabel(a.status)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={cnaps.variant}><cnaps.icon className="w-3 h-3" />{cnaps.label}</Badge>
                  {a.cnaps_card_type && <Badge>{a.cnaps_card_type}</Badge>}
                </div>

                {a.qualifications && a.qualifications.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {a.qualifications.map((q) => (
                      <span key={q} className="px-2 py-0.5 rounded-lg bg-white/5 text-[10px] font-semibold text-text-secondary border border-border-glass">{q}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border-subtle">
                  <span>Max {a.max_weekly_hours}h/sem</span>
                  {a.hourly_rate && <span>{a.hourly_rate.toFixed(2)}€/h</span>}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

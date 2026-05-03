"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Plus, Sparkles, X } from "lucide-react";
import { api } from "@/lib/api";
import type { Incident, IncidentCreate, Site } from "@/lib/api";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { timeAgo, severityColor, statusColor, statusLabel } from "@/lib/utils";

const typeLabels: Record<string, string> = { intrusion: "Intrusion", theft: "Vol", fire: "Incendie", medical: "Médical", vandalism: "Vandalisme", suspicious: "Suspect", other: "Autre" };

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<IncidentCreate>({ incident_type: "suspicious", severity: "medium", title: "", raw_report: "" });
  const [selectedInc, setSelectedInc] = useState<Incident | null>(null);

  useEffect(() => { Promise.all([api.getIncidents(), api.getSites()]).then(([i, s]) => { setIncidents(i); setSites(s); }).catch(console.error).finally(() => setLoading(false)); }, []);

  const handleCreate = async () => {
    if (!form.title) return;
    setCreating(true);
    try { const inc = await api.createIncident(form); setIncidents((p) => [inc, ...p]); setShowForm(false); setForm({ incident_type: "suspicious", severity: "medium", title: "", raw_report: "" }); }
    catch (e) { console.error(e); }
    finally { setCreating(false); }
  };

  const siteName = (id: string | null) => sites.find((s) => s.id === id)?.name || "—";

  if (loading) return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 shimmer rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-start justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold">Incidents</h1><p className="text-sm text-text-secondary mt-1">{incidents.length} incidents enregistrés</p></div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" />Signaler</Button>
      </motion.div>

      {showForm && (
        <GlassCard delay={0}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Nouveau signalement</h3>
            <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-primary cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Titre de l'incident" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-4 py-3 rounded-xl bg-white/5 border border-border-glass text-sm outline-none focus:border-accent-amber/50" />
            <select value={form.incident_type} onChange={(e) => setForm({ ...form, incident_type: e.target.value })} className="px-4 py-3 rounded-xl bg-white/5 border border-border-glass text-sm outline-none cursor-pointer">
              {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k} className="bg-bg-card">{v}</option>)}
            </select>
            <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="px-4 py-3 rounded-xl bg-white/5 border border-border-glass text-sm outline-none cursor-pointer">
              <option value="low" className="bg-bg-card">Faible</option><option value="medium" className="bg-bg-card">Moyen</option><option value="high" className="bg-bg-card">Élevé</option><option value="critical" className="bg-bg-card">Critique</option>
            </select>
            <select value={form.site_id || ""} onChange={(e) => setForm({ ...form, site_id: e.target.value || undefined })} className="px-4 py-3 rounded-xl bg-white/5 border border-border-glass text-sm outline-none cursor-pointer">
              <option value="" className="bg-bg-card">Site (optionnel)</option>
              {sites.map((s) => <option key={s.id} value={s.id} className="bg-bg-card">{s.name}</option>)}
            </select>
          </div>
          <textarea placeholder="Rapport brut (l'IA structurera automatiquement)..." value={form.raw_report} onChange={(e) => setForm({ ...form, raw_report: e.target.value })} rows={3} className="w-full mt-4 px-4 py-3 rounded-xl bg-white/5 border border-border-glass text-sm outline-none focus:border-accent-amber/50 resize-none" />
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Annuler</Button>
            <Button onClick={handleCreate} loading={creating}><Sparkles className="w-4 h-4" />Signaler avec IA</Button>
          </div>
        </GlassCard>
      )}

      <div className="space-y-3">
        {incidents.map((inc, i) => (
          <motion.div key={inc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <div className="glass glass-hover rounded-xl p-4 cursor-pointer" onClick={() => setSelectedInc(selectedInc?.id === inc.id ? null : inc)}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${inc.severity === "critical" || inc.severity === "high" ? "text-accent-red" : "text-accent-amber"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-semibold truncate">{inc.title}</h4>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={inc.severity === "critical" || inc.severity === "high" ? "danger" : inc.severity === "medium" ? "warning" : "success"}>{typeLabels[inc.incident_type] || inc.incident_type}</Badge>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${severityColor(inc.severity)}`}>{inc.severity}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-text-muted">
                    <span className={`px-1.5 py-0.5 rounded font-medium ${statusColor(inc.status)}`}>{statusLabel(inc.status)}</span>
                    <span>{siteName(inc.site_id)}</span>
                    <span>{timeAgo(inc.reported_at)}</span>
                  </div>
                </div>
              </div>
              {selectedInc?.id === inc.id && inc.ai_structured_report && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-border-glass text-sm space-y-2">
                  <p className="text-xs font-semibold text-accent-amber">📋 Rapport IA structuré</p>
                  {Object.entries(inc.ai_structured_report).map(([k, v]) => (
                    <div key={k} className="flex gap-2 text-xs">
                      <span className="text-text-muted font-medium min-w-[100px]">{k}:</span>
                      <span className="text-text-secondary">{Array.isArray(v) ? (v as string[]).join(", ") : String(v)}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Sparkles, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import type { Shift, Agent, Site } from "@/lib/api";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { statusColor, statusLabel } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const SHIFT_COLORS = ["bg-accent-amber/20 border-accent-amber/40", "bg-accent-cyan/20 border-accent-cyan/40", "bg-accent-green/20 border-accent-green/40", "bg-accent-violet/20 border-accent-violet/40", "bg-accent-red/20 border-accent-red/40"];

function getWeekDates(base: Date) {
  const d = new Date(base); d.setDate(d.getDate() - d.getDay() + 1);
  return Array.from({ length: 7 }, (_, i) => { const dd = new Date(d); dd.setDate(d.getDate() + i); return dd; });
}

function toISO(d: Date) { return d.toISOString().split("T")[0]; }

export default function PlanningPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [weekBase, setWeekBase] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState<{ created: number; conflicts: string[]; warnings: string[] } | null>(null);

  const week = getWeekDates(weekBase);
  const dayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  useEffect(() => {
    setLoading(true);
    Promise.all([api.getShifts(), api.getAgents(), api.getSites()])
      .then(([s, a, si]) => { setShifts(s); setAgents(a); setSites(si); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleGenerate = async () => {
    setGenerating(true); setGenResult(null);
    try {
      const res = await api.generatePlanning({ start_date: toISO(week[0]), end_date: toISO(week[6]) });
      setShifts((prev) => [...prev, ...res.shifts]);
      setGenResult({ created: res.shifts_created, conflicts: res.conflicts, warnings: res.warnings });
    } catch (e) { console.error(e); }
    finally { setGenerating(false); }
  };

  const agentName = (id: string) => { const a = agents.find((x) => x.id === id); return a ? `${a.first_name} ${a.last_name.charAt(0)}.` : id.slice(0, 6); };
  const siteName = (id: string) => sites.find((x) => x.id === id)?.name || id.slice(0, 6);
  const siteColor = (id: string) => { const idx = sites.findIndex((x) => x.id === id); return SHIFT_COLORS[idx % SHIFT_COLORS.length]; };

  const shiftsForDay = (d: Date) => shifts.filter((s) => s.shift_date === toISO(d));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Planning</h1>
          <p className="text-sm text-text-secondary mt-1">Gestion des vacations — Vue semaine</p>
        </div>
        <Button onClick={handleGenerate} loading={generating}><Sparkles className="w-4 h-4" />Générer avec l&apos;IA</Button>
      </motion.div>

      {/* Week navigation */}
      <GlassCard delay={0.05} className="!p-3">
        <div className="flex items-center justify-between">
          <button onClick={() => { const d = new Date(weekBase); d.setDate(d.getDate() - 7); setWeekBase(d); }} className="p-2 rounded-lg hover:bg-white/5 text-text-secondary cursor-pointer"><ChevronLeft className="w-5 h-5" /></button>
          <span className="text-sm font-semibold">{week[0].toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} — {week[6].toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
          <button onClick={() => { const d = new Date(weekBase); d.setDate(d.getDate() + 7); setWeekBase(d); }} className="p-2 rounded-lg hover:bg-white/5 text-text-secondary cursor-pointer"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </GlassCard>

      {genResult && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-4 rounded-xl bg-accent-green/5 border border-accent-green/20 space-y-2">
          <p className="text-sm font-semibold text-accent-green">✅ {genResult.created} vacations générées par l&apos;IA</p>
          {genResult.conflicts.length > 0 && <div className="text-xs text-accent-amber">{genResult.conflicts.map((c, i) => <p key={i}>⚠️ {c}</p>)}</div>}
          {genResult.warnings.length > 0 && <div className="text-xs text-text-secondary">{genResult.warnings.map((w, i) => <p key={i}>ℹ️ {w}</p>)}</div>}
        </motion.div>
      )}

      {/* Calendar grid */}
      {loading ? <div className="grid grid-cols-7 gap-2">{Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-64 shimmer rounded-2xl" />)}</div> : (
        <div className="grid grid-cols-7 gap-2">
          {week.map((day, di) => {
            const dayShifts = shiftsForDay(day);
            const isToday = toISO(day) === toISO(new Date());
            return (
              <motion.div key={di} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: di * 0.04 }}
                className={`glass rounded-xl p-3 min-h-[280px] ${isToday ? "border-accent-amber/30" : ""}`}>
                <div className={`text-center mb-3 pb-2 border-b border-border-subtle ${isToday ? "text-accent-amber" : "text-text-secondary"}`}>
                  <p className="text-xs font-medium">{dayLabels[di]}</p>
                  <p className={`text-lg font-bold ${isToday ? "text-accent-amber" : "text-text-primary"}`}>{day.getDate()}</p>
                </div>
                <div className="space-y-1.5">
                  {dayShifts.length === 0 ? <p className="text-[10px] text-text-muted text-center mt-4">Aucune vacation</p> : dayShifts.map((s) => (
                    <div key={s.id} className={`p-2 rounded-lg border text-[10px] space-y-0.5 ${siteColor(s.site_id)}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-text-primary">{s.start_time}–{s.end_time}</span>
                        {s.is_ai_generated && <span className="text-accent-amber">IA</span>}
                      </div>
                      <p className="text-text-secondary truncate">{agentName(s.agent_id)}</p>
                      <p className="text-text-muted truncate">{siteName(s.site_id)}</p>
                      <span className={`inline-block px-1 py-0.5 rounded text-[9px] font-semibold ${statusColor(s.status)}`}>{statusLabel(s.status)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

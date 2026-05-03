"use client";
import { motion, useMotionValue, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps { label: string; value: number; icon: LucideIcon; color?: "amber" | "red" | "green" | "cyan" | "orange" | "violet"; suffix?: string; delay?: number; }

const colorMap: Record<string, { icon: string; bg: string; border: string }> = {
  amber: { icon: "text-accent-amber", bg: "bg-accent-amber/10", border: "border-accent-amber/20" },
  red: { icon: "text-accent-red", bg: "bg-accent-red/10", border: "border-accent-red/20" },
  green: { icon: "text-accent-green", bg: "bg-accent-green/10", border: "border-accent-green/20" },
  cyan: { icon: "text-accent-cyan", bg: "bg-accent-cyan/10", border: "border-accent-cyan/20" },
  orange: { icon: "text-accent-orange", bg: "bg-accent-orange/10", border: "border-accent-orange/20" },
  violet: { icon: "text-accent-violet", bg: "bg-accent-violet/10", border: "border-accent-violet/20" },
};

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const count = useMotionValue(0);
  useEffect(() => {
    const controls = animate(count, value, { duration: 1.5, ease: [0.4, 0, 0.2, 1] });
    const unsub = count.on("change", (v) => setDisplay(Math.round(v)));
    return () => { controls.stop(); unsub(); };
  }, [count, value]);
  return <span className="text-3xl font-bold tracking-tight">{display}{suffix && <span className="text-lg text-text-secondary ml-0.5">{suffix}</span>}</span>;
}

export function StatCard({ label, value, icon: Icon, color = "amber", suffix, delay = 0 }: StatCardProps) {
  const c = colorMap[color] || colorMap.amber;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}
      className="glass glass-hover rounded-2xl p-5 flex items-start justify-between gap-4">
      <div className="space-y-2">
        <p className="text-sm text-text-secondary font-medium">{label}</p>
        <AnimatedNumber value={value} suffix={suffix} />
      </div>
      <div className={cn("p-3 rounded-xl border", c.bg, c.border)}>
        <Icon className={cn("w-5 h-5", c.icon)} />
      </div>
    </motion.div>
  );
}

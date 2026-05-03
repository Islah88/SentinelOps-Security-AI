import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

const variants: Record<string, string> = {
  default: "bg-white/5 text-text-secondary border-border-glass",
  success: "bg-accent-green/10 text-accent-green border-accent-green/30",
  warning: "bg-accent-amber/10 text-accent-amber border-accent-amber/30",
  danger: "bg-accent-red/10 text-accent-red border-accent-red/30",
  info: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30",
  orange: "bg-accent-orange/10 text-accent-orange border-accent-orange/30",
};

export function Badge({ children, variant = "default", className }: { children: ReactNode; variant?: string; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border", variants[variant] || variants.default, className)}>{children}</span>;
}

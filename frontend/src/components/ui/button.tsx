import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { children: ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md" | "lg"; loading?: boolean; }

const vs: Record<string, string> = {
  primary: "bg-gradient-to-r from-accent-amber to-accent-red text-white shadow-lg shadow-accent-amber/20 hover:shadow-accent-amber/30 hover:brightness-110",
  secondary: "glass border border-border-glass text-text-primary hover:bg-white/10",
  ghost: "text-text-secondary hover:text-text-primary hover:bg-white/5",
  danger: "bg-accent-red/10 text-accent-red border border-accent-red/30 hover:bg-accent-red/20",
};
const ss: Record<string, string> = { sm: "px-3 py-1.5 text-xs rounded-lg", md: "px-5 py-2.5 text-sm rounded-xl", lg: "px-7 py-3.5 text-base rounded-xl" };

export function Button({ children, variant = "primary", size = "md", loading = false, className, disabled, ...props }: ButtonProps) {
  return (
    <button className={cn("inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed", vs[variant], ss[size], className)} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${Math.floor(hours / 24)}j`;
}

export function severityColor(level: string) {
  switch (level) {
    case "critical": return "text-accent-red bg-accent-red/10 border-accent-red/30";
    case "high": return "text-accent-orange bg-accent-orange/10 border-accent-orange/30";
    case "medium": return "text-accent-amber bg-accent-amber/10 border-accent-amber/30";
    case "low": return "text-accent-green bg-accent-green/10 border-accent-green/30";
    default: return "text-text-secondary bg-white/5 border-border-glass";
  }
}

export function statusColor(status: string) {
  switch (status) {
    case "completed": case "available": case "resolved": case "closed": return "text-accent-green bg-accent-green/10";
    case "in_progress": case "on_duty": case "investigating": return "text-accent-cyan bg-accent-cyan/10";
    case "planned": case "pending": case "upcoming": return "text-accent-amber bg-accent-amber/10";
    case "cancelled": case "no_show": case "inactive": case "overdue": return "text-accent-red bg-accent-red/10";
    case "open": return "text-accent-orange bg-accent-orange/10";
    default: return "text-text-secondary bg-white/5";
  }
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    available: "Disponible", on_duty: "En service", off_duty: "Repos", training: "Formation", inactive: "Inactif",
    planned: "Planifié", confirmed: "Confirmé", in_progress: "En cours", completed: "Terminé", cancelled: "Annulé", no_show: "Absent",
    open: "Ouvert", investigating: "En enquête", resolved: "Résolu", closed: "Clos",
    pending: "En attente", upcoming: "À venir", overdue: "En retard",
  };
  return labels[status] || status;
}

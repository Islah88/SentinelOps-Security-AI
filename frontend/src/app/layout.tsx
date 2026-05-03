import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SentinelOps — Gestion Sécurité Privée par IA",
  description: "Plateforme IA pour sociétés de gardiennage : planning intelligent, conformité CNAPS, gestion d'incidents.",
  keywords: ["sécurité privée", "CNAPS", "gardiennage", "planning", "IA", "incidents"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="bg-bg-base text-text-primary antialiased">{children}</body>
    </html>
  );
}

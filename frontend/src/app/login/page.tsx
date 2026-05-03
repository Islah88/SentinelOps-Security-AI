"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Siren, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await api.login(email, password); router.push("/dashboard"); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Erreur de connexion"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-amber/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-red/5 rounded-full blur-[120px]" />
      </div>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-amber to-accent-red flex items-center justify-center mb-4 shadow-lg shadow-accent-amber/20">
            <Siren className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text-sentinel">SentinelOps</h1>
          <p className="text-text-secondary text-sm mt-2">Gestion sécurité privée par IA</p>
        </motion.div>
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-6">
          <div><h2 className="text-xl font-semibold">Connexion</h2><p className="text-sm text-text-secondary mt-1">Accédez à votre espace de gestion</p></div>
          {error && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-3 rounded-xl bg-accent-red/10 border border-accent-red/30 text-accent-red text-sm">{error}</motion.div>}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-text-secondary font-medium">Adresse email</label>
              <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@sentinelops.demo" required className="w-full px-4 py-3 rounded-xl bg-white/5 border border-border-glass text-text-primary placeholder:text-text-muted outline-none focus:border-accent-amber/50 focus:ring-1 focus:ring-accent-amber/20 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-text-secondary font-medium">Mot de passe</label>
              <div className="relative">
                <input id="login-password" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-border-glass text-text-primary placeholder:text-text-muted outline-none focus:border-accent-amber/50 focus:ring-1 focus:ring-accent-amber/20 transition-all" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary cursor-pointer">{showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-accent-amber to-accent-red text-white font-semibold shadow-lg shadow-accent-amber/20 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Se connecter</span><ArrowRight className="w-4 h-4" /></>}
          </button>
          <p className="text-xs text-text-muted text-center">Démo : admin@sentinelops.demo / demo2026</p>
        </motion.form>
      </motion.div>
    </div>
  );
}

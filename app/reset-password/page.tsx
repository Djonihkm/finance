"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState("");

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-colors pr-10";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }
      setDone(true);
    } catch {
      setError("Erreur de connexion. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-gray-800 mb-2">Lien invalide</h2>
        <p className="text-sm text-gray-500">Ce lien de réinitialisation est incorrect ou manquant.</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-[#11355b] mb-2">Compte activé !</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Votre mot de passe a été défini avec succès. Vous pouvez maintenant vous connecter.
        </p>
        <button
          type="button"
          onClick={() => { setRedirecting(true); router.push("/login"); }}
          disabled={redirecting}
          className="w-full bg-[#11355b] hover:bg-[#1a4a7a] disabled:opacity-70 text-white py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          {redirecting
            ? <><Loader2 size={16} className="animate-spin" /> Redirection…</>
            : "Se connecter"}
        </button>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-xl font-bold text-[#11355b] mb-1">Définir votre mot de passe</h2>
      <p className="text-sm text-gray-500 mb-6">
        Choisissez un mot de passe sécurisé pour activer votre compte.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="pwd" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="pwd"
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 caractères"
              className={`${inputClass} pl-9`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPwd ? "Masquer" : "Afficher"}
            >
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirm" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="confirm"
              type={showPwd ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className={`${inputClass} pl-9`}
              required
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            <AlertCircle size={15} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#11355b] hover:bg-[#1a4a7a] disabled:opacity-60 text-white py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer mt-2 flex items-center justify-center gap-2"
        >
          {loading
            ? <><Loader2 size={16} className="animate-spin" /> Activation en cours…</>
            : "Activer mon compte"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative w-40 h-14 mx-auto mb-3">
            <Image src="/logo.svg" alt="Logo" fill className="object-contain" priority />
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
            Système de Gestion Financière
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <Suspense fallback={<div className="text-center text-gray-400 text-sm py-8">Chargement…</div>}>
            <ResetForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Ministère — Tous droits réservés
        </p>
      </div>
    </div>
  );
}

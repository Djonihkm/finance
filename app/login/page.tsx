"use client";

import { useActionState, useState } from "react";
import { login } from "@/lib/auth";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(login, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* ── Colonne gauche ── */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-8 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-[#11355b] mb-2">Bienvenue</h1>
          <p className="text-sm text-gray-500 mb-8">
            Connectez-vous pour gérer vos opérations
          </p>

          <form action={action} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="name@gmail.com"
                required
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a365d]/30 focus:border-[#1a365d] transition"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••••"
                  required
                  className="w-full px-4 py-3 pr-11 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a365d]/30 focus:border-[#1a365d] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  tabIndex={-1}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            {/* Erreur */}
            {state?.error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                {state.error}
              </p>
            )}

            {/* Mot de passe oublié */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs text-gray-500 hover:text-[#1a365d] transition"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Bouton connexion */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-[#1a365d] hover:bg-[#11355b] text-white text-sm font-semibold rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? "Connexion…" : "Connexion"}
            </button>
          </form>

          {/* Inscription */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Vous n&apos;avez pas de compte ?{" "}
            <Link
              href="#"
              className="font-semibold text-[#1a365d] underline underline-offset-2 hover:text-[#234876] transition"
            >
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>

      {/* ── Colonne droite ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] flex-col bg-[#1a365d] relative overflow-hidden">
        {/* Motif décoratif fond */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-300 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
          <div className="absolute inset-0" style={{
            backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 40px)"
          }} />
        </div>

        {/* Contenu */}
        <div className="relative flex flex-col items-center justify-center flex-1 px-10 py-12 text-center">
          {/* Armoiries */}
          <div className="w-28 h-28 mb-8 relative">
            <Image
              src="/fav.png"
              alt="Armoiries du Bénin"
              fill
              sizes="112px"
              className="object-contain drop-shadow-xl"
              priority
            />
          </div>

          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Connexion<br />à la plateforme de<br />gestion
          </h2>

          <p className="text-blue-200 text-sm leading-relaxed max-w-xs">
            Accédez à vos outils financiers en toute sécurité et en temps réel.
          </p>
        </div>

        {/* Bande tricolore Bénin */}
        <div className="relative flex h-2 flex-shrink-0">
          <div className="flex-[35] bg-[#008751]" />
          <div className="flex-[35] bg-[#fcd116]" />
          <div className="flex-[30] bg-[#e8112d]" />
        </div>
      </div>
    </div>
  );
}

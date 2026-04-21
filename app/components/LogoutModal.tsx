"use client";

import { useFormStatus } from "react-dom";
import { LogOut, X, Loader2 } from "lucide-react";
import { logout } from "@/lib/auth";

function LogoutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <Loader2 size={15} className="animate-spin" />
          Déconnexion…
        </>
      ) : (
        "Se déconnecter"
      )}
    </button>
  );
}

interface LogoutModalProps {
  onCancel: () => void;
}

export default function LogoutModal({ onCancel }: LogoutModalProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
              <LogOut size={18} className="text-red-500" />
            </div>
            <h2 className="text-base font-semibold text-gray-800">Déconnexion</h2>
          </div>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Annuler"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            Vous êtes sur le point de vous déconnecter. Toute session en cours sera fermée.
          </p>
          <p className="text-sm text-gray-400 mt-1">Voulez-vous continuer ?</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <form action={logout} className="flex-1">
            <LogoutButton />
          </form>
        </div>
      </div>
    </div>
  );
}

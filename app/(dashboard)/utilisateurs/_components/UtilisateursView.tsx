/**
 * app/(dashboard)/utilisateurs/_components/UtilisateursView.tsx — Client Component
 * ─────────────────────────────────────────────────────────────────────────────────
 * Reçoit UserRow[] depuis le Server Component parent (utilisateurs/page.tsx).
 * Gère la recherche et le filtre par rôle.
 *
 * Flux : utilisateurs/page.tsx → ici
 */

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, Users, ShieldCheck, Lock } from "lucide-react";
import { type UserRow } from "@/lib/queries";
import { formatRole, ROLE_LABELS } from "@/lib/utils/formatters";

const ROLES = Object.keys(ROLE_LABELS);

const roleBadge: Record<string, string> = {
  SUPER_ADMIN: "bg-[#11355b] text-white",
  MINISTERE:   "bg-[#1a4a7a] text-white",
  ADMIN:       "bg-blue-100 text-blue-700",
  DIRECTEUR:   "bg-purple-100 text-purple-700",
  COMPTABLE:   "bg-gray-100 text-gray-600",
};

interface Props {
  data: UserRow[];
}

export default function UtilisateursView({ data }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const filtered = useMemo(
    () =>
      data.filter((u) => {
        const fullName = `${u.prenom} ${u.nom}`.toLowerCase();
        const matchSearch =
          fullName.includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = !roleFilter || u.role === roleFilter;
        return matchSearch && matchRole;
      }),
    [data, search, roleFilter]
  );

  const total = data.length;
  const actifs = data.filter((u) => u.isActive).length;
  const inactifs = total - actifs;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-6">

      <h1 className="text-2xl font-bold text-[#11355b]">Liste des utilisateurs</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
            <Users size={20} className="text-[#11355b]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Utilisateurs</p>
            <p className="text-2xl md:text-3xl font-bold text-[#11355b]">{total}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
            <ShieldCheck size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Actifs</p>
            <p className="text-2xl md:text-3xl font-bold text-emerald-600">{actifs}</p>
          </div>
        </div>

        <div className="bg-[#11355b] rounded-xl p-5 shadow-lg flex items-center gap-4">
          <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
            <Lock size={20} className="text-white" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-white/60 uppercase tracking-wider">Inactifs</p>
            <p className="text-2xl md:text-3xl font-bold text-white">{inactifs}</p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un utilisateur…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-colors bg-white"
          />
        </div>

        <div className="relative w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto appearance-none pl-3 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-colors bg-white cursor-pointer"
          >
            <option value="">Tous les rôles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{formatRole(r)}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[480px]">
            <thead>
              <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/70 border-b border-gray-100">
                <th className="px-4 md:px-6 py-4">Nom</th>
                <th className="px-4 md:px-6 py-4 hidden sm:table-cell">Email</th>
                <th className="px-4 md:px-6 py-4">Rôle</th>
                <th className="px-4 md:px-6 py-4 hidden md:table-cell">Établissement</th>
                <th className="px-4 md:px-6 py-4 hidden lg:table-cell">Créé le</th>
                <th className="px-4 md:px-6 py-4">Statut</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => router.push(`/utilisateurs/${u.id}`)}
                    className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer"
                  >
                    <td className="px-4 md:px-6 py-4">
                      <p className="font-semibold text-[#11355b] text-sm leading-tight">
                        {u.prenom} {u.nom}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 sm:hidden truncate max-w-[140px]">{u.email}</p>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-gray-500 hidden sm:table-cell">{u.email}</td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${roleBadge[u.role] ?? "bg-gray-100 text-gray-600"}`}>
                        {formatRole(u.role)}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-gray-600 hidden md:table-cell">
                      {u.etablissement?.nom ?? "—"}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-gray-400 hidden lg:table-cell">
                      {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${
                        u.isActive ? "text-emerald-600" : "text-gray-400"
                      }`}>
                        <span className={`w-2 h-2 rounded-full shrink-0 ${u.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                        {u.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

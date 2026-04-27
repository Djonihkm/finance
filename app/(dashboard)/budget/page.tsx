/**
 * app/(dashboard)/budget/page.tsx — Server Component
 * ────────────────────────────────────────────────────
 * Récupère les budgets depuis Neon via Prisma.
 * Affiche la répartition par établissement avec les montants alloués, consommés et disponibles.
 *
 * Flux : Neon ← Prisma ← getBudgets() ← ici
 */

import {
  Landmark,
  ShoppingCart,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { getBudgets } from "@/lib/queries";
import { formatMontant } from "@/lib/utils/formatters";

function fmtM(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M FCFA`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k FCFA`;
  return `${n} FCFA`;
}

export default async function BudgetPage() {
  const budgets = await getBudgets();

  // Agrégats globaux calculés depuis les vraies données
  const totalAnnuel = budgets.reduce((s, b) => s + parseFloat(b.montantTotal.toString()), 0);
  const consomme = budgets.reduce((s, b) => s + parseFloat(b.montantConsomme.toString()), 0);
  const disponible = totalAnnuel - consomme;
  const pctConsomme = totalAnnuel > 0 ? Math.round((consomme / totalAnnuel) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
            <Landmark size={16} className="text-[#11355b]" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider truncate">Total Alloué</p>
            <p className="text-base font-bold text-[#11355b] leading-tight">{fmtM(totalAnnuel)}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <TrendingUp size={11} className="text-emerald-500 shrink-0" />
              <span className="text-[11px] text-emerald-600 font-medium">{budgets.length} budget(s)</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
            <ShoppingCart size={16} className="text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Consommé</p>
            <p className="text-base font-bold text-[#11355b] leading-tight">{fmtM(consomme)}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-gray-100 rounded-full h-1">
                <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${pctConsomme}%` }} />
              </div>
              <span className="text-[11px] text-gray-400 shrink-0">{pctConsomme}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-3 col-span-2 md:col-span-1">
          <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center shrink-0">
            <PiggyBank size={16} className="text-yellow-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Disponible</p>
            <p className="text-base font-bold text-[#11355b] leading-tight">{fmtM(disponible)}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Solde non consommé</p>
          </div>
        </div>
      </div>

      {/* Table budgets par établissement */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#11355b]">Budgets par établissement</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-125">
            <thead>
              <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/60 border-b border-gray-100">
                <th className="px-4 py-4">Établissement</th>
                <th className="hidden sm:table-cell px-4 py-4">Année</th>
                <th className="px-4 py-4">Alloué</th>
                <th className="hidden sm:table-cell px-4 py-4">Consommé</th>
                <th className="px-4 py-4">Exécution</th>
                <th className="px-4 py-4">Disponible</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {budgets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm">
                    Aucun budget trouvé.
                  </td>
                </tr>
              ) : (
                budgets.map((b) => {
                  const total = parseFloat(b.montantTotal.toString());
                  const conso = parseFloat(b.montantConsomme.toString());
                  const dispo = total - conso;
                  const pct = total > 0 ? Math.round((conso / total) * 100) : 0;
                  const initiales = b.etablissement.nom
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase();

                  const barColor =
                    pct >= 90
                      ? "bg-red-500"
                      : pct >= 70
                      ? "bg-yellow-400"
                      : "bg-emerald-500";

                  return (
                    <tr key={b.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-linear-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {initiales}
                          </div>
                          <div>
                            <p className="font-semibold text-[#11355b] text-sm">{b.etablissement.nom}</p>
                            <p className="text-xs text-gray-400">{b.etablissement.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-4 text-gray-500">{b.annee}</td>
                      <td className="px-4 py-4 font-bold text-[#11355b] text-sm">{formatMontant(total)}</td>
                      <td className={`hidden sm:table-cell px-4 py-4 font-semibold text-sm ${pct >= 80 ? "text-red-500" : "text-emerald-600"}`}>
                        {formatMontant(conso)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 min-w-20">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                            <div className={`${barColor} h-1.5 rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          <span className="text-xs font-bold text-gray-600 w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-sm text-emerald-600">
                        {formatMontant(dispo)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

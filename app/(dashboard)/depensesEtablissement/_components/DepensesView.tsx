/**
 * app/(dashboard)/depensesEtablissement/_components/DepensesView.tsx — Client Component
 * ───────────────────────────────────────────────────────────────────────────────────────
 * Composant partagé entre la vue établissement et la vue admin.
 * Reçoit les données Prisma et un basePath pour construire les routes de détail.
 *
 * Flux (établissement) : depensesEtablissement/page.tsx → ici → /depensesEtablissement/[ref]
 * Flux (admin)         : depenses/page.tsx              → ici → /depenses/[ref]
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { type DepenseRow, type BonRow } from "@/lib/queries";
import {
  formatMontant,
  formatDate,
  formatCategorie,
  formatPaiement,
  STATUT_COLORS,
  formatStatut,
} from "@/lib/utils/formatters";

type Mode = "depenses" | "bons";

interface Props {
  depenses: DepenseRow[];
  bons: BonRow[];
  basePath: string;
}

const PAGE_SIZE = 10;

export default function DepensesView({ depenses, bons, basePath }: Props) {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<Mode>("depenses");
  const [page, setPage] = useState(1);

  const currentData = activeMode === "depenses" ? depenses : bons;
  const totalPages = Math.max(1, Math.ceil(currentData.length / PAGE_SIZE));
  const paginated = currentData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleModeSwitch = (mode: Mode) => {
    setActiveMode(mode);
    setPage(1);
  };

  const handleRowClick = (reference: string) => {
    const encoded = encodeURIComponent(reference);
    if (activeMode === "depenses") {
      router.push(`${basePath}/${encoded}`);
    } else {
      router.push(`${basePath}/bons/${encoded}`);
    }
  };

  const btnClass = (mode: Mode) =>
    `flex-1 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
      activeMode === mode
        ? "bg-[#11355b] text-white shadow-md"
        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
    }`;

  // Totaux calculés depuis les vraies données Prisma
  const totalDepenses = depenses.reduce(
    (sum, d) => sum + parseFloat(d.montant.toString()),
    0
  );
  const totalBons = bons.reduce(
    (sum, b) => sum + parseFloat(b.montantTotal.toString()),
    0
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Sélecteur mode */}
      <div className="flex w-full gap-4">
        <button onClick={() => handleModeSwitch("depenses")} className={btnClass("depenses")}>
          Dépenses
        </button>
        <button onClick={() => handleModeSwitch("bons")} className={btnClass("bons")}>
          Bons de commandes
        </button>
      </div>

      {/* Section Liste */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#11355b]">
            {activeMode === "depenses" ? "Liste des dépenses" : "Liste des bons de commandes"}
          </h2>
          <button
            onClick={() =>
              router.push(
                activeMode === "depenses"
                  ? `${basePath}/nouveau`
                  : `${basePath}/bons/nouveau`
              )
            }
            className="bg-[#11355b] hover:bg-[#1a4a7a] text-white px-5 py-3 rounded-lg flex items-center gap-2 font-semibold text-sm transition-colors shadow-md cursor-pointer"
          >
            <Plus size={18} />
            AJOUTER {activeMode === "depenses" ? "DÉPENSE" : "BON"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="hidden sm:table-cell px-4 py-4">Date</th>
                <th className="px-4 py-4">Intitulé</th>
                <th className="px-4 py-4">Montant</th>
                {activeMode === "depenses" ? (
                  <>
                    <th className="hidden md:table-cell px-4 py-4">Paiement</th>
                    <th className="hidden md:table-cell px-4 py-4">Référence</th>
                    <th className="px-4 py-4">Catégorie</th>
                  </>
                ) : (
                  <>
                    <th className="hidden md:table-cell px-4 py-4">Fournisseur</th>
                    <th className="hidden md:table-cell px-4 py-4">Référence</th>
                    <th className="px-4 py-4">Statut</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm">
                    Aucun document trouvé.
                  </td>
                </tr>
              ) : activeMode === "depenses" ? (
                (paginated as DepenseRow[]).map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => handleRowClick(d.reference)}
                    className="border-b border-gray-50 hover:bg-blue-50/40 transition-colors cursor-pointer"
                  >
                    <td className="hidden sm:table-cell px-4 py-4 text-gray-500">
                      {formatDate(d.date)}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-800">
                      {d.intitule}
                      <p className="sm:hidden text-xs text-gray-400 mt-0.5">{formatDate(d.date)}</p>
                    </td>
                    <td className="px-4 py-4 font-bold text-[#11355b]">{formatMontant(d.montant)}</td>
                    <td className="hidden md:table-cell px-4 py-4 text-gray-500">
                      {formatPaiement(d.paiement)}
                    </td>
                    <td className="hidden md:table-cell px-4 py-4 text-gray-400 font-mono text-xs">
                      {d.reference}
                    </td>
                    <td className="px-4 py-4">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[11px] font-bold uppercase">
                        {formatCategorie(d.categorie)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                (paginated as BonRow[]).map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => handleRowClick(b.reference)}
                    className="border-b border-gray-50 hover:bg-blue-50/40 transition-colors cursor-pointer"
                  >
                    <td className="hidden sm:table-cell px-4 py-4 text-gray-500">
                      {formatDate(b.date)}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-800">
                      {b.intitule}
                      <p className="sm:hidden text-xs text-gray-400 mt-0.5">{formatDate(b.date)}</p>
                    </td>
                    <td className="px-4 py-4 font-bold text-[#11355b]">{formatMontant(b.montantTotal)}</td>
                    <td className="hidden md:table-cell px-4 py-4 text-gray-500">
                      {b.fournisseur ?? "—"}
                    </td>
                    <td className="hidden md:table-cell px-4 py-4 text-gray-400 font-mono text-xs">
                      {b.reference}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase ${STATUT_COLORS[b.statut] ?? "bg-gray-100 text-gray-600"}`}>
                        {formatStatut(b.statut)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50/50 px-6 py-4 flex justify-between items-center text-xs text-gray-500 border-t border-gray-100">
          <p>
            {currentData.length === 0
              ? "Aucun document"
              : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, currentData.length)} sur ${currentData.length}`}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 border border-gray-200 rounded bg-white hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 border border-gray-200 rounded bg-white hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
        <div className={`p-6 rounded-xl shadow-sm border relative overflow-hidden transition-all ${
          activeMode === "depenses"
            ? "bg-[#11355b] text-white shadow-lg border-transparent"
            : "bg-white border-gray-100"
        }`}>
          <p className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${
            activeMode === "depenses" ? "opacity-70" : "text-orange-400"
          }`}>
            Total Dépenses
          </p>
          <p className={`text-2xl font-bold ${activeMode === "depenses" ? "text-white" : "text-[#11355b]"}`}>
            {formatMontant(totalDepenses)}
          </p>
        </div>

        <div className={`p-6 rounded-xl shadow-sm border relative overflow-hidden transition-all ${
          activeMode === "bons"
            ? "bg-[#11355b] text-white shadow-lg border-transparent"
            : "bg-white border-gray-100"
        }`}>
          <p className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${
            activeMode === "bons" ? "opacity-70" : "text-blue-400"
          }`}>
            Total Bons de commande
          </p>
          <p className={`text-2xl font-bold ${activeMode === "bons" ? "text-white" : "text-[#11355b]"}`}>
            {formatMontant(totalBons)}
          </p>
        </div>
      </div>
    </div>
  );
}

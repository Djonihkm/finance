"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import { useNavigation } from "@/lib/navigation-context";
import type { MarcheRow, ContratRow } from "@/lib/queries";
import {
  formatTypeMarche,
  formatDate,
  formatMontant,
  formatStatutMarche,
  STATUT_MARCHE_COLORS,
  formatStatutContrat,
  STATUT_CONTRAT_COLORS,
} from "@/lib/utils/formatters";

type Tab = "marches" | "contrats";

interface Props {
  marches: MarcheRow[];
  contrats: ContratRow[];
  userPrismaRole: string;
}

const PAGE_SIZE = 10;

export default function MarchesView({ marches, contrats, userPrismaRole }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { navigate } = useNavigation();

  const activeTab: Tab = searchParams.get("tab") === "contrats" ? "contrats" : "marches";
  const [page, setPage] = useState(1);

  const canCreateMarche = ["SUPER_ADMIN", "MINISTERE", "ADMIN", "COMPTABLE"].includes(userPrismaRole);

  const currentData = activeTab === "marches" ? marches : contrats;
  const totalPages = Math.max(1, Math.ceil(currentData.length / PAGE_SIZE));
  const paginated = currentData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const switchTab = (tab: Tab) => {
    setPage(1);
    router.replace(tab === "contrats" ? "?tab=contrats" : "?", { scroll: false });
  };

  const btnClass = (tab: Tab) =>
    `flex-1 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer text-sm ${
      activeTab === tab
        ? "bg-[#11355b] text-white shadow-md"
        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
    }`;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex w-full gap-4">
        <button onClick={() => switchTab("marches")} className={btnClass("marches")}>
          Marchés ({marches.length})
        </button>
        <button onClick={() => switchTab("contrats")} className={btnClass("contrats")}>
          Contrats ({contrats.length})
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 flex justify-end">
          {activeTab === "marches" && canCreateMarche && (
            <button
              onClick={() => navigate("/marches/nouveau")}
              className="bg-[#11355b] hover:bg-[#1a4a7a] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold text-sm transition-colors shadow-md cursor-pointer"
            >
              <Plus size={18} /> NOUVEAU MARCHÉ
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          {activeTab === "marches" ? (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="hidden sm:table-cell px-4 py-4">Référence</th>
                  <th className="px-4 py-4">Objet</th>
                  <th className="hidden md:table-cell px-4 py-4">Type</th>
                  <th className="hidden lg:table-cell px-4 py-4">Montant estimé</th>
                  <th className="hidden md:table-cell px-4 py-4">Fournisseur</th>
                  <th className="px-4 py-4">Statut</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {(paginated as MarcheRow[]).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />
                      Aucun marché enregistré.
                    </td>
                  </tr>
                ) : (
                  (paginated as MarcheRow[]).map((m) => (
                    <tr
                      key={m.id}
                      onClick={() => navigate(`/marches/${m.id}`)}
                      className="border-b border-gray-50 hover:bg-blue-50/40 transition-colors cursor-pointer"
                    >
                      <td className="hidden sm:table-cell px-4 py-4 font-mono text-xs text-gray-400">{m.reference}</td>
                      <td className="px-4 py-4 font-medium text-gray-800">
                        {m.objet}
                        <p className="sm:hidden text-xs text-gray-400 font-mono mt-0.5">{m.reference}</p>
                      </td>
                      <td className="hidden md:table-cell px-4 py-4 text-gray-500">{formatTypeMarche(m.type)}</td>
                      <td className="hidden lg:table-cell px-4 py-4 font-bold text-[#11355b]">
                        {formatMontant(m.montantEstime)}
                      </td>
                      <td className="hidden md:table-cell px-4 py-4 text-gray-500">
                        {m.fournisseur?.nom ?? <span className="text-gray-300 italic">Non attribué</span>}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase ${STATUT_MARCHE_COLORS[m.statut] ?? "bg-gray-100 text-gray-600"}`}>
                          {formatStatutMarche(m.statut)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="hidden sm:table-cell px-4 py-4">Référence</th>
                  <th className="px-4 py-4">Objet</th>
                  <th className="hidden md:table-cell px-4 py-4">Fournisseur</th>
                  <th className="hidden lg:table-cell px-4 py-4">Montant total</th>
                  <th className="hidden md:table-cell px-4 py-4">Fin</th>
                  <th className="px-4 py-4">Statut</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {(paginated as ContratRow[]).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />
                      Aucun contrat enregistré.
                    </td>
                  </tr>
                ) : (
                  (paginated as ContratRow[]).map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => navigate(`/contrats/${c.id}`)}
                      className="border-b border-gray-50 hover:bg-blue-50/40 transition-colors cursor-pointer"
                    >
                      <td className="hidden sm:table-cell px-4 py-4 font-mono text-xs text-gray-400">{c.reference}</td>
                      <td className="px-4 py-4 font-medium text-gray-800">
                        {c.objet}
                        <p className="sm:hidden text-xs text-gray-400 font-mono mt-0.5">{c.reference}</p>
                      </td>
                      <td className="hidden md:table-cell px-4 py-4 text-gray-500">{c.fournisseur.nom}</td>
                      <td className="hidden lg:table-cell px-4 py-4 font-bold text-[#11355b]">
                        {formatMontant(c.montantTotal)}
                      </td>
                      <td className="hidden md:table-cell px-4 py-4 text-gray-500">{formatDate(c.dateFin)}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase ${STATUT_CONTRAT_COLORS[c.statut] ?? "bg-gray-100 text-gray-600"}`}>
                          {formatStatutContrat(c.statut)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-gray-50/50 px-6 py-4 flex justify-between items-center text-xs text-gray-500 border-t border-gray-100">
          <p>
            {currentData.length === 0
              ? "Aucun élément"
              : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, currentData.length)} sur ${currentData.length}`}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1 border border-gray-200 rounded bg-white hover:bg-gray-50 disabled:opacity-50 cursor-pointer">
              <ChevronLeft size={16} />
            </button>
            <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1 border border-gray-200 rounded bg-white hover:bg-gray-50 disabled:opacity-50 cursor-pointer">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 pb-8">
        <div className={`p-6 rounded-xl shadow-sm border transition-all ${activeTab === "marches" ? "bg-[#11355b] text-white border-transparent" : "bg-white border-gray-100"}`}>
          <p className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${activeTab === "marches" ? "opacity-70" : "text-blue-400"}`}>Total marchés</p>
          <p className={`text-2xl font-bold ${activeTab === "marches" ? "text-white" : "text-[#11355b]"}`}>{marches.length}</p>
        </div>
        <div className={`p-6 rounded-xl shadow-sm border transition-all ${activeTab === "contrats" ? "bg-[#11355b] text-white border-transparent" : "bg-white border-gray-100"}`}>
          <p className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${activeTab === "contrats" ? "opacity-70" : "text-emerald-400"}`}>Total contrats</p>
          <p className={`text-2xl font-bold ${activeTab === "contrats" ? "text-white" : "text-[#11355b]"}`}>{contrats.length}</p>
        </div>
      </div>
    </div>
  );
}

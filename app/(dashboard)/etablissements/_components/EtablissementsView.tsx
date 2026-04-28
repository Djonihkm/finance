"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, CheckCircle2, XCircle, Plus, ChevronLeft, ChevronRight, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { type EtablissementRow } from "@/lib/queries";
import { formatTypeEtablissement, formatDate } from "@/lib/utils/formatters";

const PAGE_SIZE = 10;

interface Props {
  data: EtablissementRow[];
}

export default function EtablissementsView({ data }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; nom: string } | null>(null);

  const filtered = useMemo(
    () =>
      data.filter(
        (e) =>
          e.nom.toLowerCase().includes(search.toLowerCase()) ||
          e.code.toLowerCase().includes(search.toLowerCase()) ||
          (e.ville ?? "").toLowerCase().includes(search.toLowerCase())
      ),
    [data, search]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const total = data.length;
  const actifs = data.filter((e) => e.isActive).length;
  const inactifs = total - actifs;

  const handleDelete = async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/etablissements/${confirmTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(`${confirmTarget.nom} supprimé.`);
      setConfirmTarget(null);
      router.refresh();
    } catch {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-6">

        {/* Titre + bouton nouveau */}
        <div className="flex items-center justify-around md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-[#11355b]">Établissements</h1>
          <button
            type="button"
            onClick={() => router.push("/etablissements/nouveau")}
            className="bg-[#11355b] hover:bg-[#1a4a7a] text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-semibold text-sm transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            Nouveau Etablissement
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5">
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
              <Building2 size={20} className="text-[#11355b]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total</p>
              <p className="text-2xl md:text-3xl font-bold text-[#11355b]">{total}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Actifs</p>
              <p className="text-2xl md:text-3xl font-bold text-emerald-600">{actifs}</p>
            </div>
          </div>

          <div className="bg-[#11355b] rounded-xl p-5 shadow-lg flex items-center gap-4">
            <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
              <XCircle size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-white/60 uppercase tracking-wider">Inactifs</p>
              <p className="text-2xl md:text-3xl font-bold text-white">{inactifs}</p>
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher par nom, code ou ville…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-colors bg-white"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[560px]">
              <thead>
                <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/70 border-b border-gray-100">
                  <th className="px-4 md:px-6 py-4">Établissement</th>
                  <th className="hidden sm:table-cell px-4 md:px-6 py-4">Type</th>
                  <th className="hidden md:table-cell px-4 md:px-6 py-4">Région</th>
                  <th className="hidden lg:table-cell px-4 md:px-6 py-4">Créé le</th>
                  <th className="px-4 md:px-6 py-4">Statut</th>
                  <th className="px-4 md:px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm">
                      Aucun établissement trouvé.
                    </td>
                  </tr>
                ) : (
                  paginated.map((e) => (
                    <tr
                      key={e.id}
                      onClick={() => router.push(`/etablissements/${encodeURIComponent(e.id)}`)}
                      className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer"
                    >
                      <td className="px-4 md:px-6 py-4">
                        <p className="font-semibold text-[#11355b] leading-tight">{e.nom}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{e.code}</p>
                      </td>
                      <td className="hidden sm:table-cell px-4 md:px-6 py-4 text-gray-600">
                        {formatTypeEtablissement(e.type)}
                      </td>
                      <td className="hidden md:table-cell px-4 md:px-6 py-4 text-gray-500">
                        {e.region ?? "—"}
                      </td>
                      <td className="hidden lg:table-cell px-4 md:px-6 py-4 text-gray-400">
                        {formatDate(e.createdAt)}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${
                          e.isActive ? "text-emerald-600" : "text-red-500"
                        }`}>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${e.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                          {e.isActive ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={(ev) => { ev.stopPropagation(); setConfirmTarget({ id: e.id, nom: e.nom }); }}
                          className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-medium transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                          Supprimer
                        </button>
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
              {filtered.length === 0
                ? "Aucun résultat"
                : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} sur ${filtered.length}`}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Page précédente"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 border border-gray-200 rounded bg-white hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Page suivante"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 border border-gray-200 rounded bg-white hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modale de confirmation de suppression */}
      {confirmTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => !deleting && setConfirmTarget(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                  <Trash2 size={18} className="text-red-500" />
                </div>
                <h2 className="text-base font-semibold text-gray-800">Supprimer l&apos;établissement</h2>
              </div>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setConfirmTarget(null)}
                disabled={deleting}
                className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm text-gray-600 leading-relaxed">
                Vous êtes sur le point de supprimer{" "}
                <span className="font-semibold text-[#11355b]">« {confirmTarget.nom} »</span>.
              </p>
              <p className="text-sm text-red-500 mt-2 font-medium">Cette action est irréversible.</p>
            </div>

            <div className="flex gap-3 px-6 pb-5">
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {deleting ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

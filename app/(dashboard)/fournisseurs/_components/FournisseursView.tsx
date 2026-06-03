"use client";

import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { useNavigation } from "@/lib/navigation-context";
import type { FournisseurRow } from "@/lib/queries";
import { formatTypeMarche, formatDate } from "@/lib/utils/formatters";

interface Props {
  fournisseurs: FournisseurRow[];
  userPrismaRole: string;
}

const PAGE_SIZE = 10;

export default function FournisseursView({ fournisseurs, userPrismaRole }: Props) {
  const { navigate } = useNavigation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const canCreate = ["SUPER_ADMIN", "MINISTERE", "ADMIN", "COMPTABLE"].includes(userPrismaRole);

  const filtered = fournisseurs.filter((f) =>
    f.nom.toLowerCase().includes(search.toLowerCase()) ||
    (f.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (f.rccm ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <input
            type="text"
            placeholder="Rechercher par nom, email, RCCM…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full sm:w-80 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b]"
          />
          {canCreate && (
            <button
              onClick={() => navigate("/fournisseurs/nouveau")}
              className="bg-[#11355b] hover:bg-[#1a4a7a] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold text-sm transition-colors shadow-md cursor-pointer shrink-0"
            >
              <Plus size={18} />
              NOUVEAU FOURNISSEUR
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="px-4 py-4">Nom</th>
                <th className="hidden md:table-cell px-4 py-4">Catégorie</th>
                <th className="hidden lg:table-cell px-4 py-4">Téléphone</th>
                <th className="hidden lg:table-cell px-4 py-4">RCCM</th>
                <th className="hidden md:table-cell px-4 py-4">Marchés</th>
                <th className="hidden sm:table-cell px-4 py-4">Créé le</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <Building2 size={32} className="mx-auto mb-2 opacity-30" />
                    {search ? "Aucun fournisseur trouvé pour cette recherche." : "Aucun fournisseur enregistré."}
                  </td>
                </tr>
              ) : (
                paginated.map((f) => (
                  <tr
                    key={f.id}
                    onClick={() => navigate(`/fournisseurs/${f.id}`)}
                    className="border-b border-gray-50 hover:bg-blue-50/40 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-800">{f.nom}</p>
                      {f.email && <p className="text-xs text-gray-400 mt-0.5">{f.email}</p>}
                    </td>
                    <td className="hidden md:table-cell px-4 py-4 text-gray-500">
                      {formatTypeMarche(f.categorie)}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-4 text-gray-500">
                      {f.telephone ?? "—"}
                    </td>
                    <td className="hidden lg:table-cell px-4 py-4 text-gray-400 font-mono text-xs">
                      {f.rccm ?? "—"}
                    </td>
                    <td className="hidden md:table-cell px-4 py-4 text-center">
                      <span className="inline-block bg-[#11355b]/10 text-[#11355b] text-xs font-bold px-2 py-1 rounded">
                        {f._count.marches}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-4 text-gray-400 text-xs">
                      {formatDate(f.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50/50 px-6 py-4 flex justify-between items-center text-xs text-gray-500 border-t border-gray-100">
          <p>
            {filtered.length === 0
              ? "Aucun fournisseur"
              : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} sur ${filtered.length}`}
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

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
        <div className="bg-[#11355b] text-white p-6 rounded-xl shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider opacity-70 mb-1">Total fournisseurs</p>
          <p className="text-3xl font-bold">{fournisseurs.length}</p>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-1">Marchés associés</p>
          <p className="text-3xl font-bold text-[#11355b]">
            {fournisseurs.reduce((s, f) => s + f._count.marches, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}

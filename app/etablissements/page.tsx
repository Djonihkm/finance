"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Building2, Landmark, Store, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '../components/DashboardLayout';
import { useStore } from '@/lib/store';

const ITEMS_PER_PAGE = 4;

const EtablissementsPage = () => {
  const router = useRouter();
  const { etablissements, deleteEtablissement } = useStore();
  const [currentPage, setCurrentPage] = useState(1);

  const total = etablissements.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const paginated = etablissements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const totalPublics = etablissements.filter((e) => e.type === 'PUBLIC').length;
  const totalPrives = etablissements.filter((e) => e.type === 'PRIVÉ').length;

  const handleDelete = (e: React.MouseEvent, id: string, nom: string) => {
    e.stopPropagation();
    if (!confirm(`Supprimer « ${nom} » ? Cette action est irréversible.`)) return;
    deleteEtablissement(id);
    toast.success(`${nom} supprimé.`);
    if (paginated.length === 1 && currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3, '...', totalPages);
    }
    return pages;
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-6">

        {/* En-tête — colonne sur mobile, ligne sur md+ */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#11355b]">Etablissements</h1>
            <p className="text-gray-500 text-sm mt-1">
              Consultez et gérez la liste des établissements enregistrés
            </p>
          </div>
          {/* Bouton pleine largeur sur mobile, auto sur sm+ */}
          <button
            onClick={() => router.push('/etablissements/nouveau')}
            className="w-full sm:w-auto bg-[#11355b] hover:bg-[#1a4a7a] text-white px-5 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm transition-colors shadow-md cursor-pointer shrink-0"
          >
            <Plus size={18} />
            NOUVEL ETABLISSEMENT
          </button>
        </div>

        {/* KPI Cards — 1 col mobile, 3 col md+ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5">
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <Building2 size={22} className="text-[#11355b]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total</p>
              <p className="text-2xl md:text-3xl font-bold text-[#11355b]">{total}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
              <Landmark size={22} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Publics</p>
              <p className="text-2xl md:text-3xl font-bold text-emerald-600">{totalPublics}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
              <Store size={22} className="text-orange-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Privés</p>
              <p className="text-2xl md:text-3xl font-bold text-orange-500">{totalPrives}</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 md:p-6">
            <h2 className="text-lg font-bold text-[#11355b]">Liste des Enregistrements</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-y border-gray-100 bg-gray-50/50">
                  <th className="px-4 md:px-6 py-4">Nom</th>
                  <th className="px-4 md:px-6 py-4">Type</th>
                  <th className="px-4 md:px-6 py-4 hidden sm:table-cell">Département</th>
                  <th className="px-4 md:px-6 py-4 hidden md:table-cell">Date</th>
                  <th className="px-4 md:px-6 py-4">Statut</th>
                  <th className="px-4 md:px-6 py-4 w-12"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {paginated.map((etab) => (
                  <tr
                    key={etab.id}
                    onClick={() => router.push(`/etablissements/${encodeURIComponent(etab.id)}`)}
                    className="border-b border-gray-50 hover:bg-blue-50/40 transition-colors cursor-pointer"
                  >
                    <td className="px-4 md:px-6 py-4">
                      <p className="font-semibold text-[#11355b] text-sm">{etab.nom}</p>
                      <p className="text-xs text-gray-400 mt-0.5">ID: #{etab.id}</p>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${
                        etab.type === 'PUBLIC'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {etab.type}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-gray-600 hidden sm:table-cell">
                      {etab.departement}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-gray-500 hidden md:table-cell">
                      {etab.date}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                        etab.statut === 'ACTIF' ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          etab.statut === 'ACTIF' ? 'bg-emerald-500' : 'bg-red-500'
                        }`} />
                        {etab.statut}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, etab.id, etab.nom)}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        aria-label="Supprimer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50/50 px-4 md:px-6 py-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center sm:text-left">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, total)} sur {total} établissements
            </p>
            <div className="flex items-center justify-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-gray-200 rounded bg-white hover:bg-gray-50 disabled:opacity-40 cursor-pointer transition-colors"
              >
                <ChevronLeft size={15} />
              </button>

              {getPageNumbers().map((page, i) =>
                page === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-xs">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page as number)}
                    className={`min-w-[32px] h-8 px-2 rounded text-xs font-semibold border transition-colors cursor-pointer ${
                      currentPage === page
                        ? 'bg-[#11355b] text-white border-[#11355b]'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-gray-200 rounded bg-white hover:bg-gray-50 disabled:opacity-40 cursor-pointer transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default EtablissementsPage;
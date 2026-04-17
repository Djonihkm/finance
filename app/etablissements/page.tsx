"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Building2, Landmark, Store, ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { etablissements } from '../data/etablissements';

const ITEMS_PER_PAGE = 4;
const TOTAL = 237;
const TOTAL_PAGES = Math.ceil(TOTAL / ITEMS_PER_PAGE);

const EtablissementsPage = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const paginated = etablissements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (TOTAL_PAGES <= 5) {
      for (let i = 1; i <= TOTAL_PAGES; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3, '...', TOTAL_PAGES);
    }
    return pages;
  };

  return (
    <DashboardLayout>
      <div className="max-w-300 mx-auto space-y-6">

        {/* En-tête */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#11355b]">Etablissements</h1>
            <p className="text-gray-500 text-sm mt-1">
              Consultez et gérez la liste des établissements enregistrés
            </p>
          </div>
          <button
            onClick={() => router.push('/etablissements/nouveau')}
            className="bg-[#11355b] hover:bg-[#1a4a7a] text-white px-5 py-3 rounded-lg flex items-center gap-2 font-semibold text-sm transition-colors shadow-md cursor-pointer"
          >
            <Plus size={18} />
            NOUVEL ETABLISSEMENT
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <Building2 size={24} className="text-[#11355b]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total</p>
              <p className="text-3xl font-bold text-[#11355b]">237</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
              <Landmark size={24} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Publics</p>
              <p className="text-3xl font-bold text-emerald-600">142</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
              <Store size={24} className="text-orange-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Privés</p>
              <p className="text-3xl font-bold text-orange-500">95</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-bold text-[#11355b]">Liste des Enregistrements</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-y border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4">Nom</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Département</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Statut</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {paginated.map((etab) => (
                  <tr
                    key={etab.id}
                    onClick={() => router.push(`/etablissements/${encodeURIComponent(etab.id)}`)}
                    className="border-b border-gray-50 hover:bg-blue-50/40 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[#11355b]">{etab.nom}</p>
                      <p className="text-xs text-gray-400 mt-0.5">ID: #{etab.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        etab.type === 'PUBLIC'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {etab.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{etab.departement}</td>
                    <td className="px-6 py-4 text-gray-500">{etab.date}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
                        etab.statut === 'ACTIF' ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          etab.statut === 'ACTIF' ? 'bg-emerald-500' : 'bg-red-500'
                        }`} />
                        {etab.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50/50 px-6 py-4 flex justify-between items-center border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Affichage de {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, TOTAL)} sur {TOTAL} établissements
            </p>
            <div className="flex items-center gap-1">
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
                onClick={() => setCurrentPage((p) => Math.min(TOTAL_PAGES, p + 1))}
                disabled={currentPage === TOTAL_PAGES}
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

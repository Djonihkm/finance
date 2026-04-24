"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/lib/store';

type Mode = 'depenses' | 'bons';

const DepensesPage = () => {
  const router = useRouter();
  const { depenses, bonsCommandes } = useStore();
  const [activeMode, setActiveMode] = useState<Mode>('depenses');

  const currentData = activeMode === 'depenses' ? depenses : bonsCommandes;
  const totalCount = currentData.length;

  const getButtonClass = (mode: Mode) => {
    return `flex-1 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
      activeMode === mode
        ? 'bg-[#11355b] text-white shadow-md'
        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
    }`;
  };

  const handleRowClick = (reference: string) => {
    const encoded = encodeURIComponent(reference);
    if (activeMode === 'depenses') {
      router.push(`/depensesEtablissement/${encoded}`);
    } else {
      router.push(`/depensesEtablissement/bons/${encoded}`);
    }
  };

  return (
    
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Sélecteur */}
        <div className="flex w-full gap-4">
          <button onClick={() => setActiveMode('depenses')} className={getButtonClass('depenses')}>
            Dépenses
          </button>
          <button onClick={() => setActiveMode('bons')} className={getButtonClass('bons')}>
            Bons de commandes
          </button>
        </div>

        {/* Section Liste */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#11355b]">
              {activeMode === 'depenses' ? 'Liste des dépenses' : 'Liste des bons de commandes'}
            </h2>
            <button
              onClick={() => router.push(activeMode === 'depenses' ? '/depensesEtablissement/nouveau' : '/depensesEtablissement/bons/nouveau')}
              className="bg-[#11355b] hover:bg-[#1a4a7a] text-white px-5 py-3 rounded-lg flex items-center gap-2 font-semibold text-sm transition-colors shadow-md cursor-pointer"
            >
              <Plus size={18} />
              AJOUTER {activeMode === 'depenses' ? 'DÉPENSE' : 'BON'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="hidden sm:table-cell px-4 py-4">Date</th>
                  <th className="px-4 py-4">Intitulé</th>
                  <th className="px-4 py-4">Montant</th>
                  <th className="hidden md:table-cell px-4 py-4">Paiement</th>
                  <th className="hidden md:table-cell px-4 py-4">Référence</th>
                  <th className="px-4 py-4">Catégorie</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {currentData.map((item, index) => (
                  <tr
                    key={index}
                    onClick={() => handleRowClick(item.reference)}
                    className="border-b border-gray-50 hover:bg-blue-50/40 transition-colors cursor-pointer"
                  >
                    <td className="hidden sm:table-cell px-4 py-4 text-gray-500">{item.date}</td>
                    <td className="px-4 py-4 font-medium text-gray-800">
                      {item.intitule}
                      <p className="sm:hidden text-xs text-gray-400 mt-0.5">{item.date}</p>
                    </td>
                    <td className="px-4 py-4 font-bold text-[#11355b]">{item.montant}</td>
                    <td className="hidden md:table-cell px-4 py-4">{item.paiement}</td>
                    <td className="hidden md:table-cell px-4 py-4 text-gray-500">{item.reference}</td>
                    <td className="px-4 py-4">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[11px] font-bold uppercase">
                        {item.categorie}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50/50 px-6 py-4 flex justify-between items-center text-xs text-gray-500 border-t border-gray-100">
            <p>
              Affichage de {currentData.length} sur {totalCount} {activeMode === 'depenses' ? 'dépenses' : 'bons'}
            </p>
            <div className="flex gap-2">
              <button type="button" aria-label="Page précédente" className="p-1 border border-gray-200 rounded bg-white hover:bg-gray-50 disabled:opacity-50 cursor-pointer">
                <ChevronLeft size={16} />
              </button>
              <button type="button" aria-label="Page suivante" className="p-1 border border-gray-200 rounded bg-white hover:bg-gray-50 disabled:opacity-50 cursor-pointer">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Cartes KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">
          <div className={`p-6 rounded-xl shadow-sm border relative overflow-hidden transition-all ${
            activeMode === 'depenses' ? 'bg-[#11355b] text-white shadow-lg border-transparent' : 'bg-white border-gray-100'
          }`}>
            <p className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${activeMode === 'depenses' ? 'opacity-70' : 'text-orange-400'}`}>Total Dépense</p>
            <p className={`text-2xl font-bold ${activeMode === 'depenses' ? 'text-white' : 'text-[#11355b]'}`}>4,580.45 FCFA</p>
          </div>

          <div className={`p-6 rounded-xl shadow-sm border relative overflow-hidden transition-all ${
            activeMode === 'bons' ? 'bg-[#11355b] text-white shadow-lg border-transparent' : 'bg-white border-gray-100'
          }`}>
            <p className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${activeMode === 'bons' ? 'opacity-70' : 'text-blue-400'}`}>Total Bons</p>
            <p className={`text-2xl font-bold ${activeMode === 'bons' ? 'text-white' : 'text-[#11355b]'}`}>12,240.00 FCFA</p>
          </div>

          <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
            <p className="text-[11px] font-bold text-green-500 uppercase tracking-wider mb-1">Budget Restant</p>
            <p className="text-2xl font-bold text-[#11355b]">3,179.55 FCFA</p>
          </div>
        </div>
      </div>
    
  );
};

export default DepensesPage;
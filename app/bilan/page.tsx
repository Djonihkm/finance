import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

const BilanPage = () => {
  return (
    <DashboardLayout>
    <div className="max-w-[1200px] mx-auto space-y-8">
      {/* Titre de la page */}
      <h1 className="text-3xl font-bold text-[#11355b]">Bilan</h1>

      {/* Section des Cartes Statistiques (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Débit */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Débit</p>
            <p className="text-2xl font-bold text-[#11355b]">1 309,99 €</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Total Crédit */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Crédit</p>
            <p className="text-2xl font-bold text-[#e63946]">2 459,99 €</p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg text-red-500">
            <TrendingDown size={24} />
          </div>
        </div>

        {/* Solde de période */}
        <div className="bg-[#11355b] p-6 rounded-xl shadow-lg flex justify-between items-center text-white">
          <div>
            <p className="text-[10px] font-bold opacity-70 uppercase tracking-wider mb-1">Solde de période</p>
            <p className="text-2xl font-bold">- 1 150,00 €</p>
          </div>
          <div className="bg-white/10 p-3 rounded-lg">
            <Wallet size={24} />
          </div>
        </div>
      </div>

      {/* Section Tableau */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Header du tableau */}
            <thead className="bg-[#11355b] text-white text-[10px] uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 border-r border-white/10">N° Compte</th>
                <th className="px-6 py-4 border-r border-white/10">Nom du compte</th>
                <th className="px-6 py-4 border-r border-white/10 text-center">Date</th>
                <th className="px-6 py-4 border-r border-white/10">Libellé</th>
                <th className="px-6 py-4 border-r border-white/10">Référence</th>
                <th className="px-6 py-4 border-r border-white/10 text-center">Journal</th>
                <th className="px-6 py-4 border-r border-white/10 text-right">Débit</th>
                <th className="px-6 py-4 text-right">Crédit</th>
              </tr>
            </thead>
            
            <tbody className="text-sm text-gray-700">
              {/* Groupe Banque Populaire */}
              <tr className="bg-gray-50/50">
                <td colSpan={8} className="px-6 py-3 font-bold text-[#11355b] border-b border-gray-100">
                  512000 - Banque Populaire
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-6 py-4 text-gray-500">512000</td>
                <td className="px-6 py-4 font-medium">Banque Populaire</td>
                <td className="px-6 py-4 text-center">12/10/2023</td>
                <td className="px-6 py-4 text-xs leading-relaxed max-w-[150px]">Virement Client - Facture #2023-01</td>
                <td className="px-6 py-4">VR - 9982</td>
                <td className="px-6 py-4 text-center"><span className="bg-gray-100 px-2 py-1 rounded text-[10px] font-bold uppercase">Banque</span></td>
                <td className="px-6 py-4 text-right font-bold text-[#11355b]">1 250,00</td>
                <td className="px-6 py-4 text-right text-gray-400">0,00</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-6 py-4 text-gray-500">512000</td>
                <td className="px-6 py-4 font-medium">Banque Populaire</td>
                <td className="px-6 py-4 text-center">15/10/2023</td>
                <td className="px-6 py-4 text-xs leading-relaxed max-w-[150px]">Loyer Cabinet Octobre</td>
                <td className="px-6 py-4">PRL - L33</td>
                <td className="px-6 py-4 text-center"><span className="bg-gray-100 px-2 py-1 rounded text-[10px] font-bold uppercase">Banque</span></td>
                <td className="px-6 py-4 text-right text-gray-400">0,00</td>
                <td className="px-6 py-4 text-right font-bold text-red-500">2 400,00</td>
              </tr>
              <tr className="bg-gray-50/30 text-[11px] font-bold text-gray-400 uppercase tracking-tighter italic">
                 <td colSpan={6} className="px-6 py-2 text-right">Total 512000</td>
                 <td className="px-6 py-2 text-right text-[#11355b]">1 250,00</td>
                 <td className="px-6 py-2 text-right text-red-500">2 400,00</td>
              </tr>

              {/* Groupe Fournisseur Adobe */}
              <tr className="bg-gray-50/50 border-t-2 border-gray-100">
                <td colSpan={8} className="px-6 py-3 font-bold text-[#11355b] border-b border-gray-100 uppercase text-xs">
                  401100 - Fournisseur Adobe Systems
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-6 py-4 text-gray-500">401100</td>
                <td className="px-6 py-4 font-medium">Fournisseur Adobe Systems</td>
                <td className="px-6 py-4 text-center">18/10/2023</td>
                <td className="px-6 py-4 text-xs leading-relaxed">Abonnement Creative Cloud Pro</td>
                <td className="px-6 py-4 text-xs font-mono">FAC-AD921</td>
                <td className="px-6 py-4 text-center"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-[10px] font-bold uppercase">Achats</span></td>
                <td className="px-6 py-4 text-right text-gray-400">0,00</td>
                <td className="px-6 py-4 text-right font-bold text-red-500">59,99</td>
              </tr>
            </tbody>

            {/* Footer Total Général */}
            <tfoot className="bg-[#11355b] text-white">
              <tr>
                <td colSpan={6} className="px-6 py-6 text-right font-bold uppercase tracking-widest text-sm">
                  Grand Total Général
                </td>
                <td className="px-6 py-6 text-right font-bold text-lg border-l border-white/10">1 309,99</td>
                <td className="px-6 py-6 text-right font-bold text-lg border-l border-white/10">
                  <div className="flex flex-col items-end">
                    <span>2 459,99</span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
};

export default BilanPage;
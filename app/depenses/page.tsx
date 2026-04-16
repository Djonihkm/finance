import React from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

// Types pour les données
interface Depense {
  date: string;
  intitule: string;
  montant: string;
  paiement: string;
  reference: string;
  categorie: string;
}

const DepensesPage = () => {
  // Données simulées
  const depenses: Depense[] = [
    { date: '12 Oct 2023', intitule: 'Fournitures de bureau (Papier, Encre)', montant: '450.00', paiement: 'Espèces', reference: 'CS-2023-089', categorie: 'Fourniture' },
    { date: '11 Oct 2023', intitule: 'Maintenance Climatisation - Zone B', montant: '1,200.00', paiement: 'Virement', reference: 'BC-2023-452', categorie: 'Mobilier' },
    { date: '10 Oct 2023', intitule: 'Café et consommables accueil', montant: '85.50', paiement: 'Carte Bancaire', reference: 'CS-2023-090', categorie: 'Personnel' },
    { date: '08 Oct 2023', intitule: 'Achat matériel informatique (Laptops x2)', montant: '2,850.00', paiement: 'Virement 30j', reference: 'BC-2023-453', categorie: 'Enseignant' },
  ];

  return (
    <DashboardLayout>
    <div className="max-w-[1200px] mx-auto space-y-6">
      
      {/* 1. Sélecteur de mode (Toggle) */}
      <div className="flex w-full gap-4">
        <button className="flex-1 bg-[#11355b] text-white py-3 rounded-lg font-semibold shadow-sm">
          Dépenses
        </button>
        <button className="flex-1 bg-white border border-gray-200 text-gray-600 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
          Bon de commandes
        </button>
      </div>

      {/* 2. Section Liste des dépenses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header du tableau */}
        <div className="p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#11355b]">Liste des dépenses</h2>
          <button className="bg-[#11355b] hover:bg-[#1a4a7a] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-md">
            <Plus size={18} />
            NOUVELLE DEPENSE
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Intitulé</th>
                <th className="px-6 py-4">Montant</th>
                <th className="px-6 py-4">Paiement</th>
                <th className="px-6 py-4">Référence</th>
                <th className="px-6 py-4">Catégorie</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {depenses.map((item, index) => (
                <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">{item.date}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{item.intitule}</td>
                  <td className="px-6 py-4 font-bold text-[#11355b]">{item.montant}</td>
                  <td className="px-6 py-4">{item.paiement}</td>
                  <td className="px-6 py-4 text-gray-500">{item.reference}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold uppercase">
                      {item.categorie}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-gray-50/50 px-6 py-4 flex justify-between items-center text-xs text-gray-500 border-t border-gray-100">
          <p>Affichage de 4 sur 156 dépenses</p>
          <div className="flex gap-2">
            <button className="p-1 border border-gray-200 rounded bg-white hover:bg-gray-50 disabled:opacity-50">
              <ChevronLeft size={16} />
            </button>
            <button className="p-1 border border-gray-200 rounded bg-white hover:bg-gray-50 disabled:opacity-50">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Cartes de Résumé (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">
        {/* Total Dépense */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">Total Dépense</p>
          <p className="text-2xl font-bold text-[#11355b]">4,580.45 FCFA</p>
          {/* Décoration icône fond (optionnelle) */}
          <div className="absolute -right-4 -bottom-4 opacity-5 text-[#11355b]">
            <Plus size={100} />
          </div>
        </div>

        {/* Total Bons */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Total Bons</p>
          <p className="text-2xl font-bold text-[#11355b]">12,240.00 FCFA</p>
          <div className="absolute -right-4 -bottom-4 opacity-5 text-[#11355b]">
            <Plus size={100} />
          </div>
        </div>

        {/* Budget Restant */}
        <div className="bg-[#11355b] p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
          <p className="text-[10px] font-bold opacity-70 uppercase tracking-wider mb-1">Budget Restant</p>
          <p className="text-2xl font-bold">3,179.55 FCFA</p>
          <div className="absolute -right-4 -bottom-4 opacity-10 text-white">
            <Plus size={100} />
          </div>
        </div>
      </div>

    </div>
    </DashboardLayout>
  );
};

export default DepensesPage;
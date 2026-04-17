"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer, FileText, Receipt } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import type { Transaction } from '../data/depenses';

interface DepenseDetailProps {
  data: Transaction;
}

const DepenseDetail: React.FC<DepenseDetailProps> = ({ data }) => {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="max-w-300 mx-auto">

        {/* Bouton Retour */}
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-[#11355b] transition-colors cursor-pointer font-medium"
          >
            <ArrowLeft size={18} />
            Retour
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

          {/* === DOCUMENT PRINCIPAL === */}
          <div className="bg-white rounded-xl p-8 shadow-sm">

            {/* Header */}
            <div className="grid grid-cols-3 items-start gap-6 mb-8">
              <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-xs text-gray-400">LOGO</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Receipt size={20} className="text-[#11355b]" />
                  <h1 className="text-2xl font-bold text-[#11355b] tracking-wide">DÉPENSE</h1>
                </div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                  Fiche de dépense officielle
                </p>
              </div>
              <div className="text-right text-xs text-gray-600 leading-relaxed">
                <p>Cité Ministérielle</p>
                <p>Quartier Cadjèhoun – Ahouanlêko</p>
                <p>12e arrondissement, Commune de Cotonou</p>
                <p>République du Bénin</p>
              </div>
            </div>

            {/* Infos principales */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="space-y-5">
                <div className="border-l-4 border-[#11355b] pl-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Référence</p>
                  <p className="text-lg font-bold text-[#11355b]">{data.reference}</p>
                </div>
                <div className="border-l-4 border-[#11355b] pl-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</p>
                  <p className="text-base font-semibold text-gray-800">{data.date}</p>
                </div>
                <div className="border-l-4 border-[#11355b] pl-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mode de paiement</p>
                  <p className="text-base font-semibold text-gray-800">{data.paiement}</p>
                </div>
                <div className="border-l-4 border-[#11355b] pl-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Catégorie</p>
                  <span className="inline-block bg-blue-50 text-[#11355b] px-2 py-1 rounded text-sm font-bold uppercase">
                    {data.categorie}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Intitulé de la dépense
                </p>
                <p className="text-base font-semibold text-gray-800 leading-relaxed">{data.intitule}</p>
              </div>
            </div>

            {/* Tableau récapitulatif */}
            <div className="mb-8 border border-gray-200 rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#11355b] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider font-bold">Description</th>
                    <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider font-bold">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3">{data.intitule}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#11355b]">{data.montant} FCFA</td>
                  </tr>
                  {[...Array(4)].map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="px-4 py-3 h-10">&nbsp;</td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total + Signature */}
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-gray-50 p-5 rounded-lg space-y-3">
                <div className="flex justify-between text-sm border-b border-gray-200 pb-3">
                  <span className="text-gray-500 uppercase tracking-wider text-xs">Sous-total</span>
                  <span className="font-semibold text-gray-700">{data.montant} FCFA</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[#11355b] font-bold uppercase tracking-wider text-sm">Total</span>
                  <span className="text-2xl font-bold text-[#11355b]">{data.montant} FCFA</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Visa du responsable financier
                </p>
                <div className="border border-gray-200 rounded h-32 flex items-center justify-center text-gray-300 italic text-sm">
                  Approuvé
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fait à</p>
                    <div className="border-b border-gray-300 h-6"></div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">La date</p>
                    <p className="border-b border-gray-300 h-6 text-sm pt-1">..../... / 2026</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* === COLONNE LATÉRALE === */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-100 pb-3">
                Actions
              </h3>
              <div className="mt-2 space-y-3">
                <button className="flex items-center gap-3 text-sm text-gray-700 hover:text-[#11355b] cursor-pointer transition-colors w-full">
                  <Printer size={16} />
                  Imprimer le document
                </button>
                <button className="flex items-center gap-3 text-sm text-orange-500 hover:text-orange-600 cursor-pointer transition-colors w-full font-medium">
                  <FileText size={16} />
                  Télécharger en PDF
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
              <Receipt size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 leading-relaxed">
                Cette fiche de dépense est un document comptable officiel. Conservez les justificatifs correspondants.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DepenseDetail;

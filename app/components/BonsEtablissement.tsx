"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer, FileText, Info } from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import type { Transaction } from '../data/depenses';

interface BonCommandeDetailProps {
  data: Transaction;
}

const BonCommandeDetail: React.FC<BonCommandeDetailProps> = ({ data }) => {
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

        {/* Layout en 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

          {/* === COLONNE PRINCIPALE (Document) === */}
          <div className="bg-white rounded-xl p-8 shadow-sm">

            {/* Header du document */}
            <div className="grid grid-cols-3 items-start gap-6 mb-8">
              <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-xs text-gray-400">LOGO</span>
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-[#11355b] tracking-wide">BON DE COMMANDE</h1>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                  Document de procurement autorisé
                </p>
              </div>
              <div className="text-right text-xs text-gray-600 leading-relaxed">
                <p>Cité Ministérielle</p>
                <p>Quartier Cadjèhoun – Ahouanlêko</p>
                <p>12e arrondissement, Commune de Cotonou</p>
                <p>République du Bénin</p>
              </div>
            </div>

            {/* Infos commande / fournisseur */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="space-y-5">
                <div className="border-l-4 border-[#11355b] pl-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">N° de commande</p>
                  <p className="text-lg font-bold text-[#11355b]">{data.reference}</p>
                </div>
                <div className="border-l-4 border-[#11355b] pl-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date d&apos;émission</p>
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
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Coordonnées du fournisseur
                </p>
                <p className="font-bold text-[#11355b] mb-2">Fournisseur principal</p>
                <p className="text-sm text-gray-600">Cotonou, République du Bénin</p>
                <p className="text-sm text-gray-600">fournisseur@email.bj</p>
              </div>
            </div>

            {/* Tableau des articles */}
            <div className="mb-8 border border-gray-200 rounded overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#11355b] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider font-bold">Désignation</th>
                    <th className="px-4 py-3 text-center text-[11px] uppercase tracking-wider font-bold">Quantité</th>
                    <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider font-bold">Prix unitaire</th>
                    <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3">{data.intitule}</td>
                    <td className="px-4 py-3 text-center">1</td>
                    <td className="px-4 py-3 text-right">{data.montant}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#11355b]">{data.montant}</td>
                  </tr>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="px-4 py-3 h-10">&nbsp;</td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Totaux + Signature */}
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-gray-50 p-5 rounded-lg space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 uppercase tracking-wider text-xs">Sous-total</span>
                  <span className="font-semibold text-gray-700">{data.montant}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 uppercase tracking-wider text-xs">TVA (18%)</span>
                  <span className="font-semibold text-gray-700">—</span>
                </div>
                <div className="flex justify-between text-sm border-b border-gray-200 pb-3">
                  <span className="text-orange-500 uppercase tracking-wider text-xs font-bold">Promo / Remise</span>
                  <span className="font-semibold text-orange-500">—</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[#11355b] font-bold uppercase tracking-wider text-sm">Total TTC</span>
                  <span className="text-2xl font-bold text-[#11355b]">{data.montant}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Signature du comptable
                </p>
                <div className="border border-gray-200 rounded h-32 flex items-center justify-center text-gray-300 italic text-sm">
                  Bon pour accord
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

          {/* === COLONNE LATÉRALE (Actions) === */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-100 pb-3">
                Actions
              </h3>
              <div className="mt-5 space-y-3">
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

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
              <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">
                Ce document est un titre de commande officiel. Toute modification après validation
                nécessite une ré-émission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BonCommandeDetail;

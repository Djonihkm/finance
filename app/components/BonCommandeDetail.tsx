"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Printer,
  FileText,
  Info,
} from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import type { Transaction } from "../data/depenses";
import Image from "next/image";

interface BonCommandeDetailProps {
  data: Transaction;
}

const BonCommandeDetail: React.FC<BonCommandeDetailProps> = ({ data }) => {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bouton Retour */}
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-[#11355b] transition-colors cursor-pointer font-medium"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Retour</span>
          </button>
        </div>

        {/* Layout en 1 colonne sur mobile, 2 colonnes sur desktop */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
          {/* === COLONNE PRINCIPALE (Document) === */}
          <div className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm">
            {/* En-tête du document */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-100">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 relative shrink-0">
                  <Image
                    src="/fav.png"
                    alt="Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              <div className="text-center flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-[#11355b]">
                  BON DE COMMANDE
                </h1>
                <p className="text-[8px] sm:text-xs text-gray-400 uppercase tracking-widest mt-1">
                  Document de procurement autorisé
                </p>
              </div>

              <div className="text-right text-[11px] sm:text-xs text-gray-600 leading-relaxed">
                <p>Cité Ministérielle</p>
                <p>Quartier Cadjèhoun – Ahouanlêko</p>
                <p>12e arrondissement,</p>
                <p>Commune de Cotonou</p>
                <p>République du Bénin</p>
              </div>
            </div>

            {/* Infos commande / fournisseur */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="space-y-3 sm:space-y-4">
                <div className="border-l-4 border-[#11355b] pl-3 sm:pl-4">
                  <p className="text-[8px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    N° de commande
                  </p>
                  <p className="text-base sm:text-lg font-bold text-[#11355b]">
                    {data.reference}
                  </p>
                </div>
                <div className="border-l-4 border-[#11355b] pl-3 sm:pl-4">
                  <p className="text-[8px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Date d&apos;émission
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-gray-800">
                    {data.date}
                  </p>
                </div>
                <div className="border-l-4 border-[#11355b] pl-3 sm:pl-4">
                  <p className="text-[8px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Mode de paiement
                  </p>
                  <p className="text-sm sm:text-base font-semibold text-gray-800">
                    {data.paiement}
                  </p>
                </div>
                <div className="border-l-4 border-[#11355b] pl-3 sm:pl-4">
                  <p className="text-[8px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Catégorie
                  </p>
                  <span className="inline-block bg-blue-50 text-[#11355b] px-2 py-1 rounded text-xs sm:text-sm font-bold uppercase">
                    {data.categorie}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-[8px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Coordonnées du fournisseur
                </p>
                <p className="font-bold text-[#11355b] mb-1 sm:mb-2 text-sm">
                  Fournisseur principal
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Cotonou, République du Bénin
                </p>
                <p className="text-xs sm:text-sm text-gray-600">fournisseur@email.bj</p>
              </div>
            </div>

            {/* Tableau des articles */}
            <div className="mb-6 sm:mb-8 border border-gray-200 rounded overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-[#11355b] text-white">
                    <tr>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-[9px] sm:text-[11px] uppercase tracking-wider font-bold">
                        Désignation
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-[9px] sm:text-[11px] uppercase tracking-wider font-bold">
                        Quantité
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-[9px] sm:text-[11px] uppercase tracking-wider font-bold">
                        Prix unitaire
                      </th>
                      <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-[9px] sm:text-[11px] uppercase tracking-wider font-bold">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="px-2 sm:px-4 py-2 sm:py-3">{data.intitule}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">1</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">{data.montant}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-right font-bold text-[#11355b]">
                        {data.montant}
                      </td>
                    </tr>
                    {[...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="px-2 sm:px-4 py-2 sm:py-3 h-8 sm:h-10">&nbsp;</td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3"></td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3"></td>
                        <td className="px-2 sm:px-4 py-2 sm:py-3"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Totaux + Signature */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-500 uppercase tracking-wider text-[8px] sm:text-xs">
                    Sous-total
                  </span>
                  <span className="font-semibold text-gray-700">
                    {data.montant}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-500 uppercase tracking-wider text-[8px] sm:text-xs">
                    TVA (18%)
                  </span>
                  <span className="font-semibold text-gray-700">—</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm border-b border-gray-200 pb-2 sm:pb-3">
                  <span className="text-orange-500 uppercase tracking-wider text-[8px] sm:text-xs font-bold">
                    Promo / Remise
                  </span>
                  <span className="font-semibold text-orange-500">—</span>
                </div>
                <div className="flex justify-between items-center pt-1 sm:pt-2">
                  <span className="text-[#11355b] font-bold uppercase tracking-wider text-xs sm:text-sm">
                    Total TTC
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-[#11355b]">
                    {data.montant}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[8px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Signature du comptable
                </p>
                <div className="border border-gray-200 rounded h-20 sm:h-28 flex items-center justify-center text-gray-300 italic text-xs sm:text-sm">
                  Bon pour accord
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-3 sm:mt-4">
                  <div>
                    <p className="text-[8px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Fait à
                    </p>
                    <div className="border-b border-gray-300 h-4 sm:h-6"></div>
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      La date
                    </p>
                    <p className="border-b border-gray-300 h-4 sm:h-6 text-xs sm:text-sm pt-0.5">
                      ..../... / 2026
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* === COLONNE LATÉRALE (Actions) === */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm">
              <h3 className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 sm:mb-4 border-b border-gray-100 pb-2 sm:pb-3">
                Actions
              </h3>
              <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 mb-2 sm:mb-3 transition-colors cursor-pointer shadow-sm">
                <CheckCircle size={16} />
                <span>Valider le bon de commande</span>
              </button>
              <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm">
                <XCircle size={16} />
                <span>Rejeter</span>
              </button>
              <div className="mt-4 sm:mt-5 space-y-2 sm:space-y-3 border-t border-gray-100 pt-3 sm:pt-4">
                <button className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700 hover:text-[#11355b] cursor-pointer transition-colors w-full">
                  <Printer size={14} />
                  <span>Imprimer le document</span>
                </button>
                <button className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-orange-500 hover:text-orange-600 cursor-pointer transition-colors w-full font-medium">
                  <FileText size={14} />
                  <span>Télécharger en PDF</span>
                </button>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 sm:p-4 flex gap-2 sm:gap-3">
              <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] sm:text-xs text-amber-800 leading-relaxed">
                Ce document est un titre de commande officiel. Toute
                modification après validation nécessite une ré-émission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BonCommandeDetail;
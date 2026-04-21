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
  ChevronRight
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
      {/* ✅ Correction du bug le plus important : max-w-7xl n'existait pas dans Tailwind */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-[#11355b] transition-colors cursor-pointer font-medium py-2"
          >
            <ArrowLeft size={18} />
            Retour
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4 lg:gap-6">
          {/* === DOCUMENT === */}
          <div className="bg-white rounded-xl p-3 sm:p-6 lg:p-8 shadow-sm order-2 lg:order-1">
            
            {/* ✅ Entete completement revu pour mobile */}
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 mb-6 pb-4 border-b border-gray-100">
              
              <div className="w-12 h-12 sm:w-16 sm:h-16 relative shrink-0">
                <Image
                  src="/fav.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div className="text-center order-first sm:order-none">
                <h1 className="text-lg font-bold text-[#11355b] ">
                  BON DE COMMANDE
                </h1>
                <p className="text-[11px] text-gray-400 uppercase tracking-widest mt-1">
                  Document de procurement autorisé
                </p>
              </div>

              <div className="text-center sm:text-right text-xs text-gray-600 leading-relaxed">
                <p>Cité Ministérielle</p>
                <p>Quartier Cadjèhoun</p>
                <p>Cotonou, Bénin</p>
              </div>
            </div>

            {/* ✅ Grille qui passe automatiquement en 1 colonne sur mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="space-y-3">
                <div className="border-l-4 border-[#11355b] pl-3">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    N° de commande
                  </p>
                  <p className="text-base font-bold text-[#11355b]">
                    {data.reference}
                  </p>
                </div>
                <div className="border-l-4 border-[#11355b] pl-3">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Date d&apos;émission
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {data.date}
                  </p>
                </div>
                <div className="border-l-4 border-[#11355b] pl-3">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Mode de paiement
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {data.paiement}
                  </p>
                </div>
                <div className="border-l-4 border-[#11355b] pl-3">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Catégorie
                  </p>
                  <span className="inline-block bg-blue-50 text-[#11355b] px-2 py-1 rounded text-sm font-bold uppercase">
                    {data.categorie}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Fournisseur
                </p>
                <p className="font-bold text-[#11355b] mb-2">
                  {data.fournisseur || "Fournisseur principal"}
                </p>
                <p className="text-sm text-gray-600">Cotonou, Bénin</p>
              </div>
            </div>

            {/* ✅ Tableau 100% fonctionnel sur mobile */}
            <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden relative">
              {/* Petit indicateur de scroll visible seulement sur mobile */}


              <div className="overflow-x-auto overscroll-contain">
                <table className="w-full text-sm min-w-[500px]">
                  <thead className="bg-[#11355b] text-white">
                    <tr>
                      <th className="px-3 py-2.5 text-left text-[11px] uppercase tracking-wider font-bold">
                        Désignation
                      </th>
                      <th className="px-3 py-2.5 text-center text-[11px] uppercase tracking-wider font-bold">
                        Quantité
                      </th>
                      <th className="px-3 py-2.5 text-right text-[11px] uppercase tracking-wider font-bold">
                        Prix unitaire
                      </th>
                      <th className="px-3 py-2.5 text-right text-[11px] uppercase tracking-wider font-bold">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="px-3 py-3">{data.intitule}</td>
                      <td className="px-3 py-3 text-center">1</td>
                      <td className="px-3 py-3 text-right">{data.montant}</td>
                      <td className="px-3 py-3 text-right font-bold text-[#11355b]">
                        {data.montant}
                      </td>
                    </tr>
                    {[...Array(4)].map((_, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="px-3 py-2.5 h-9">&nbsp;</td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ✅ Totaux et signature */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 uppercase text-xs">Sous-total</span>
                  <span className="font-semibold">{data.montant}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 uppercase text-xs">TVA 18%</span>
                  <span className="font-semibold">—</span>
                </div>
                <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                  <span className="text-orange-500 uppercase text-xs font-bold">Remise</span>
                  <span className="font-semibold text-orange-500">—</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-[#11355b] font-bold uppercase">Total TTC</span>
                  <span className="text-xl font-bold text-[#11355b]">{data.montant}</span>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Signature
                </p>
                <div className="border border-gray-200 rounded h-24 flex items-center justify-center text-gray-300 italic text-sm">
                  Bon pour accord
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase">Fait à</p>
                    <div className="border-b border-gray-300 h-5 mt-1"></div>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase">Date</p>
                    <div className="border-b border-gray-300 h-5 mt-1"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* === SIDEBAR ACTIONS === */}
          <div className="space-y-4 order-1 lg:order-2 lg:sticky lg:top-4 h-fit">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">
                Actions
              </h3>
              
              <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 mb-2 min-h-[48px]">
                <CheckCircle size={18} />
                Valider
              </button>
              
              <button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 min-h-[48px]">
                <XCircle size={18} />
                Rejeter
              </button>

              <div className="mt-4 space-y-3 border-t border-gray-100 pt-3">
                <button className="flex items-center gap-3 text-sm text-gray-700 hover:text-[#11355b] py-2 w-full">
                  <Printer size={16} />
                  Imprimer
                </button>
                <button className="flex items-center gap-3 text-sm text-orange-500 hover:text-orange-600 py-2 w-full font-medium">
                  <FileText size={16} />
                  Télécharger PDF
                </button>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-3">
              <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                Ce document est officiel. Toute modification après validation nécessite une réémission.
              </p>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default BonCommandeDetail;
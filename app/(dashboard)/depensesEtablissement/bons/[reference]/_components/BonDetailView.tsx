/**
 * app/(dashboard)/depensesEtablissement/bons/[reference]/_components/BonDetailView.tsx
 * ──────────────────────────────────────────────────────────────────────────────────────
 * Client Component — affiche le détail d'un bon de commande avec ses lignes.
 * Utilisé par la route établissement ET la route admin (/depenses/bons/[ref]).
 *
 * Flux : [reference]/page.tsx → ici → PUT /api/bons-commande/[id]
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle, XCircle, Printer, FileText, Info,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { type BonRow } from "@/lib/queries";
import {
  formatMontant, formatDate, STATUT_COLORS, formatStatut,
} from "@/lib/utils/formatters";

interface Props {
  data: BonRow;
  backPath: string;
}

export default function BonDetailView({ data, backPath }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (action: "valider" | "rejeter") => {
    setLoading(action);
    try {
      const res = await fetch(`/api/bons-commande/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error();
      toast.success(action === "valider" ? "Bon validé." : "Bon rejeté.");
      router.refresh();
    } catch {
      toast.error("Erreur lors de l'opération.");
    } finally {
      setLoading(null);
    }
  };

  const montantTotal = parseFloat(data.montantTotal.toString());

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

      <button
        onClick={() => router.push(backPath)}
        className="flex items-center gap-2 text-gray-600 hover:text-[#11355b] transition-colors cursor-pointer font-medium py-2 mb-4"
      >
        <ArrowLeft size={18} />
        Retour
      </button>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4 lg:gap-6">

        {/* Document */}
        <div className="bg-white rounded-xl p-6 lg:p-10 shadow-sm">

          {/* En-tête */}
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="w-14 h-14 relative shrink-0">
              <Image src="/fav.png" alt="Logo" fill className="object-contain" priority />
            </div>
            <div className="text-center flex-1">
              <h1 className="text-xl font-bold text-[#11355b]">BON DE COMMANDE</h1>
              <p className="text-[11px] text-gray-400 uppercase tracking-widest mt-1">
                Document de procurement autorisé
              </p>
            </div>
            <div className="text-right text-xs text-gray-600 leading-relaxed">
              <p>Cité Ministérielle</p>
              <p>Quartier Cadjèhoun – Ahouanléko</p>
              <p>Cotonou, République du Bénin</p>
            </div>
          </div>

          {/* Infos commande + fournisseur */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="border-l-4 border-[#11355b] pl-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">N° de commande</p>
                <p className="text-lg font-bold text-[#11355b]">{data.reference}</p>
              </div>
              <div className="border-l-4 border-[#11355b] pl-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Date d&apos;émission</p>
                <p className="text-base font-semibold text-[#11355b]">{formatDate(data.date)}</p>
              </div>
              <div className="border-l-4 border-[#11355b] pl-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Statut</p>
                <span className={`inline-block px-2 py-1 rounded text-[11px] font-bold uppercase ${STATUT_COLORS[data.statut] ?? "bg-gray-100 text-gray-600"}`}>
                  {formatStatut(data.statut)}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                Coordonnées du fournisseur
              </p>
              <p className="text-base font-bold text-[#11355b] mb-1">
                {data.fournisseur ?? "Non renseigné"}
              </p>
              <p className="text-xs text-gray-500">{data.etablissement.nom}</p>
            </div>
          </div>

          {/* Lignes du bon */}
          <div className="overflow-x-auto mb-6 border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm min-w-[480px]">
              <thead className="bg-[#11355b] text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider font-bold">Désignation</th>
                  <th className="px-4 py-3 text-center text-[11px] uppercase tracking-wider font-bold w-24">Qté</th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider font-bold w-32">Prix unitaire</th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-wider font-bold w-32">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.lignes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-sm">
                      Aucune ligne.
                    </td>
                  </tr>
                ) : (
                  data.lignes.map((l) => (
                    <tr key={l.id} className="border-b border-gray-100">
                      <td className="px-4 py-3">{l.designation}</td>
                      <td className="px-4 py-3 text-center">{l.quantite}</td>
                      <td className="px-4 py-3 text-right">{formatMontant(parseFloat(l.prixUnitaire.toString()))}</td>
                      <td className="px-4 py-3 text-right font-bold text-[#11355b]">
                        {formatMontant(parseFloat(l.montant.toString()))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="bg-gray-50 rounded-lg p-5 w-full max-w-xs">
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-base font-bold text-[#11355b] uppercase tracking-wide">Total TTC</span>
                <span className="text-xl font-bold text-[#11355b]">{formatMontant(montantTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar actions */}
        <div className="space-y-4 lg:sticky lg:top-4 h-fit">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">
              Actions
            </h3>

            {data.statut === "REVIEW" && (
              <>
                <button
                  onClick={() => handleAction("valider")}
                  disabled={loading !== null}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 mb-2 cursor-pointer transition-colors"
                >
                  <CheckCircle size={18} />
                  {loading === "valider" ? "En cours…" : "Valider"}
                </button>
                <button
                  onClick={() => handleAction("rejeter")}
                  disabled={loading !== null}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <XCircle size={18} />
                  {loading === "rejeter" ? "En cours…" : "Rejeter"}
                </button>
              </>
            )}

            <div className={`space-y-3 border-t border-gray-100 pt-3 ${data.statut === "REVIEW" ? "mt-4" : ""}`}>
              {/* <button
                onClick={() => window.print()}
                className="flex items-center gap-3 text-sm text-gray-700 hover:text-[#11355b] py-2 w-full cursor-pointer transition-colors"
              >
                <Printer size={16} />
                Imprimer
              </button> */}
              <button
                onClick={() => toast.info("Export PDF non disponible.")}
                className="flex items-center gap-3 text-sm text-orange-500 hover:text-orange-600 py-2 w-full font-medium cursor-pointer transition-colors"
              >
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
  );
}

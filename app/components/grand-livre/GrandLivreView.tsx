"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";
import { type GrandLivre } from "@/lib/queries/grandLivre";
import { formatMontant, formatDate } from "@/lib/utils/formatters";
import React from "react";

interface Props {
  grandLivre: GrandLivre;
  anneeSelectionnee: number;
  compteSelectionnee?: string;
  comptesDisponibles: { id: number; numero: string; nom: string }[];
}

export default function GrandLivreView({
  grandLivre,
  anneeSelectionnee,
  compteSelectionnee,
  comptesDisponibles,
}: Props) {
  const router = useRouter();

  const anneeActuelle = new Date().getFullYear();
  const annees = Array.from({ length: 2 }, (_, i) => anneeActuelle - i);

  const handleAnneeChange = (annee: number) => {
    const params = new URLSearchParams();
    params.set("annee", annee.toString());
    if (compteSelectionnee) params.set("compte", compteSelectionnee);
    router.push(`/grand-livre?${params.toString()}`);
  };

  const handleCompteChange = (numero: string) => {
    const params = new URLSearchParams();
    params.set("annee", anneeSelectionnee.toString());
    if (numero) params.set("compte", numero);
    router.push(`/grand-livre?${params.toString()}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#11355b]">Grand Livre</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Journal détaillé des écritures — exercice {anneeSelectionnee}
          </p>
        </div>

        <div className="flex gap-2">
          <select
            value={compteSelectionnee ?? ""}
            onChange={(e) => handleCompteChange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 cursor-pointer"
          >
            <option value="">Tous les comptes</option>
            {comptesDisponibles.map((c) => (
              <option key={c.id} value={c.numero}>
                {c.numero} — {c.nom}
              </option>
            ))}
          </select>

          <select
            value={anneeSelectionnee}
            onChange={(e) => handleAnneeChange(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 cursor-pointer"
          >
            {annees.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cartes résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white px-5 py-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Débit</p>
            <p className="text-lg font-bold text-[#11355b]">{formatMontant(grandLivre.grandTotalDebit)}</p>
          </div>
          <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
            <TrendingUp size={18} />
          </div>
        </div>

        <div className="bg-white px-5 py-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Crédit</p>
            <p className="text-lg font-bold text-[#11355b]">{formatMontant(grandLivre.grandTotalCredit)}</p>
          </div>
          <div className="bg-red-50 p-2 rounded-lg text-red-500">
            <TrendingDown size={18} />
          </div>
        </div>

        <div className="bg-white px-5 py-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Équilibre</p>
            <p className="text-lg font-bold text-[#11355b]">
              {grandLivre.estEquilibre ? "Équilibré" : "Déséquilibré"}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">Σ Débits = Σ Crédits</p>
          </div>
          <div className={`p-2 rounded-lg ${grandLivre.estEquilibre ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-500"}`}>
            {grandLivre.estEquilibre ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          </div>
        </div>
      </div>

      {/* Tableau grand livre */}
      {grandLivre.sections.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-sm">Aucune écriture pour cette période.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-[#11355b]">Journal des écritures</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-[#11355b] text-white text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4 border-r border-white/10 w-24">N° Compte</th>
                  <th className="px-6 py-4 border-r border-white/10">Nom du compte</th>
                  <th className="px-6 py-4 border-r border-white/10 w-28">Date</th>
                  <th className="px-6 py-4 border-r border-white/10">Libellé</th>
                  <th className="px-6 py-4 border-r border-white/10 w-32">Référence</th>
                  <th className="px-6 py-4 border-r border-white/10 w-32 text-right">Débit</th>
                  <th className="px-6 py-4 w-32 text-right">Crédit</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {grandLivre.sections.map((section) => (
                  <React.Fragment key={section.compteId}>
                    <tr className="bg-gray-50 border-t-2 border-gray-200">
                      <td colSpan={7} className="px-6 py-2">
                        <span className="font-bold text-[#11355b] text-xs uppercase tracking-wider">
                          {section.numero} — {section.nom}
                        </span>
                        <span className="ml-2 text-xs text-gray-400">({section.classeNom})</span>
                      </td>
                    </tr>

                    {section.lignes.map((ligne) => (
                      <tr
                        key={ligne.id}
                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-xs font-mono text-gray-400">{section.numero}</td>
                        <td className="px-6 py-4 text-gray-600">{section.nom}</td>
                        <td className="px-6 py-4 text-gray-500 text-xs">{formatDate(ligne.date)}</td>
                        <td className="px-6 py-4 text-gray-700">{ligne.libelle ?? "—"}</td>
                        <td className="px-6 py-4 text-xs font-mono text-gray-400">{ligne.reference ?? "—"}</td>
                        <td className="px-6 py-4 text-right font-semibold text-blue-600">
                          {ligne.debit > 0 ? formatMontant(ligne.debit) : "—"}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-red-500">
                          {ligne.credit > 0 ? formatMontant(ligne.credit) : "—"}
                        </td>
                      </tr>
                    ))}

                    <tr className="bg-gray-50 border-t border-gray-200">
                      <td colSpan={5} className="px-6 py-3 text-right">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Total {section.numero}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-blue-600">
                        {section.totalDebit > 0 ? formatMontant(section.totalDebit) : "—"}
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-red-500">
                        {section.totalCredit > 0 ? formatMontant(section.totalCredit) : "—"}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
              <tfoot className="bg-[#11355b] text-white">
                <tr>
                  <td colSpan={5} className="px-6 py-5 text-right font-bold uppercase tracking-widest text-sm">
                    Grand Total Général
                  </td>
                  <td className="px-6 py-5 text-right font-bold text-lg border-l border-white/10">
                    {formatMontant(grandLivre.grandTotalDebit)}
                  </td>
                  <td className="px-6 py-5 text-right font-bold text-lg border-l border-white/10">
                    {formatMontant(grandLivre.grandTotalCredit)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

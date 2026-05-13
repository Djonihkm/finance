"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle } from "lucide-react";
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
  const annees = Array.from({ length: 5 }, (_, i) => anneeActuelle - i);

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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ── En-tête ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#11355b]">Grand Livre</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Journal détaillé des écritures — exercice {anneeSelectionnee}
          </p>
        </div>

        {/* Filtres */}
        <div className="flex gap-2">
          {/* Filtre compte */}
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

          {/* Filtre année */}
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

      {/* ── Cartes résumé ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Total Débit
          </p>
          <p className="text-xl font-bold text-blue-600">
            {formatMontant(grandLivre.grandTotalDebit)}
          </p>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Total Crédit
          </p>
          <p className="text-xl font-bold text-red-600">
            {formatMontant(grandLivre.grandTotalCredit)}
          </p>
        </div>

        {/* Indicateur d'équilibre comptable */}
        <div
          className={`border rounded-xl p-4 ${grandLivre.estEquilibre ? "bg-emerald-50 border-emerald-100" : "bg-orange-50 border-orange-100"}`}
        >
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Équilibre
          </p>
          <div className="flex items-center gap-2">
            {grandLivre.estEquilibre ? (
              <CheckCircle size={20} className="text-emerald-600" />
            ) : (
              <AlertTriangle size={20} className="text-orange-500" />
            )}
            <p
              className={`text-sm font-bold ${grandLivre.estEquilibre ? "text-emerald-600" : "text-orange-500"}`}
            >
              {grandLivre.estEquilibre ? "Équilibré ✅" : "Déséquilibré ⚠️"}
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-1">Σ Débits = Σ Crédits</p>
        </div>
      </div>

      {/* ── Tableau grand livre ─────────────────────────────── */}
      {grandLivre.sections.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-400 text-sm">
            Aucune écriture pour cette période.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#11355b] text-white">
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider w-24">
                  N° Compte
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider">
                  Nom du compte
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider w-28">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider">
                  Libellé
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider w-32">
                  Référence
                </th>
                <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider w-32">
                  Débit
                </th>
                <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider w-32">
                  Crédit
                </th>
              </tr>
            </thead>
            <tbody>
              {grandLivre.sections.map((section) => (
                <React.Fragment key={section.compteId}>
                  {/* Ligne de groupe — nom du compte */}
                  <tr className="bg-gray-50 border-t-2 border-gray-200">
                    <td colSpan={7} className="px-4 py-2">
                      <span className="font-bold text-[#11355b] text-xs uppercase tracking-wider">
                        {section.numero} — {section.nom}
                      </span>
                      <span className="ml-2 text-xs text-gray-400">
                        ({section.classeNom})
                      </span>
                    </td>
                  </tr>

                  {/* Lignes d'écritures */}
                  {section.lignes.map((ligne) => (
                    <tr
                      key={ligne.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-2.5 text-xs font-mono text-gray-400">
                        {section.numero}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">
                        {section.nom}
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs">
                        {formatDate(ligne.date)}
                      </td>
                      <td className="px-4 py-2.5 text-gray-700">
                        {ligne.libelle ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-xs font-mono text-gray-400">
                        {ligne.reference ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-blue-600">
                        {ligne.debit > 0 ? formatMontant(ligne.debit) : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-red-500">
                        {ligne.credit > 0 ? formatMontant(ligne.credit) : "—"}
                      </td>
                    </tr>
                  ))}

                  {/* Ligne total du compte */}
                  <tr className="bg-gray-100 border-t border-gray-200">
                    <td colSpan={5} className="px-4 py-2 text-right">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Total {section.numero}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-bold text-blue-600">
                      {section.totalDebit > 0
                        ? formatMontant(section.totalDebit)
                        : "—"}
                    </td>
                    <td className="px-4 py-2 text-right font-bold text-red-500">
                      {section.totalCredit > 0
                        ? formatMontant(section.totalCredit)
                        : "—"}
                    </td>
                  </tr>
                </React.Fragment>
              ))}

              {/* Grand total général — en dehors du map */}
              <tr className="bg-[#11355b] text-white">
                <td colSpan={5} className="px-4 py-3 text-right">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Grand Total Général
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold">
                  {formatMontant(grandLivre.grandTotalDebit)}
                </td>
                <td className="px-4 py-3 text-right font-bold">
                  {formatMontant(grandLivre.grandTotalCredit)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

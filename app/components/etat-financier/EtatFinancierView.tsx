"use client";

import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { type EtatFinancier } from "@/lib/queries/etat-financier";
import { formatMontant } from "@/lib/utils/formatters";

interface Props {
  etat:              EtatFinancier;
  anneeSelectionnee: number;
  userPrismaRole:    string;
}

export default function EtatFinancierView({ etat, anneeSelectionnee, userPrismaRole }: Props) {
  const router = useRouter();
  const [chargesOuvertes, setChargesOuvertes] = useState(true);
  const [produitsOuverts, setProduitsOuverts] = useState(true);

  // Années disponibles dans le sélecteur (5 dernières années)
  const anneeActuelle = new Date().getFullYear();
  const annees = Array.from({ length: 5 }, (_, i) => anneeActuelle - i);

  const handleAnneeChange = (annee: number) => {
    router.push(`/etat-financier?annee=${annee}`);
  };

  const resultatPositif = etat.resultat > 0;
  const resultatNul     = etat.resultat === 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#11355b]">État Financier</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Charges engagées et produits — exercice {anneeSelectionnee}
          </p>
        </div>

        {/* Sélecteur d'année */}
        <select
          value={anneeSelectionnee}
          onChange={(e) => handleAnneeChange(parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 cursor-pointer"
        >
          {annees.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Cartes résumé */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <CarteResume
          label="Total Charges"
          montant={etat.totalCharges}
          couleur="red"
          icone={<TrendingDown size={20} />}
        />

        <CarteResume
          label="Total Produits"
          montant={etat.totalProduits}
          couleur="green"
          icone={<TrendingUp size={20} />}
        />

        <CarteResume
          label="Résultat"
          montant={etat.resultat}
          couleur={resultatPositif ? "green" : resultatNul ? "gray" : "red"}
          icone={resultatPositif
            ? <TrendingUp size={20} />
            : resultatNul
            ? <Minus size={20} />
            : <TrendingDown size={20} />
          }
          isResultat
        />
      </div>

      {/* Section Charges */}
      <Section
        titre="Charges"
        classeNom="Classe 6 — Charges engagées"
        total={etat.totalCharges}
        sections={etat.charges}
        ouvert={chargesOuvertes}
        onToggle={() => setChargesOuvertes((v) => !v)}
        couleur="red"
        vide="Aucune charge enregistrée pour cette période."
      />

      {/* Section Produits */}
      <Section
        titre="Produits"
        classeNom="Classe 7 — Produits perçus"
        total={etat.totalProduits}
        sections={etat.produits}
        ouvert={produitsOuverts}
        onToggle={() => setProduitsOuverts((v) => !v)}
        couleur="green"
        vide="Aucun produit enregistré pour cette période."
      />

    </div>
  );
}

// ============================================================
// Carte résumé (Charges / Produits / Résultat)
// ============================================================
function CarteResume({
  label, montant, couleur, icone, isResultat = false,
}: {
  label:      string;
  montant:    number;
  couleur:    "red" | "green" | "gray";
  icone:      React.ReactNode;
  isResultat?: boolean;
}) {
  const styles = {
    red:   { bg: "bg-red-50",   text: "text-red-600",   border: "border-red-100"   },
    green: { bg: "bg-green-50", text: "text-green-600", border: "border-green-100" },
    gray:  { bg: "bg-gray-50",  text: "text-gray-600",  border: "border-gray-100"  },
  }[couleur];

  return (
    <div className={`${styles.bg} border ${styles.border} rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
        <span className={styles.text}>{icone}</span>
      </div>
      <p className={`text-xl font-bold ${styles.text}`}>
        {isResultat && montant > 0 ? "+" : ""}
        {formatMontant(montant)}
      </p>
      {isResultat && (
        <p className="text-xs text-gray-400 mt-1">
          {montant > 0 ? "Excédent" : montant < 0 ? "Déficit" : "Équilibre"}
        </p>
      )}
    </div>
  );
}

// ============================================================
// Section dépliable (Charges ou Produits)
// ============================================================
function Section({
  titre, classeNom, total, sections, ouvert, onToggle, couleur, vide,
}: {
  titre:    string;
  classeNom: string;
  total:    number;
  sections: EtatFinancier["charges"];
  ouvert:   boolean;
  onToggle: () => void;
  couleur:  "red" | "green";
  vide:     string;
}) {
  const textCouleur = couleur === "red" ? "text-red-600" : "text-green-600";
  const bgCouleur   = couleur === "red" ? "bg-red-50"    : "bg-green-50";

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">

      {/* Header de section */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {ouvert ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
          <div className="text-left">
            <p className="font-bold text-[#11355b] text-sm">{titre}</p>
            <p className="text-xs text-gray-400">{classeNom}</p>
          </div>
        </div>
        <span className={`font-bold text-base ${textCouleur}`}>
          {formatMontant(total)}
        </span>
      </button>

      {/* Détail par compte */}
      {ouvert && (
        <div className="border-t border-gray-100">
          {sections.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">{vide}</p>
          ) : (
            sections.flatMap((s) =>
              s.comptes.map((compte) => (
                <div
                  key={compte.compteId}
                  className="flex items-center justify-between px-6 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <span className="text-xs font-mono text-gray-400 mr-2">{compte.numero}</span>
                    <span className="text-sm text-gray-700">{compte.nom}</span>
                  </div>
                  <span className={`text-sm font-semibold ${textCouleur}`}>
                    {formatMontant(compte.total)}
                  </span>
                </div>
              ))
            )
          )}

          {/* Total de la section */}
          {sections.length > 0 && (
            <div className={`flex items-center justify-between px-6 py-3 ${bgCouleur}`}>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total {titre}</span>
              <span className={`font-bold ${textCouleur}`}>{formatMontant(total)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
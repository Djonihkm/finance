"use client";

import { FaFileCsv } from "react-icons/fa";
import { type EtatFinancier } from "@/lib/queries/etat-financier";
import { formatDate } from "@/lib/utils/formatters";

interface Props {
  etat: EtatFinancier;
  annee: number;
}

function toCSV(rows: (string | number)[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const val = cell === undefined || cell === null ? "" : String(cell);
          // Échapper les guillemets et encadrer si nécessaire
          if (val.includes(",") || val.includes('"') || val.includes("\n")) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(",")
    )
    .join("\n");
}

function downloadCSV(content: string, filename: string) {
  const BOM = "\uFEFF"; // UTF-8 BOM pour Excel
  const blob = new Blob([BOM + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function EtatFinancierCSVButton({ etat, annee }: Props) {
  const handleExport = async () => {
    // ──────────────────────────────────────────────────────────────
    // FICHIER 1 — Résumé
    // ──────────────────────────────────────────────────────────────
    const resume: (string | number)[][] = [];
    resume.push([`État Financier — Exercice ${annee}`]);
    resume.push([]);
    resume.push(["Indicateur", "Montant (FCFA)"]);
    resume.push(["Total Entrées", etat.totalEntrees]);
    resume.push(["Total Charges", etat.totalCharges]);
    resume.push(["Total Produits", etat.totalProduits]);
    resume.push(["Solde Trésorerie", etat.soldeTresorerie]);
    resume.push(["Résultat", etat.resultat]);
    resume.push([
      "Situation",
      etat.resultat > 0 ? "Excédent" : etat.resultat < 0 ? "Déficit" : "Équilibre",
    ]);
    downloadCSV(toCSV(resume), `etat-financier-${annee}-resume.csv`);

    // ──────────────────────────────────────────────────────────────
    // FICHIER 2 — Trésorerie
    // ──────────────────────────────────────────────────────────────
    const treso: (string | number)[][] = [];
    treso.push([`Trésorerie — Exercice ${annee}`]);
    treso.push([]);
    treso.push(["N° Compte", "Nom du compte", "Date", "Libellé", "Montant (FCFA)"]);

    for (const section of etat.tresorerie) {
      treso.push([`${section.numero} — ${section.nom}`, "", "", "", ""]);
      for (const entree of section.entrees) {
        treso.push([
          section.numero,
          section.nom,
          formatDate(entree.date),
          entree.libelle,
          entree.montant,
        ]);
      }
      treso.push(["", `Entrées ${section.numero}`, "", "", section.totalEntrees]);
      treso.push(["", `Sorties ${section.numero}`, "", "", -section.totalSorties]);
      treso.push(["", `Solde ${section.numero}`, "", "", section.solde]);
      treso.push([]);
    }

    treso.push(["", "TOTAL ENTRÉES", "", "", etat.totalEntrees]);
    treso.push(["", "TOTAL SORTIES", "", "", -etat.totalSorties]);
    treso.push(["", "SOLDE TRÉSORERIE", "", "", etat.soldeTresorerie]);
    downloadCSV(toCSV(treso), `etat-financier-${annee}-tresorerie.csv`);

    // ──────────────────────────────────────────────────────────────
    // FICHIER 3 — Charges
    // ──────────────────────────────────────────────────────────────
    const charges: (string | number)[][] = [];
    charges.push([`Charges — Exercice ${annee}`]);
    charges.push([]);
    charges.push(["N° Compte", "Nom du compte", "Montant (FCFA)"]);

    for (const section of etat.charges) {
      charges.push([`Classe ${section.classeNumero} — ${section.classeNom}`, "", ""]);
      for (const compte of section.comptes) {
        charges.push([compte.numero, compte.nom, compte.total]);
      }
      charges.push(["", `Total ${section.classeNom}`, section.total]);
      charges.push([]);
    }

    charges.push(["", "TOTAL CHARGES", etat.totalCharges]);
    downloadCSV(toCSV(charges), `etat-financier-${annee}-charges.csv`);

    // ──────────────────────────────────────────────────────────────
    // FICHIER 4 — Produits
    // ──────────────────────────────────────────────────────────────
    const produits: (string | number)[][] = [];
    produits.push([`Produits — Exercice ${annee}`]);
    produits.push([]);
    produits.push(["N° Compte", "Nom du compte", "Montant (FCFA)"]);

    for (const section of etat.produits) {
      produits.push([`Classe ${section.classeNumero} — ${section.classeNom}`, "", ""]);
      for (const compte of section.comptes) {
        produits.push([compte.numero, compte.nom, compte.total]);
      }
      produits.push(["", `Total ${section.classeNom}`, section.total]);
      produits.push([]);
    }

    produits.push(["", "TOTAL PRODUITS", etat.totalProduits]);
    downloadCSV(toCSV(produits), `etat-financier-${annee}-produits.csv`);  
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center justify-center w-9 h-9 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors cursor-pointer"
      title="Exporter CSVvvgo"
    >
      <FaFileCsv size={18} />
    </button>
  );
}
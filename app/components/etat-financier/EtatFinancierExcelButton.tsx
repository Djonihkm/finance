"use client";

import { FaFileExcel } from "react-icons/fa";
import { type EtatFinancier } from "@/lib/queries/etat-financier";
import { formatDate } from "@/lib/utils/formatters";

interface Props {
  etat: EtatFinancier;
  annee: number;
}

export function EtatFinancierExcelButton({ etat, annee }: Props) {
  const handleExport = async () => {
    const XLSX = await import("xlsx");

    const wb = XLSX.utils.book_new();

    // ──────────────────────────────────────────────────────────────
    // FEUILLE 1 — Résumé
    // ──────────────────────────────────────────────────────────────
    const resume: (string | number)[][] = [];

    resume.push([`État Financier — Exercice ${annee}`]);
    resume.push([]);
    resume.push(["Indicateur", "Montant (FCFA)"]);
    resume.push(["Total Entrées", etat.totalEntrees]);
    resume.push(["Total Charges", etat.totalCharges]);
    resume.push(["Total Produits", etat.totalProduits]);
    resume.push(["Solde Trésorerie", etat.soldeTresorerie]);
    resume.push([
      "Résultat",
      etat.resultat,
    ]);
    resume.push([
      "Situation",
      etat.resultat > 0 ? "Excédent" : etat.resultat < 0 ? "Déficit" : "Équilibre",
    ]);

    const wsResume = XLSX.utils.aoa_to_sheet(resume);
    wsResume["!cols"] = [{ wch: 24 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsResume, "Résumé");

    // ──────────────────────────────────────────────────────────────
    // FEUILLE 2 — Trésorerie
    // ──────────────────────────────────────────────────────────────
    const treso: (string | number)[][] = [];

    treso.push([`Trésorerie — Exercice ${annee}`]);
    treso.push([]);
    treso.push(["N° Compte", "Nom du compte", "Date", "Libellé", "Montant (FCFA)"]);

    for (const section of etat.tresorerie) {
      // Ligne section compte
      treso.push([
        `${section.numero} — ${section.nom}`,
        "", "", "", "",
      ]);

      for (const entree of section.entrees) {
        treso.push([
          section.numero,
          section.nom,
          formatDate(entree.date),
          entree.libelle,
          entree.montant,
        ]);
      }

      // Sous-totaux du compte
      treso.push(["", `Entrées ${section.numero}`, "", "", section.totalEntrees]);
      treso.push(["", `Sorties ${section.numero}`, "", "", -section.totalSorties]);
      treso.push(["", `Solde ${section.numero}`,   "", "", section.solde]);
      treso.push([]);
    }

    // Total général trésorerie
    treso.push(["", "TOTAL ENTRÉES",     "", "", etat.totalEntrees]);
    treso.push(["", "TOTAL SORTIES",     "", "", -etat.totalSorties]);
    treso.push(["", "SOLDE TRÉSORERIE",  "", "", etat.soldeTresorerie]);

    const wsTreso = XLSX.utils.aoa_to_sheet(treso);
    wsTreso["!cols"] = [
      { wch: 14 },
      { wch: 28 },
      { wch: 14 },
      { wch: 36 },
      { wch: 18 },
    ];
    XLSX.utils.book_append_sheet(wb, wsTreso, "Trésorerie");

    // ──────────────────────────────────────────────────────────────
    // FEUILLE 3 — Charges (Classe 6)
    // ──────────────────────────────────────────────────────────────
    const charges: (string | number)[][] = [];

    charges.push([`Charges — Exercice ${annee}`]);
    charges.push([]);
    charges.push(["N° Compte", "Nom du compte", "Montant (FCFA)"]);

    for (const section of etat.charges) {
      // Ligne classe
      charges.push([`Classe ${section.classeNumero} — ${section.classeNom}`, "", ""]);

      for (const compte of section.comptes) {
        charges.push([compte.numero, compte.nom, compte.total]);
      }

      charges.push(["", `Total ${section.classeNom}`, section.total]);
      charges.push([]);
    }

    charges.push(["", "TOTAL CHARGES", etat.totalCharges]);

    const wsCharges = XLSX.utils.aoa_to_sheet(charges);
    wsCharges["!cols"] = [{ wch: 14 }, { wch: 36 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsCharges, "Charges");

    // ──────────────────────────────────────────────────────────────
    // FEUILLE 4 — Produits (Classe 7)
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

    const wsProduits = XLSX.utils.aoa_to_sheet(produits);
    wsProduits["!cols"] = [{ wch: 14 }, { wch: 36 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsProduits, "Produits");

    // ──────────────────────────────────────────────────────────────
    // Téléchargement
    // ──────────────────────────────────────────────────────────────
    XLSX.writeFile(wb, `etat-financier-${annee}.xlsx`);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center justify-center w-9 h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
      title="Exporter Excel"
    >
      <FaFileExcel size={18} />
    </button>
  );
}

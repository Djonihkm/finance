"use client";

// import { FileSpreadsheet } from "lucide-react";
import { type GrandLivre } from "@/lib/queries/grandLivre";
import { formatDate } from "@/lib/utils/formatters";
import { FaFileExcel } from "react-icons/fa";

interface Props {
  grandLivre: GrandLivre;
  annee: number;
}

export function GrandLivreExcelButton({ grandLivre, annee }: Props) {
  const handleExport = async () => {
    // Import dynamique pour éviter le SSR
    const XLSX = await import("xlsx");

    // Construction des lignes
    const rows: (string | number)[][] = [];

    // En-tête
    rows.push([
      "N° Compte",
      "Nom du compte",
      "Classe",
      "Date",
      "Libellé",
      "Référence",
      "Débit (FCFA)",
      "Crédit (FCFA)",
    ]);

    for (const section of grandLivre.sections) {
      // Ligne de séparation par compte
      rows.push([
        `${section.numero} — ${section.nom}`,
        "",
        section.classeNom,
        "",
        "",
        "",
        "",
        "",
      ]);

      for (const ligne of section.lignes) {
        rows.push([
          section.numero,
          section.nom,
          section.classeNom,
          formatDate(ligne.date),
          ligne.libelle ?? "",
          ligne.reference ?? "",
          ligne.debit > 0 ? ligne.debit : "",
          ligne.credit > 0 ? ligne.credit : "",
        ]);
      }

      // Ligne de total par compte
      rows.push([
        "",
        `Total ${section.numero}`,
        "",
        "",
        "",
        "",
        section.totalDebit > 0 ? section.totalDebit : "",
        section.totalCredit > 0 ? section.totalCredit : "",
      ]);

      // Ligne vide de séparation
      rows.push([]);
    }

    // Grand total
    rows.push([
      "",
      "GRAND TOTAL GÉNÉRAL",
      "",
      "",
      "",
      "",
      grandLivre.grandTotalDebit,
      grandLivre.grandTotalCredit,
    ]);

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Largeurs de colonnes
    ws["!cols"] = [
      { wch: 14 }, // N° Compte
      { wch: 28 }, // Nom
      { wch: 18 }, // Classe
      { wch: 14 }, // Date
      { wch: 36 }, // Libellé
      { wch: 20 }, // Référence
      { wch: 18 }, // Débit
      { wch: 18 }, // Crédit
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Grand Livre ${annee}`);
    XLSX.writeFile(wb, `grand-livre-${annee}.xlsx`);
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

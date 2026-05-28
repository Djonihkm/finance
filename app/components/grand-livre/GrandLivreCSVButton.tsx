"use client";

import { type GrandLivre } from "@/lib/queries/grandLivre";
import { formatDate } from "@/lib/utils/formatters";
import { FaFileCsv } from "react-icons/fa";

interface Props {
  grandLivre: GrandLivre;
  annee: number;
}

export function GrandLivreCSVButton({ grandLivre, annee }: Props) {
  const handleExport = () => {
    const sep = ";";
    const lines: string[] = [];

    lines.push(
      [
        "N° Compte",
        "Nom du compte",
        "Classe",
        "Date",
        "Libellé",
        "Référence",
        "Débit",
        "Crédit",
      ].join(sep),
    );

    for (const section of grandLivre.sections) {
      for (const ligne of section.lignes) {
        lines.push(
          [
            section.numero,
            section.nom,
            section.classeNom,
            formatDate(ligne.date),
            ligne.libelle ?? "",
            ligne.reference ?? "",
            ligne.debit > 0 ? ligne.debit : "",
            ligne.credit > 0 ? ligne.credit : "",
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(sep),
        );
      }
      lines.push(
        [
          "",
          `Total ${section.numero}`,
          "",
          "",
          "",
          "",
          section.totalDebit || "",
          section.totalCredit || "",
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(sep),
      );
      lines.push("");
    }

    lines.push(
      [
        "",
        "GRAND TOTAL",
        "",
        "",
        "",
        "",
        grandLivre.grandTotalDebit,
        grandLivre.grandTotalCredit,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(sep),
    );

    const blob = new Blob(["\uFEFF" + lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grand-livre-${annee}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center justify-center w-9 h-9 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors cursor-pointer"
      title="Exporter CSV"
    >
      <FaFileCsv size={18} />
    </button>
  );
}

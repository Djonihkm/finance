"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileDown } from "lucide-react";
import { type GrandLivre } from "@/lib/queries/grandLivre";
import { GrandLivrePDFDocument } from "./GrandLivrePDF";

interface Props {
  grandLivre: GrandLivre;
  annee: number;
}

export function GrandLivreExportButton({ grandLivre, annee }: Props) {
  return (
    <PDFDownloadLink
      document={<GrandLivrePDFDocument grandLivre={grandLivre} annee={annee} />}
      fileName={`grand-livre-${annee}.pdf`}
    >
      {({ loading }) => (
        <button
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-[#11355b] hover:bg-[#1a4a7a] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <FileDown size={15} />
          {loading ? "Génération..." : "Exporter PDF"}
        </button>
      )}
    </PDFDownloadLink>
  );
}

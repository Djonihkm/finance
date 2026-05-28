"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileDown } from "lucide-react";
import { type EtatFinancier } from "@/lib/queries/etat-financier";
import { EtatFinancierPDFDocument } from "./EtatFinancierPDF";

interface Props {
  etat: EtatFinancier;
  annee: number;
}

export function EtatFinancierExportButton({ etat, annee }: Props) {
  return (
    <PDFDownloadLink
      document={<EtatFinancierPDFDocument etat={etat} annee={annee} />}
      fileName={`etat-financier-${annee}.pdf`}
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

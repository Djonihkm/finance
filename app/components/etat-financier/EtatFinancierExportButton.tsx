"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
// import { FileDown } from "lucide-react";
import { type EtatFinancier } from "@/lib/queries/etat-financier";
import { EtatFinancierPDFDocument } from "./EtatFinancierPDF";
import { FaFilePdf } from "react-icons/fa";

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
          className="flex items-center justify-center w-9 h-9 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-lg transition-colors cursor-pointer"
        >
          <FaFilePdf size={18} />
        </button>
      )}
    </PDFDownloadLink>
  );
}

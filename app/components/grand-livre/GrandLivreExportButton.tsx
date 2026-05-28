"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
// import { FileDown } from "lucide-react";
import { type GrandLivre } from "@/lib/queries/grandLivre";
import { GrandLivrePDFDocument } from "./GrandLivrePDF";
import { FaFilePdf } from "react-icons/fa";

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
          className="flex items-center justify-center w-9 h-9 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-lg transition-colors cursor-pointer"
        >
          <FaFilePdf size={18} />
        </button>
      )}
    </PDFDownloadLink>
  );
}

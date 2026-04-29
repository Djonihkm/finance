"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNavigation } from "@/lib/navigation-context";
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, FileText, Info, MessageSquare, Loader2, Pencil, Send } from "lucide-react";
import { toast } from "sonner";
import { type DepenseRow } from "@/lib/queries";
import {
  formatMontant, formatDate, formatCategorie, formatPaiement,
  STATUT_COLORS, formatStatut,
} from "@/lib/utils/formatters";

interface Props {
  data: DepenseRow;
  backPath: string;
  userPrismaRole?: string;
}

export default function DepenseDetailView({ data, backPath, userPrismaRole }: Props) {
  const router = useRouter();
  const { navigate } = useNavigation();
  const [loading, setLoading] = useState<string | null>(null);
  const [showRenvoyer, setShowRenvoyer] = useState(false);
  const [commentaire, setCommentaire] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  const isDirecteur = userPrismaRole === "DIRECTEUR";
  const isComptable = userPrismaRole === "COMPTABLE" || userPrismaRole === "ADMIN";
  const canAct = isDirecteur && (data.statut === "ATTENTE" || data.statut === "REVISION");
  const canResoumettre = isComptable && data.statut === "REVISION";

  const handleResoumettre = async () => {
    setLoading("resoumettre");
    try {
      const res = await fetch(`/api/depenses/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resoumettre" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Dépense resoumise pour validation.");
      router.refresh();
    } catch {
      toast.error("Erreur lors de l'opération.");
    } finally {
      setLoading(null);
    }
  };

  const handleAction = async (action: "valider" | "rejeter" | "renvoyer") => {
    if (action === "renvoyer" && !commentaire.trim()) {
      toast.error("Un commentaire est requis pour renvoyer.");
      return;
    }
    setLoading(action);
    try {
      const res = await fetch(`/api/depenses/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, commentaire: commentaire || undefined }),
      });
      if (!res.ok) throw new Error();
      toast.success(
        action === "valider" ? "Dépense validée." :
        action === "rejeter" ? "Dépense rejetée." :
        "Dépense renvoyée pour révision."
      );
      router.refresh();
    } catch {
      toast.error("Erreur lors de l'opération.");
    } finally {
      setLoading(null);
      setShowRenvoyer(false);
    }
  };

  const montant = parseFloat(data.montant.toString());

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

      <button
        type="button"
        onClick={() => navigate(backPath)}
        className="flex items-center gap-2 text-gray-600 hover:text-[#11355b] transition-colors cursor-pointer font-medium py-2 mb-4"
      >
        <ArrowLeft size={18} />
        Retour Dépenses
      </button>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4 lg:gap-6">

        {/* Document */}
        <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm">
          <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100">
            <div>
              <h1 className="text-xl font-bold text-[#11355b]">{data.intitule}</h1>
              <p className="text-xs text-gray-400 font-mono mt-1">{data.reference}</p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${STATUT_COLORS[data.statut] ?? "bg-gray-100 text-gray-600"}`}>
              {formatStatut(data.statut)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <InfoBlock label="Date" value={formatDate(data.date)} />
            <InfoBlock label="Montant" value={formatMontant(montant)} highlight />
            <InfoBlock label="Catégorie" value={formatCategorie(data.categorie)} />
            <InfoBlock label="Mode de paiement" value={formatPaiement(data.paiement)} />
            <InfoBlock label="Établissement" value={data.etablissement.nom} />
            <InfoBlock label="Créé par" value={`${data.createdBy.prenom} ${data.createdBy.nom}`} />
          </div>

          {data.fournisseur && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fournisseur</p>
              <p className="text-sm font-semibold text-[#11355b]">{data.fournisseur}</p>
            </div>
          )}

          {data.description && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-gray-700">{data.description}</p>
            </div>
          )}

          {data.pieceJustificativeUrl && (() => {
            const url = data.pieceJustificativeUrl!;
            const isImage = /\.(jpg|jpeg|png|webp)(\?|$)/i.test(url);
            return (
              <div className="mt-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pièce justificative</p>
                {isImage ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                    <img
                      src={url}
                      alt="Pièce justificative"
                      className="w-full max-h-64 object-contain rounded-lg border border-gray-200 bg-gray-50 hover:opacity-90 transition-opacity cursor-zoom-in"
                    />
                    <p className="text-xs text-gray-400 mt-1 text-center">Cliquer pour agrandir</p>
                  </a>
                ) : (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 border border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-lg px-4 py-3 transition-colors"
                  >
                    <FileText size={20} className="text-red-500 shrink-0" />
                    <span className="text-sm font-medium text-[#11355b]">Voir le document PDF</span>
                  </a>
                )}
              </div>
            );
          })()}

        </div>

        {/* Sidebar actions */}
        <div className="space-y-4 lg:sticky lg:top-4 h-fit">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">
              Actions
            </h3>

            {canAct && !showRenvoyer && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleAction("valider")}
                  disabled={loading !== null}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <CheckCircle size={18} />
                  {loading === "valider" ? "En cours…" : "Valider"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowRenvoyer(true)}
                  disabled={loading !== null}
                  className="w-full bg-orange-400 hover:bg-orange-500 disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <RotateCcw size={18} />
                  Renvoyer pour révision
                </button>

                <button
                  type="button"
                  onClick={() => handleAction("rejeter")}
                  disabled={loading !== null}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <XCircle size={18} />
                  {loading === "rejeter" ? "En cours…" : "Rejeter"}
                </button>
              </div>
            )}

            {canAct && showRenvoyer && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">Précisez ce qui doit être corrigé :</p>
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  rows={4}
                  placeholder="Indiquez les corrections à apporter…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all resize-none"
                />
                <button
                  type="button"
                  onClick={() => handleAction("renvoyer")}
                  disabled={loading !== null}
                  className="w-full bg-orange-400 hover:bg-orange-500 disabled:opacity-50 text-white py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <RotateCcw size={16} />
                  {loading === "renvoyer" ? "En cours…" : "Confirmer le renvoi"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowRenvoyer(false); setCommentaire(""); }}
                  className="w-full text-gray-500 hover:text-gray-700 text-sm py-1 cursor-pointer transition-colors"
                >
                  Annuler
                </button>
              </div>
            )}

            {canResoumettre && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => navigate(`/depensesEtablissement/${encodeURIComponent(data.reference)}/modifier`)}
                  className="w-full bg-[#11355b] hover:bg-[#1a4a7a] text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Pencil size={18} />
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={handleResoumettre}
                  disabled={loading !== null}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Send size={18} />
                  {loading === "resoumettre" ? "En cours…" : "Resoumettre"}
                </button>
              </div>
            )}

            {!canAct && !canResoumettre && (
              <p className="text-xs text-gray-400 text-center py-2">
                {data.statut === "VALIDE" ? "Dépense validée." :
                 data.statut === "REJETE" ? "Dépense rejetée." :
                 !isDirecteur ? "En attente de décision du directeur." :
                 "Aucune action disponible."}
              </p>
            )}

            <div className={`space-y-3 border-t border-gray-100 pt-3 ${canAct ? "mt-4" : ""}`}>
              <button
                type="button"
                disabled={pdfLoading}
                onClick={async () => {
                  setPdfLoading(true);
                  try {
                    const { createElement } = await import("react");
                    const { DepensePDF } = await import("@/lib/pdf/DepensePDF");
                    const { downloadPDF } = await import("@/lib/pdf/downloadPDF");
                    await downloadPDF(
                      createElement(DepensePDF, { data }),
                      `${data.reference}.pdf`,
                    );
                  } catch {
                    toast.error("Erreur lors de la génération du PDF.");
                  } finally {
                    setPdfLoading(false);
                  }
                }}
                className="flex items-center gap-3 text-sm text-orange-500 hover:text-orange-600 py-2 w-full font-medium cursor-pointer transition-colors disabled:opacity-60"
              >
                {pdfLoading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                {pdfLoading ? "Génération…" : "Télécharger PDF"}
              </button>
            </div>
          </div>

          {/* <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-3">
            <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              Ce document est officiel. Toute modification après validation nécessite une réémission.
            </p>
          </div> */}

          {data.commentaire && (
            <div
              style={{ animation: "wiggle 4s ease-in-out infinite" }}
              className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3"
            >
              <MessageSquare size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1.5">
                  {isDirecteur ? "Votre commentaire" : "Commentaire du directeur"}
                </p>
                <p className="text-xs text-amber-800 leading-relaxed">{data.commentaire}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value, highlight = false }: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? "text-emerald-600 text-base" : "text-gray-800"}`}>
        {value}
      </p>
    </div>
  );
}

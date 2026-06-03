"use client";

import { useState } from "react";
import { ArrowLeft, FileSignature, ClipboardList, AlertTriangle } from "lucide-react";
import { useNavigation } from "@/lib/navigation-context";
import { toast } from "sonner";
import {
  formatDate,
  formatMontant,
  formatStatutContrat,
  STATUT_CONTRAT_COLORS,
  formatTypeMarche,
  STATUT_COLORS,
  formatStatut,
} from "@/lib/utils/formatters";

interface BonCommande {
  id: string;
  reference: string;
  montantTotal: string | number;
  statut: string;
  date: string;
}

interface Contrat {
  id: string;
  reference: string;
  objet: string;
  description: string | null;
  montantTotal: string | number;
  dateDebut: string;
  dateFin: string;
  statut: string;
  resilieAt: string | null;
  motifResiliation: string | null;
  createdAt: string;
  createdBy: { nom: string; prenom: string };
  resiliePar: { nom: string; prenom: string } | null;
  fournisseur: { id: string; nom: string; telephone: string | null; email: string | null; rccm: string | null };
  marche: { id: string; reference: string; objet: string; type: string; montantEstime: string | number };
  etablissement: { id: string; nom: string };
  bonsCommande: BonCommande[];
}

interface Props {
  contrat: Contrat;
  userPrismaRole: string;
}

export default function ContratDetailView({ contrat, userPrismaRole }: Props) {
  const { navigate } = useNavigation();
  const [showResilier, setShowResilier] = useState(false);
  const [motif, setMotif] = useState("");
  const [loading, setLoading] = useState(false);

  const canResilier =
    contrat.statut === "ACTIF" &&
    ["SUPER_ADMIN", "MINISTERE", "DIRECTEUR", "COMPTABLE"].includes(userPrismaRole);

  const montantEngage = contrat.bonsCommande.reduce(
    (s, b) => s + parseFloat(b.montantTotal.toString()),
    0
  );
  const montantTotal = parseFloat(contrat.montantTotal.toString());
  const montantRestant = montantTotal - montantEngage;
  const tauxConsommation = montantTotal > 0 ? (montantEngage / montantTotal) * 100 : 0;

  const handleResilier = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contrats/${contrat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resilier", motifResiliation: motif }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      toast.success("Contrat résilié");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate("/marches?tab=contrats")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#11355b] cursor-pointer transition-colors">
        <ArrowLeft size={16} /> Retour aux contrats
      </button>

      {/* Fiche contrat */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-xs text-gray-400">{contrat.reference}</span>
              <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase ${STATUT_CONTRAT_COLORS[contrat.statut] ?? "bg-gray-100 text-gray-600"}`}>
                {formatStatutContrat(contrat.statut)}
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#11355b]">{contrat.objet}</h2>
            <p className="text-sm text-gray-400 mt-1">
              Créé le {formatDate(contrat.createdAt)} par {contrat.createdBy.prenom} {contrat.createdBy.nom}
            </p>
          </div>
          {canResilier && !showResilier && (
            <button
              onClick={() => setShowResilier(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50 transition-colors cursor-pointer"
            >
              <AlertTriangle size={15} /> Résilier
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-6">
          <InfoField label="Montant total" value={formatMontant(contrat.montantTotal)} />
          <InfoField label="Date de début" value={formatDate(contrat.dateDebut)} />
          <InfoField label="Date de fin" value={formatDate(contrat.dateFin)} />
          <InfoField label="Établissement" value={contrat.etablissement.nom} />
          {contrat.statut === "RESILIE" && contrat.resiliePar && (
            <InfoField label="Résilié par" value={`${contrat.resiliePar.prenom} ${contrat.resiliePar.nom}`} />
          )}
          {contrat.resilieAt && (
            <InfoField label="Date résiliation" value={formatDate(contrat.resilieAt)} />
          )}
        </div>

        {contrat.motifResiliation && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
            <strong>Motif de résiliation :</strong> {contrat.motifResiliation}
          </div>
        )}

        {contrat.description && !contrat.motifResiliation && (
          <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">{contrat.description}</div>
        )}
      </div>

      {/* Résiliation */}
      {showResilier && (
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <h3 className="font-bold text-red-600 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} /> Résiliation du contrat
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Cette action est irréversible. Le contrat passera au statut <strong>Résilié</strong>.
          </p>
          <div className="mb-4">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Motif de résiliation
            </label>
            <textarea
              rows={3}
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Expliquez la raison de la résiliation…"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowResilier(false)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 text-sm hover:bg-gray-50 cursor-pointer">
              Annuler
            </button>
            <button onClick={handleResilier} disabled={loading}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-60">
              {loading ? "En cours…" : "Confirmer la résiliation"}
            </button>
          </div>
        </div>
      )}

      {/* Fournisseur */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-[#11355b] mb-4">Fournisseur</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <InfoField label="Nom" value={contrat.fournisseur.nom} />
          <InfoField label="Téléphone" value={contrat.fournisseur.telephone} />
          <InfoField label="Email" value={contrat.fournisseur.email} />
          <InfoField label="RCCM" value={contrat.fournisseur.rccm} />
        </div>
        <button
          onClick={() => navigate(`/fournisseurs/${contrat.fournisseur.id}`)}
          className="mt-4 text-xs text-[#11355b] hover:underline cursor-pointer"
        >
          Voir la fiche fournisseur →
        </button>
      </div>

      {/* Marché associé */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-[#11355b] mb-4 flex items-center gap-2">
          <FileSignature size={18} /> Marché associé
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <InfoField label="Référence" value={contrat.marche.reference} />
          <InfoField label="Objet" value={contrat.marche.objet} />
          <InfoField label="Type" value={formatTypeMarche(contrat.marche.type)} />
          <InfoField label="Montant estimé" value={formatMontant(contrat.marche.montantEstime)} />
        </div>
        <button
          onClick={() => navigate(`/marches/${contrat.marche.id}`)}
          className="mt-4 text-xs text-[#11355b] hover:underline cursor-pointer"
        >
          Voir le marché →
        </button>
      </div>

      {/* Consommation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-[#11355b] mb-4">Consommation du contrat</h3>
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Engagé : {formatMontant(montantEngage)}</span>
            <span>{tauxConsommation.toFixed(1)}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${tauxConsommation > 90 ? "bg-red-500" : tauxConsommation > 70 ? "bg-amber-500" : "bg-emerald-500"}`}
              style={{ width: `${Math.min(tauxConsommation, 100)}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-[11px] font-bold text-gray-400 uppercase">Total</p>
            <p className="font-bold text-[#11355b] text-sm">{formatMontant(montantTotal)}</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] font-bold text-gray-400 uppercase">Engagé</p>
            <p className="font-bold text-amber-600 text-sm">{formatMontant(montantEngage)}</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] font-bold text-gray-400 uppercase">Restant</p>
            <p className={`font-bold text-sm ${montantRestant < 0 ? "text-red-600" : "text-emerald-600"}`}>
              {formatMontant(Math.max(0, montantRestant))}
            </p>
          </div>
        </div>
      </div>

      {/* Bons de commande */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-[#11355b] flex items-center gap-2">
            <ClipboardList size={18} /> Bons de commande ({contrat.bonsCommande.length})
          </h3>
        </div>
        {contrat.bonsCommande.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-400 text-center">
            Aucun bon de commande lié à ce contrat.
          </p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50">
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {contrat.bonsCommande.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => navigate(`/depensesEtablissement/bons/${encodeURIComponent(b.reference)}`)}
                  className="border-t border-gray-50 hover:bg-blue-50/40 cursor-pointer"
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.reference}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(b.date)}</td>
                  <td className="px-4 py-3 font-bold text-[#11355b]">{formatMontant(b.montantTotal)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase ${STATUT_COLORS[b.statut] ?? "bg-gray-100 text-gray-600"}`}>
                      {formatStatut(b.statut)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value ?? "—"}</p>
    </div>
  );
}

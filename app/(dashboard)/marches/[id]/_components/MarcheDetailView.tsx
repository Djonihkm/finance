"use client";

import { useState } from "react";
import { ArrowLeft, UserCheck, FileSignature } from "lucide-react";
import { useNavigation } from "@/lib/navigation-context";
import { toast } from "sonner";
import {
  formatTypeMarche,
  formatDate,
  formatMontant,
  formatStatutMarche,
  STATUT_MARCHE_COLORS,
  formatStatutContrat,
  STATUT_CONTRAT_COLORS,
} from "@/lib/utils/formatters";

interface Fournisseur {
  id: string;
  nom: string;
  categorie: string;
  telephone: string | null;
  email: string | null;
}

interface Marche {
  id: string;
  reference: string;
  objet: string;
  description: string | null;
  type: string;
  montantEstime: string | number;
  statut: string;
  attribueAt: string | null;
  createdAt: string;
  createdBy: { nom: string; prenom: string };
  attribuePar: { nom: string; prenom: string } | null;
  fournisseur: { id: string; nom: string; telephone: string | null; email: string | null } | null;
  contrat: { id: string; reference: string; statut: string } | null;
  etablissement: { id: string; nom: string };
}

interface Props {
  marche: Marche;
  fournisseurs: Fournisseur[];
  userPrismaRole: string;
}

export default function MarcheDetailView({ marche, fournisseurs, userPrismaRole }: Props) {
  const { navigate } = useNavigation();
  const [showAttribution, setShowAttribution] = useState(false);
  const [showContrat, setShowContrat] = useState(false);
  const [fournisseurId, setFournisseurId] = useState("");
  const [loading, setLoading] = useState(false);

  const [contratForm, setContratForm] = useState({
    objet: marche.objet,
    description: "",
    montantTotal: marche.montantEstime.toString(),
    dateDebut: new Date().toISOString().slice(0, 10),
    dateFin: "",
  });

  const canAttribuer = ["SUPER_ADMIN", "MINISTERE", "ADMIN", "COMPTABLE"].includes(userPrismaRole);
  const canCreateContrat = ["SUPER_ADMIN", "MINISTERE", "COMPTABLE"].includes(userPrismaRole);

  const handleAttribuer = async () => {
    if (!fournisseurId) { toast.error("Sélectionnez un fournisseur"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/marches/${marche.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "attribuer", fournisseurId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      toast.success("Marché attribué avec succès");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContrat = async () => {
    if (!contratForm.dateFin) { toast.error("La date de fin est requise"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/contrats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...contratForm, marcheId: marche.id, montantTotal: parseFloat(contratForm.montantTotal) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      toast.success("Contrat créé avec succès");
      navigate(`/contrats/${data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-all";
  const labelClass = "block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate("/marches")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#11355b] cursor-pointer transition-colors">
        <ArrowLeft size={16} /> Retour aux marchés
      </button>

      {/* Fiche principale */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-xs text-gray-400">{marche.reference}</span>
              <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase ${STATUT_MARCHE_COLORS[marche.statut] ?? "bg-gray-100 text-gray-600"}`}>
                {formatStatutMarche(marche.statut)}
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#11355b]">{marche.objet}</h2>
            <p className="text-sm text-gray-400 mt-1">
              Créé le {formatDate(marche.createdAt)} par {marche.createdBy.prenom} {marche.createdBy.nom}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-6">
          <InfoField label="Type" value={formatTypeMarche(marche.type)} />
          <InfoField label="Montant estimé" value={formatMontant(marche.montantEstime)} />
          <InfoField label="Établissement" value={marche.etablissement.nom} />
          {marche.fournisseur && (
            <>
              <InfoField label="Fournisseur attribué" value={marche.fournisseur.nom} />
              {marche.attribuePar && (
                <InfoField label="Attribué par" value={`${marche.attribuePar.prenom} ${marche.attribuePar.nom}`} />
              )}
              {marche.attribueAt && (
                <InfoField label="Date attribution" value={formatDate(marche.attribueAt)} />
              )}
            </>
          )}
        </div>

        {marche.description && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            {marche.description}
          </div>
        )}
      </div>

      {/* Contrat existant */}
      {marche.contrat && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-[#11355b] mb-4 flex items-center gap-2">
            <FileSignature size={18} /> Contrat associé
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs text-gray-400">{marche.contrat.reference}</p>
              <span className={`mt-1 inline-block px-2 py-1 rounded text-[11px] font-bold uppercase ${STATUT_CONTRAT_COLORS[marche.contrat.statut] ?? "bg-gray-100 text-gray-600"}`}>
                {formatStatutContrat(marche.contrat.statut)}
              </span>
            </div>
            <button
              onClick={() => navigate(`/contrats/${marche.contrat!.id}`)}
              className="px-4 py-2 bg-[#11355b] text-white rounded-lg text-sm font-semibold hover:bg-[#1a4a7a] cursor-pointer"
            >
              Voir le contrat →
            </button>
          </div>
        </div>
      )}

      {/* Attribution fournisseur */}
      {marche.statut === "EN_ATTENTE" && canAttribuer && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-[#11355b] mb-4 flex items-center gap-2">
            <UserCheck size={18} /> Attribution du fournisseur
          </h3>
          {!showAttribution ? (
            <button
              onClick={() => setShowAttribution(true)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold cursor-pointer transition-colors"
            >
              Attribuer un fournisseur
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Sélectionner le fournisseur *</label>
                <select value={fournisseurId} onChange={(e) => setFournisseurId(e.target.value)} className={inputClass}>
                  <option value="">-- Choisir un fournisseur --</option>
                  {fournisseurs.map((f) => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </select>
                {fournisseurs.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    Aucun fournisseur disponible.{" "}
                    <span className="underline cursor-pointer" onClick={() => navigate("/fournisseurs/nouveau")}>
                      Créer un fournisseur
                    </span>
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAttribution(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 text-sm hover:bg-gray-50 cursor-pointer">
                  Annuler
                </button>
                <button onClick={handleAttribuer} disabled={loading || !fournisseurId}
                  className="px-5 py-2 bg-[#11355b] text-white rounded-lg text-sm font-semibold hover:bg-[#1a4a7a] cursor-pointer disabled:opacity-60">
                  {loading ? "En cours…" : "Confirmer l'attribution"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Créer le contrat */}
      {marche.statut === "ATTRIBUE" && !marche.contrat && canCreateContrat && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-[#11355b] mb-4 flex items-center gap-2">
            <FileSignature size={18} /> Créer le contrat
          </h3>
          {!showContrat ? (
            <button
              onClick={() => setShowContrat(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold cursor-pointer transition-colors"
            >
              Créer le contrat avec {marche.fournisseur?.nom}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Objet du contrat *</label>
                  <input value={contratForm.objet} onChange={(e) => setContratForm((p) => ({ ...p, objet: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Montant total (FCFA) *</label>
                  <input type="number" min="0" value={contratForm.montantTotal}
                    onChange={(e) => setContratForm((p) => ({ ...p, montantTotal: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Date de début *</label>
                  <input type="date" value={contratForm.dateDebut}
                    onChange={(e) => setContratForm((p) => ({ ...p, dateDebut: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Date de fin *</label>
                  <input type="date" value={contratForm.dateFin}
                    onChange={(e) => setContratForm((p) => ({ ...p, dateFin: e.target.value }))} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Description</label>
                  <textarea rows={3} value={contratForm.description}
                    onChange={(e) => setContratForm((p) => ({ ...p, description: e.target.value }))}
                    className={inputClass + " resize-none"} />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowContrat(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 text-sm hover:bg-gray-50 cursor-pointer">
                  Annuler
                </button>
                <button onClick={handleCreateContrat} disabled={loading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-60">
                  {loading ? "Création…" : "Créer le contrat"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
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

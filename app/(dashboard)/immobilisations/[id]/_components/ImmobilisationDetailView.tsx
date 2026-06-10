"use client";

import { useState } from "react";
import {
  ArrowLeft, Package, Pencil, X, Check,
  AlertTriangle, ClipboardList,
} from "lucide-react";
import { useNavigation } from "@/lib/navigation-context";
import { toast } from "sonner";
import {
  formatDate,
  formatMontant,
  formatCategorieImmo,
  formatEtatImmo,
  formatStatutImmo,
  ETAT_IMMO_COLORS,
  STATUT_IMMO_COLORS,
  CATEGORIE_IMMO_LABELS,
} from "@/lib/utils/formatters";

interface Fournisseur { id: string; nom: string; telephone?: string | null; email?: string | null }
interface BonValide { id: string; reference: string; montantTotal: string | number }

interface Immo {
  id: string;
  reference: string;
  designation: string;
  description: string | null;
  categorie: string;
  etat: string;
  statut: string;
  valeurAcquisition: string | number;
  dateAcquisition: string;
  numSerie: string | null;
  localisation: string | null;
  motifSortie: string | null;
  sortiAt: string | null;
  demandeAt: string | null;
  createdAt: string;
  createdBy: { nom: string; prenom: string };
  sortiPar: { nom: string; prenom: string } | null;
  fournisseur: Fournisseur | null;
  bonCommande: { id: string; reference: string; montantTotal: string | number; statut: string } | null;
  etablissement: { id: string; nom: string };
}

interface Props {
  immo: Immo;
  fournisseurs: Fournisseur[];
  bonsValides: BonValide[];
  userPrismaRole: string;
}

const ETATS = [
  { value: "NEUF", label: "Neuf" },
  { value: "BON", label: "Bon état" },
  { value: "USAGE", label: "Usagé" },
  { value: "HORS_SERVICE", label: "Hors service" },
];

const CATEGORIES = Object.entries(CATEGORIE_IMMO_LABELS);
const CAN_EDIT   = ["SUPER_ADMIN", "MINISTERE", "ADMIN", "COMPTABLE"];
const CAN_DEMANDE = ["ADMIN", "COMPTABLE"];
const CAN_VALIDER = ["DIRECTEUR", "SUPER_ADMIN", "MINISTERE"];

export default function ImmobilisationDetailView({ immo, fournisseurs, bonsValides, userPrismaRole }: Props) {
  const { navigate } = useNavigation();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Workflow sortie
  const [showDemandeForm, setShowDemandeForm] = useState(false);
  const [showValiderForm, setShowValiderForm] = useState(false);
  const [motifSortie, setMotifSortie] = useState("");
  const [typeSortie, setTypeSortie] = useState("SORTI");

  // Edit form
  const [editForm, setEditForm] = useState({
    designation:       immo.designation,
    description:       immo.description ?? "",
    categorie:         immo.categorie,
    etat:              immo.etat,
    valeurAcquisition: immo.valeurAcquisition.toString(),
    dateAcquisition:   immo.dateAcquisition.split("T")[0],
    numSerie:          immo.numSerie ?? "",
    localisation:      immo.localisation ?? "",
    fournisseurId:     immo.fournisseur?.id ?? "",
    bonCommandeId:     immo.bonCommande?.id ?? "",
  });

  const callAPI = async (action: string, extra?: Record<string, string>) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/immobilisations/${immo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      return data;
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/immobilisations/${immo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      toast.success("Immobilisation mise à jour");
      setEditing(false);
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleDemanderSortie = async () => {
    try {
      await callAPI("demander_sortie", { motifSortie });
      toast.success("Demande de sortie soumise");
      setShowDemandeForm(false);
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleValiderSortie = async () => {
    try {
      await callAPI("valider_sortie", { typeSortie });
      toast.success("Sortie validée");
      setShowValiderForm(false);
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleRejeterSortie = async () => {
    try {
      await callAPI("rejeter_sortie");
      toast.success("Demande de sortie rejetée");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    }
  };

  const isActif = immo.statut === "ACTIF";
  const isEnAttente = immo.statut === "EN_ATTENTE_SORTIE";
  const isSorti = immo.statut === "SORTI" || immo.statut === "CEDE";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        type="button"
        onClick={() => navigate("/immobilisations")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#11355b] cursor-pointer transition-colors"
      >
        <ArrowLeft size={16} /> Retour aux immobilisations
      </button>

      {/* Fiche principale */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-xs text-gray-400">{immo.reference}</span>
              <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase ${STATUT_IMMO_COLORS[immo.statut] ?? "bg-gray-100 text-gray-600"}`}>
                {formatStatutImmo(immo.statut)}
              </span>
              <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase ${ETAT_IMMO_COLORS[immo.etat] ?? "bg-gray-100 text-gray-600"}`}>
                {formatEtatImmo(immo.etat)}
              </span>
            </div>

            {editing ? (
              <input
                type="text"
                value={editForm.designation}
                onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                className="text-xl font-bold text-[#11355b] bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 w-full focus:outline-none"
                aria-label="Désignation"
              />
            ) : (
              <h2 className="text-xl font-bold text-[#11355b] flex items-center gap-2">
                <Package size={20} /> {immo.designation}
              </h2>
            )}

            <p className="text-sm text-gray-400 mt-1">
              Enregistré le {formatDate(immo.createdAt)} par {immo.createdBy.prenom} {immo.createdBy.nom}
            </p>
          </div>

          {/* Boutons d'action header */}
          <div className="flex gap-2">
            {CAN_EDIT.includes(userPrismaRole) && isActif && !editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Pencil size={14} /> Modifier
              </button>
            )}
            {editing && (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 cursor-pointer"
                >
                  <X size={14} /> Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-[#11355b] text-white rounded-lg text-sm font-semibold hover:bg-[#1a4a7a] cursor-pointer disabled:opacity-60"
                >
                  <Check size={14} /> {loading ? "Sauvegarde…" : "Sauvegarder"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Champs */}
        {editing ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <Label>Catégorie</Label>
              <select value={editForm.categorie} onChange={(e) => setEditForm({ ...editForm, categorie: e.target.value })} className={inputCls} aria-label="Catégorie">
                {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <Label>État</Label>
              <select value={editForm.etat} onChange={(e) => setEditForm({ ...editForm, etat: e.target.value })} className={inputCls} aria-label="État">
                {ETATS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <div>
              <Label>Valeur d'acquisition (FCFA)</Label>
              <input type="number" min="0" value={editForm.valeurAcquisition} onChange={(e) => setEditForm({ ...editForm, valeurAcquisition: e.target.value })} className={inputCls} aria-label="Valeur d'acquisition" />
            </div>
            <div>
              <Label>Date d'acquisition</Label>
              <input type="date" value={editForm.dateAcquisition} onChange={(e) => setEditForm({ ...editForm, dateAcquisition: e.target.value })} className={inputCls} aria-label="Date d'acquisition" />
            </div>
            <div>
              <Label>N° de série</Label>
              <input type="text" value={editForm.numSerie} onChange={(e) => setEditForm({ ...editForm, numSerie: e.target.value })} className={inputCls} aria-label="Numéro de série" />
            </div>
            <div>
              <Label>Localisation</Label>
              <input type="text" value={editForm.localisation} onChange={(e) => setEditForm({ ...editForm, localisation: e.target.value })} className={inputCls} aria-label="Localisation" />
            </div>
            <div>
              <Label>Fournisseur</Label>
              <select value={editForm.fournisseurId} onChange={(e) => setEditForm({ ...editForm, fournisseurId: e.target.value })} className={inputCls} aria-label="Fournisseur">
                <option value="">Aucun</option>
                {fournisseurs.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
              </select>
            </div>
            <div>
              <Label>Bon de commande</Label>
              <select value={editForm.bonCommandeId} onChange={(e) => setEditForm({ ...editForm, bonCommandeId: e.target.value })} className={inputCls} aria-label="Bon de commande">
                <option value="">Aucun</option>
                {bonsValides.map((b) => <option key={b.id} value={b.id}>{b.reference}</option>)}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <Label>Description</Label>
              <textarea rows={2} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className={`${inputCls} resize-none`} aria-label="Description" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            <InfoField label="Catégorie" value={formatCategorieImmo(immo.categorie)} />
            <InfoField label="Valeur d'acquisition" value={formatMontant(immo.valeurAcquisition)} />
            <InfoField label="Date d'acquisition" value={formatDate(immo.dateAcquisition)} />
            <InfoField label="Localisation" value={immo.localisation} />
            <InfoField label="N° de série" value={immo.numSerie} />
            <InfoField label="Établissement" value={immo.etablissement.nom} />
            {isSorti && immo.sortiPar && (
              <InfoField label="Sorti par" value={`${immo.sortiPar.prenom} ${immo.sortiPar.nom}`} />
            )}
            {isSorti && immo.sortiAt && (
              <InfoField label="Date de sortie" value={formatDate(immo.sortiAt)} />
            )}
          </div>
        )}

        {immo.description && !editing && (
          <div className="mt-5 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">{immo.description}</div>
        )}

        {immo.motifSortie && (
          <div className="mt-5 p-4 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-800">
            <strong>Motif de sortie :</strong> {immo.motifSortie}
            {immo.demandeAt && (
              <span className="ml-2 text-amber-600 text-xs">— demandé le {formatDate(immo.demandeAt)}</span>
            )}
          </div>
        )}
      </div>

      {/* Workflow sortie — actions */}
      {isActif && CAN_DEMANDE.includes(userPrismaRole) && !showDemandeForm && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowDemandeForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50 transition-colors cursor-pointer"
          >
            <AlertTriangle size={14} /> Demander la sortie
          </button>
        </div>
      )}

      {showDemandeForm && (
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-6">
          <h3 className="font-bold text-amber-700 mb-3 flex items-center gap-2">
            <AlertTriangle size={18} /> Demande de sortie d'inventaire
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            La demande sera soumise au directeur pour validation avant que l'actif soit retiré du registre.
          </p>
          <div className="mb-4">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Motif de sortie
            </label>
            <textarea
              rows={3}
              value={motifSortie}
              onChange={(e) => setMotifSortie(e.target.value)}
              placeholder="Expliquez la raison de la sortie…"
              className={`${inputCls} resize-none`}
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowDemandeForm(false)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 text-sm hover:bg-gray-50 cursor-pointer">
              Annuler
            </button>
            <button type="button" onClick={handleDemanderSortie} disabled={loading}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-60">
              {loading ? "En cours…" : "Soumettre la demande"}
            </button>
          </div>
        </div>
      )}

      {/* En attente de sortie — actions directeur */}
      {isEnAttente && CAN_VALIDER.includes(userPrismaRole) && (
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-6">
          <h3 className="font-bold text-amber-700 mb-3 flex items-center gap-2">
            <AlertTriangle size={18} /> Demande de sortie en attente de validation
          </h3>
          {immo.motifSortie && (
            <p className="text-sm text-gray-700 mb-4 p-3 bg-amber-50 rounded-lg">
              <strong>Motif :</strong> {immo.motifSortie}
            </p>
          )}
          {!showValiderForm ? (
            <div className="flex gap-3">
              <button type="button" onClick={handleRejeterSortie} disabled={loading}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 text-sm hover:bg-gray-50 cursor-pointer disabled:opacity-60">
                {loading ? "…" : "Rejeter"}
              </button>
              <button type="button" onClick={() => setShowValiderForm(true)}
                className="px-5 py-2 bg-[#11355b] hover:bg-[#1a4a7a] text-white rounded-lg text-sm font-semibold cursor-pointer">
                Valider la sortie
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Type de sortie
                </label>
                <select
                  value={typeSortie}
                  onChange={(e) => setTypeSortie(e.target.value)}
                  className={inputCls}
                  aria-label="Type de sortie"
                >
                  <option value="SORTI">Sorti (mis au rebut / perdu)</option>
                  <option value="CEDE">Cédé (vendu / donné)</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowValiderForm(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 text-sm hover:bg-gray-50 cursor-pointer">
                  Annuler
                </button>
                <button type="button" onClick={handleValiderSortie} disabled={loading}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-60">
                  {loading ? "Validation…" : "Confirmer la sortie"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fournisseur lié */}
      {immo.fournisseur && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-[#11355b] mb-4">Fournisseur</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <InfoField label="Nom" value={immo.fournisseur.nom} />
            <InfoField label="Téléphone" value={immo.fournisseur.telephone} />
            <InfoField label="Email" value={immo.fournisseur.email} />
          </div>
          <button
            type="button"
            onClick={() => navigate(`/fournisseurs/${immo.fournisseur!.id}`)}
            className="mt-3 text-xs text-[#11355b] hover:underline cursor-pointer"
          >
            Voir la fiche fournisseur →
          </button>
        </div>
      )}

      {/* Bon de commande lié */}
      {immo.bonCommande && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-[#11355b] mb-4 flex items-center gap-2">
            <ClipboardList size={18} /> Bon de commande d'origine
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <InfoField label="Référence" value={immo.bonCommande.reference} />
            <InfoField label="Montant" value={formatMontant(immo.bonCommande.montantTotal)} />
            <InfoField label="Statut" value={immo.bonCommande.statut} />
          </div>
          <button
            type="button"
            onClick={() => navigate(`/depensesEtablissement/bons/${encodeURIComponent(immo.bonCommande!.reference)}`)}
            className="mt-3 text-xs text-[#11355b] hover:underline cursor-pointer"
          >
            Voir le bon de commande →
          </button>
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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}

const inputCls =
  "w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b]/40 transition-all";

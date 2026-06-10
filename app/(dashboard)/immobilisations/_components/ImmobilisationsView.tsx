"use client";

import { useState } from "react";
import { Package, Plus, Search, X, ChevronRight } from "lucide-react";
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

interface Fournisseur { id: string; nom: string }
interface BonValide { id: string; reference: string; montantTotal: string | number }

interface Immo {
  id: string;
  reference: string;
  designation: string;
  categorie: string;
  etat: string;
  statut: string;
  valeurAcquisition: string | number;
  dateAcquisition: string;
  localisation: string | null;
  numSerie: string | null;
  fournisseur: Fournisseur | null;
  bonCommande: { id: string; reference: string } | null;
}

interface Props {
  immobilisations: Immo[];
  fournisseurs: Fournisseur[];
  bonsValides: BonValide[];
  userPrismaRole: string;
  etablissementId: string;
}

const CAN_CREATE = ["SUPER_ADMIN", "MINISTERE", "ADMIN", "COMPTABLE"];

const CATEGORIES = Object.entries(CATEGORIE_IMMO_LABELS);
const ETATS = [
  { value: "NEUF", label: "Neuf" },
  { value: "BON", label: "Bon état" },
  { value: "USAGE", label: "Usagé" },
  { value: "HORS_SERVICE", label: "Hors service" },
];

export default function ImmobilisationsView({
  immobilisations,
  fournisseurs,
  bonsValides,
  userPrismaRole,
  etablissementId,
}: Props) {
  const { navigate } = useNavigation();
  const [search, setSearch] = useState("");
  const [filterCategorie, setFilterCategorie] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    designation: "",
    description: "",
    categorie: "",
    etat: "NEUF",
    valeurAcquisition: "",
    dateAcquisition: "",
    numSerie: "",
    localisation: "",
    fournisseurId: "",
    bonCommandeId: "",
  });

  const filtered = immobilisations.filter((i) => {
    const matchSearch = !search ||
      i.designation.toLowerCase().includes(search.toLowerCase()) ||
      i.reference.toLowerCase().includes(search.toLowerCase()) ||
      (i.localisation ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCategorie || i.categorie === filterCategorie;
    const matchStatut = !filterStatut || i.statut === filterStatut;
    return matchSearch && matchCat && matchStatut;
  });

  const total = immobilisations.length;
  const actifs = immobilisations.filter((i) => i.statut === "ACTIF").length;
  const enAttente = immobilisations.filter((i) => i.statut === "EN_ATTENTE_SORTIE").length;
  const valeurTotale = immobilisations
    .filter((i) => i.statut === "ACTIF" || i.statut === "EN_ATTENTE_SORTIE")
    .reduce((s, i) => s + parseFloat(i.valeurAcquisition.toString()), 0);

  const resetForm = () =>
    setForm({
      designation: "", description: "", categorie: "", etat: "NEUF",
      valeurAcquisition: "", dateAcquisition: "", numSerie: "",
      localisation: "", fournisseurId: "", bonCommandeId: "",
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.designation || !form.categorie || !form.valeurAcquisition || !form.dateAcquisition) {
      toast.error("Remplissez tous les champs obligatoires");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/immobilisations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, etablissementId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      toast.success("Immobilisation enregistrée");
      setShowForm(false);
      resetForm();
      navigate(`/immobilisations/${data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#11355b] flex items-center gap-2">
            <Package size={24} /> Immobilisations
          </h1>
          <p className="text-sm text-gray-500 mt-1">Registre des actifs de l'établissement</p>
        </div>
        {CAN_CREATE.includes(userPrismaRole) && !showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#11355b] hover:bg-[#1a4a7a] text-white rounded-lg text-sm font-semibold cursor-pointer transition-colors"
          >
            <Plus size={16} /> Nouvel actif
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Total actifs" value={String(total)} />
        <KpiCard label="Actifs en service" value={String(actifs)} accent="emerald" />
        <KpiCard label="En attente sortie" value={String(enAttente)} accent="amber" />
        <KpiCard label="Valeur totale" value={formatMontant(valeurTotale)} small />
      </div>

      {/* Formulaire de création */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[#11355b]">Nouvel actif immobilisé</h2>
            <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
              className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Désignation *</Label>
                <input
                  type="text"
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  placeholder="ex: Ordinateur portable Dell Latitude 5540"
                  className={inputCls}
                  aria-label="Désignation de l'actif"
                />
              </div>
              <div>
                <Label>Catégorie *</Label>
                <select
                  value={form.categorie}
                  onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                  className={inputCls}
                  aria-label="Catégorie"
                >
                  <option value="">Choisir…</option>
                  {CATEGORIES.map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>État *</Label>
                <select
                  value={form.etat}
                  onChange={(e) => setForm({ ...form, etat: e.target.value })}
                  className={inputCls}
                  aria-label="État de l'actif"
                >
                  {ETATS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Valeur d'acquisition (FCFA) *</Label>
                <input
                  type="number"
                  min="0"
                  value={form.valeurAcquisition}
                  onChange={(e) => setForm({ ...form, valeurAcquisition: e.target.value })}
                  className={inputCls}
                  aria-label="Valeur d'acquisition en FCFA"
                />
              </div>
              <div>
                <Label>Date d'acquisition *</Label>
                <input
                  type="date"
                  value={form.dateAcquisition}
                  onChange={(e) => setForm({ ...form, dateAcquisition: e.target.value })}
                  className={inputCls}
                  aria-label="Date d'acquisition"
                />
              </div>
              <div>
                <Label>N° de série / IMEI</Label>
                <input
                  type="text"
                  value={form.numSerie}
                  onChange={(e) => setForm({ ...form, numSerie: e.target.value })}
                  placeholder="ex: SN-123456"
                  className={inputCls}
                  aria-label="Numéro de série"
                />
              </div>
              <div>
                <Label>Localisation</Label>
                <input
                  type="text"
                  value={form.localisation}
                  onChange={(e) => setForm({ ...form, localisation: e.target.value })}
                  placeholder="ex: Salle informatique 3"
                  className={inputCls}
                  aria-label="Localisation de l'actif"
                />
              </div>
              <div>
                <Label>Fournisseur (optionnel)</Label>
                <select
                  value={form.fournisseurId}
                  onChange={(e) => setForm({ ...form, fournisseurId: e.target.value })}
                  className={inputCls}
                  aria-label="Fournisseur"
                >
                  <option value="">Aucun</option>
                  {fournisseurs.map((f) => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Bon de commande lié (optionnel)</Label>
                <select
                  value={form.bonCommandeId}
                  onChange={(e) => setForm({ ...form, bonCommandeId: e.target.value })}
                  className={inputCls}
                  aria-label="Bon de commande"
                >
                  <option value="">Aucun</option>
                  {bonsValides.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.reference} — {formatMontant(b.montantTotal)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label>Description</Label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Informations complémentaires…"
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 text-sm hover:bg-gray-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-[#11355b] hover:bg-[#1a4a7a] text-white rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-60"
              >
                {saving ? "Enregistrement…" : "Enregistrer l'actif"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtres & recherche */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par désignation, référence…"
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#11355b]/20"
            aria-label="Rechercher une immobilisation"
          />
        </div>
        <select
          value={filterCategorie}
          onChange={(e) => setFilterCategorie(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none cursor-pointer"
          aria-label="Filtrer par catégorie"
        >
          <option value="">Toutes catégories</option>
          {CATEGORIES.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none cursor-pointer"
          aria-label="Filtrer par statut"
        >
          <option value="">Tous statuts</option>
          <option value="ACTIF">Actif</option>
          <option value="EN_ATTENTE_SORTIE">En attente de sortie</option>
          <option value="SORTI">Sorti</option>
          <option value="CEDE">Cédé</option>
        </select>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            {immobilisations.length === 0
              ? "Aucun actif enregistré. Cliquez sur « Nouvel actif » pour commencer."
              : "Aucun résultat pour ces filtres."}
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50">
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Désignation</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">État</th>
                <th className="px-4 py-3">Valeur</th>
                <th className="px-4 py-3">Acquisition</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr
                  key={i.id}
                  onClick={() => navigate(`/immobilisations/${i.id}`)}
                  className="border-t border-gray-50 hover:bg-blue-50/40 cursor-pointer"
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{i.reference}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {i.designation}
                    {i.localisation && (
                      <span className="block text-xs text-gray-400">{i.localisation}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatCategorieImmo(i.categorie)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase ${ETAT_IMMO_COLORS[i.etat] ?? "bg-gray-100 text-gray-600"}`}>
                      {formatEtatImmo(i.etat)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-[#11355b]">
                    {formatMontant(i.valeurAcquisition)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(i.dateAcquisition)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase ${STATUT_IMMO_COLORS[i.statut] ?? "bg-gray-100 text-gray-600"}`}>
                      {formatStatutImmo(i.statut)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    <ChevronRight size={16} />
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

function KpiCard({
  label, value, accent, small,
}: {
  label: string; value: string; accent?: "emerald" | "amber"; small?: boolean;
}) {
  const color =
    accent === "emerald" ? "text-emerald-600" :
    accent === "amber"   ? "text-amber-600"   :
    "text-[#11355b]";
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`font-bold ${small ? "text-base" : "text-2xl"} ${color}`}>{value}</p>
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

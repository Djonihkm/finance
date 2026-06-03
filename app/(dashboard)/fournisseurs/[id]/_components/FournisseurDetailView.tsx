"use client";

import { useState } from "react";
import { ArrowLeft, Pencil, X, Check, Building2, FileText } from "lucide-react";
import { useNavigation } from "@/lib/navigation-context";
import { toast } from "sonner";
import { formatTypeMarche, formatDate, formatStatutMarche, STATUT_MARCHE_COLORS } from "@/lib/utils/formatters";

const CATEGORIES = [
  { value: "FOURNITURES", label: "Fournitures" },
  { value: "SERVICES",    label: "Services" },
  { value: "TRAVAUX",     label: "Travaux" },
  { value: "AUTRE",       label: "Autre" },
];

interface Marche {
  id: string;
  reference: string;
  objet: string;
  statut: string;
  montantEstime: string | number;
}

interface Contrat {
  id: string;
  reference: string;
  objet: string;
  statut: string;
  montantTotal: string | number;
}

interface Fournisseur {
  id: string;
  nom: string;
  categorie: string;
  telephone: string | null;
  email: string | null;
  adresse: string | null;
  rccm: string | null;
  nif: string | null;
  createdAt: string;
  createdBy: { nom: string; prenom: string };
  marches: Marche[];
  contrats: Contrat[];
}

interface Props {
  fournisseur: Fournisseur;
  userPrismaRole: string;
}

const inputClass =
  "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-all";
const labelClass =
  "block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5";

export default function FournisseurDetailView({ fournisseur, userPrismaRole }: Props) {
  const { navigate } = useNavigation();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nom: fournisseur.nom,
    categorie: fournisseur.categorie,
    telephone: fournisseur.telephone ?? "",
    email: fournisseur.email ?? "",
    adresse: fournisseur.adresse ?? "",
    rccm: fournisseur.rccm ?? "",
    nif: fournisseur.nif ?? "",
  });

  const canEdit = ["SUPER_ADMIN", "MINISTERE", "ADMIN", "COMPTABLE"].includes(userPrismaRole);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/fournisseurs/${fournisseur.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      toast.success("Fournisseur mis à jour");
      setEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate("/fournisseurs")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#11355b] cursor-pointer transition-colors"
      >
        <ArrowLeft size={16} /> Retour aux fournisseurs
      </button>

      {/* Fiche fournisseur */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#11355b]/10 flex items-center justify-center">
              <Building2 size={24} className="text-[#11355b]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#11355b]">
                {editing ? form.nom : fournisseur.nom}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                Créé le {formatDate(fournisseur.createdAt)} par {fournisseur.createdBy.prenom} {fournisseur.createdBy.nom}
              </p>
            </div>
          </div>
          {canEdit && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Pencil size={15} /> Modifier
            </button>
          )}
          {editing && (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 cursor-pointer"
              >
                <X size={15} /> Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[#11355b] text-white text-sm font-semibold hover:bg-[#1a4a7a] cursor-pointer disabled:opacity-60"
              >
                <Check size={15} /> {loading ? "…" : "Sauvegarder"}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {editing ? (
            <>
              <div className="sm:col-span-2">
                <label className={labelClass}>Nom *</label>
                <input name="nom" value={form.nom} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Catégorie *</label>
                <select name="categorie" value={form.categorie} onChange={handleChange} className={inputClass}>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Téléphone</label>
                <input name="telephone" value={form.telephone} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>RCCM</label>
                <input name="rccm" value={form.rccm} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>NIF</label>
                <input name="nif" value={form.nif} onChange={handleChange} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Adresse</label>
                <input name="adresse" value={form.adresse} onChange={handleChange} className={inputClass} />
              </div>
            </>
          ) : (
            <>
              <InfoField label="Catégorie" value={formatTypeMarche(fournisseur.categorie)} />
              <InfoField label="Téléphone" value={fournisseur.telephone} />
              <InfoField label="Email" value={fournisseur.email} />
              <InfoField label="RCCM" value={fournisseur.rccm} mono />
              <InfoField label="NIF" value={fournisseur.nif} mono />
              <InfoField label="Adresse" value={fournisseur.adresse} />
            </>
          )}
        </div>
      </div>

      {/* Marchés liés */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-[#11355b] flex items-center gap-2">
            <FileText size={18} /> Marchés ({fournisseur.marches.length})
          </h3>
          <button
            onClick={() => navigate("/marches")}
            className="text-xs text-[#11355b] hover:underline cursor-pointer"
          >
            Voir tous les marchés →
          </button>
        </div>
        {fournisseur.marches.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-400 text-center">Aucun marché lié à ce fournisseur.</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50">
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Objet</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {fournisseur.marches.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => navigate(`/marches/${m.id}`)}
                  className="border-t border-gray-50 hover:bg-blue-50/40 cursor-pointer"
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{m.reference}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{m.objet}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase ${STATUT_MARCHE_COLORS[m.statut] ?? "bg-gray-100 text-gray-600"}`}>
                      {formatStatutMarche(m.statut)}
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

function InfoField({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm ${mono ? "font-mono text-gray-500" : "text-gray-800"}`}>{value ?? "—"}</p>
    </div>
  );
}

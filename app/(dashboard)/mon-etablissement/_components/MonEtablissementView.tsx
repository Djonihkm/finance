"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Building2, CheckCircle2, MapPin, Mail, Phone,
  Briefcase, Pencil, X, Save,
} from "lucide-react";
import { toast } from "sonner";
import { type EtablissementDetail } from "@/lib/queries";
import { formatTypeEtablissement, formatDate } from "@/lib/utils/formatters";
import CopyButton from "./CopyButton";

const TYPES = [
  { value: "LYCEE",          label: "Lycée" },
  { value: "COLLEGE",        label: "Collège" },
  { value: "CEG",            label: "CEG" },
  { value: "ECOLE_PRIMAIRE", label: "École Primaire" },
  { value: "AUTRE",          label: "Autre" },
];

interface Draft {
  nom: string; type: string; region: string;
  ville: string; adresse: string; telephone: string; email: string;
}

interface Props {
  etab: EtablissementDetail;
  canEdit: boolean;
}

const inputClass =
  "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-colors bg-white";
const readClass =
  "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#11355b] font-medium cursor-default";

export default function MonEtablissementView({ etab, canEdit }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    nom:       etab.nom,
    type:      etab.type,
    region:    etab.region    ?? "",
    ville:     etab.ville     ?? "",
    adresse:   etab.adresse   ?? "",
    telephone: etab.telephone ?? "",
    email:     etab.email     ?? "",
  });

  const set = (field: keyof Draft) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setDraft((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    if (!draft.nom.trim()) { toast.error("Le nom est requis."); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/etablissements/${etab.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom:       draft.nom,
          type:      draft.type,
          region:    draft.region    || null,
          ville:     draft.ville     || null,
          adresse:   draft.adresse   || null,
          telephone: draft.telephone || null,
          email:     draft.email     || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Erreur");
      }
      toast.success("Informations mises à jour.");
      setEditing(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft({
      nom:       etab.nom,
      type:      etab.type,
      region:    etab.region    ?? "",
      ville:     etab.ville     ?? "",
      adresse:   etab.adresse   ?? "",
      telephone: etab.telephone ?? "",
      email:     etab.email     ?? "",
    });
    setEditing(false);
  };

  const directeur = etab.users.find((u) => u.role === "DIRECTEUR") ?? etab.users[0] ?? null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Titre + boutons */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#11355b]">Mon établissement</h1>
          <p className="text-gray-500 text-sm mt-1">
            {canEdit
              ? "Consultez et modifiez les informations de votre institution"
              : "Consultez les informations de votre institution"}
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2 shrink-0">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X size={15} />
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#11355b] hover:bg-[#1a4a7a] text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-70 shadow-sm"
                >
                  <Save size={15} />
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#11355b] hover:bg-[#1a4a7a] text-white text-sm font-semibold transition-colors cursor-pointer shadow-sm"
              >
                <Pencil size={15} />
                Modifier
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Carte gauche */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 text-center h-full relative overflow-hidden">
            <div className="relative w-full max-w-[260px] aspect-square mx-auto mb-6 rounded-xl overflow-hidden shadow-sm bg-gray-100">
              <Image src="/fav.png" alt={etab.nom} fill priority className="object-contain" />
              <div className="absolute bottom-2 right-2 w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle2 size={18} className="text-white" strokeWidth={3} />
              </div>
            </div>

            <h2 className="text-xl font-bold text-[#11355b] leading-tight px-2">
              {editing ? draft.nom : etab.nom}
            </h2>

            <div className="flex justify-center gap-2 mt-4 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold uppercase tracking-wide">
                {formatTypeEtablissement(editing ? draft.type : etab.type)}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-wide flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {etab.isActive ? "ACTIF" : "INACTIF"}
              </span>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
              {(etab.region || etab.ville) && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Briefcase size={14} />
                  <span>
                    {etab.region && <span className="font-semibold text-gray-700">{etab.region}</span>}
                    {etab.region && etab.ville && ", "}
                    {etab.ville}
                  </span>
                </div>
              )}
              {etab.adresse && (
                <div className="flex items-start justify-center gap-2 text-sm text-gray-500">
                  <MapPin size={14} className="shrink-0 mt-0.5" />
                  <span className="text-center">{etab.adresse}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Détails droite */}
        <div className="md:col-span-2 space-y-6">

          {/* Informations générales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="mb-6 pb-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#11355b] uppercase tracking-wider flex items-center gap-2">
                <Building2 size={14} />
                Informations générales
              </h3>
              {editing && (
                <span className="text-[11px] text-blue-500 font-medium">Mode édition</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {editing ? (
                <>
                  <EditField label="Nom de l'institution" id="e-nom">
                    <input id="e-nom" type="text" value={draft.nom} onChange={set("nom")} className={inputClass} />
                  </EditField>
                  <EditField label="Type d'institution" id="e-type">
                    <select id="e-type" value={draft.type} onChange={set("type")} className={inputClass}>
                      {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </EditField>
                  <EditField label="Région / Département" id="e-region">
                    <input id="e-region" type="text" value={draft.region} onChange={set("region")} className={inputClass} placeholder="Ex: Atlantique" />
                  </EditField>
                  <EditField label="Ville / Commune" id="e-ville">
                    <input id="e-ville" type="text" value={draft.ville} onChange={set("ville")} className={inputClass} placeholder="Ex: Cotonou" />
                  </EditField>
                  <div className="md:col-span-2">
                    <EditField label="Adresse complète" id="e-adresse">
                      <input id="e-adresse" type="text" value={draft.adresse} onChange={set("adresse")} className={inputClass} placeholder="Ex: Quartier Agla, rue 15" />
                    </EditField>
                  </div>
                  <EditField label="Téléphone" id="e-tel">
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input id="e-tel" type="tel" value={draft.telephone} onChange={set("telephone")} className={`${inputClass} pl-9`} placeholder="+229 00 00 00 00" />
                    </div>
                  </EditField>
                  <EditField label="Email" id="e-email">
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input id="e-email" type="email" value={draft.email} onChange={set("email")} className={`${inputClass} pl-9`} placeholder="contact@etablissement.bj" />
                    </div>
                  </EditField>
                </>
              ) : (
                <>
                  <ReadField label="Nom de l'institution" value={etab.nom} />
                  <ReadField label="Type d'institution" value={formatTypeEtablissement(etab.type)} />
                  <ReadField label="Région / Département" value={etab.region ?? "—"} />
                  <ReadField label="Ville / Commune" value={etab.ville ?? "—"} />
                  <div className="md:col-span-2">
                    <ReadField label="Adresse complète" value={etab.adresse ?? "—"} />
                  </div>
                  <ReadField label="Téléphone" value={etab.telephone ?? "—"} />
                  <ReadField label="Email" value={etab.email ?? "—"} />
                </>
              )}

              {/* Code — toujours en lecture seule */}
              <div>
                <label htmlFor="etab-code" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Identifiant (Code)
                </label>
                <div className="relative">
                  <input id="etab-code" type="text" value={etab.code} readOnly
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono cursor-not-allowed"
                  />
                  <CopyButton value={etab.code} />
                </div>
              </div>
              <ReadField label="Date de création" value={formatDate(etab.createdAt)} />
            </div>
          </div>

          {/* Représentant */}
          {directeur && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="mb-6 pb-4 border-b border-gray-50">
                <h3 className="text-xs font-bold text-[#11355b] uppercase tracking-wider flex items-center gap-2">
                  <Building2 size={14} />
                  Responsable principal
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <ReadField label="Nom du responsable" value={`${directeur.nom} ${directeur.prenom}`} />
                <ReadField label="Fonction / Rôle" value={directeur.poste ?? directeur.role} />
                {directeur.email && (
                  <div>
                    <label htmlFor="resp-email" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Email officiel
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input id="resp-email" type="email" value={directeur.email} readOnly
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-default"
                      />
                    </div>
                  </div>
                )}
                {directeur.telephone && (
                  <div>
                    <label htmlFor="resp-tel" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Téléphone
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input id="resp-tel" type="tel" value={directeur.telephone} readOnly
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-default"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReadField({ label, value }: { label: string; value: string }) {
  const id = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</label>
      <input id={id} type="text" value={value} readOnly className={readClass} />
    </div>
  );
}

function EditField({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</label>
      {children}
    </div>
  );
}

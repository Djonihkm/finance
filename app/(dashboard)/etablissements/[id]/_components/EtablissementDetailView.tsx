"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Building2, MapPin, Phone, Mail,
  CheckCircle, XCircle, Pencil, Printer, FileText,
  Calendar, Wallet, Save, X, Users,
} from "lucide-react";
import { toast } from "sonner";
import type { EtablissementDetail } from "@/lib/queries";
import { formatTypeEtablissement, formatDate, formatMontant } from "@/lib/utils/formatters";

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-colors";

const TYPES = [
  { value: "LYCEE", label: "Lycée" },
  { value: "COLLEGE", label: "Collège" },
  { value: "CEG", label: "CEG" },
  { value: "ECOLE_PRIMAIRE", label: "École Primaire" },
  { value: "AUTRE", label: "Autre" },
];

interface Draft {
  nom: string;
  type: string;
  region: string;
  ville: string;
  adresse: string;
  telephone: string;
  email: string;
}

export default function EtablissementDetailView({ data }: { data: EtablissementDetail }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    nom: data.nom,
    type: data.type,
    region: data.region ?? "",
    ville: data.ville ?? "",
    adresse: data.adresse ?? "",
    telephone: data.telephone ?? "",
    email: data.email ?? "",
  });

  const setField =
    (field: keyof Draft) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setDraft((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    if (!draft.nom.trim()) { toast.error("Le nom est requis."); return; }
    setIsSaving(true);
    try {
      const res = await fetch(`/api/etablissements/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Erreur");
      }
      toast.success("Modifications enregistrées.");
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la sauvegarde.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatut = async () => {
    const next = !data.isActive;
    if (!confirm(`${next ? "Activer" : "Désactiver"} l'établissement ?`)) return;
    try {
      const res = await fetch(`/api/etablissements/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      });
      if (!res.ok) throw new Error("Erreur");
      toast.success(`Établissement ${next ? "activé" : "désactivé"}.`);
      router.refresh();
    } catch {
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  const budget = data.budgets[0];
  const totalBudget = budget ? parseFloat(budget.montantTotal.toString()) : null;

  return (
    <div className="max-w-7xl mx-auto">

      {/* Retour */}
      <div className="mb-5">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-[#11355b] transition-colors font-medium text-sm cursor-pointer"
        >
          <ArrowLeft size={16} />
          Retour
        </button>
      </div>

      {/* Hero */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5 flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="w-16 h-16 bg-[#11355b] rounded-xl flex items-center justify-center shrink-0">
          <Building2 size={28} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-[#11355b]">{data.nom}</h1>
            <span className="px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700">
              {formatTypeEtablissement(data.type)}
            </span>
            <span className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded ${
              data.isActive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${data.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
              {data.isActive ? "ACTIF" : "INACTIF"}
            </span>
          </div>
          <p className="text-sm text-gray-400">Code: {data.code} · Créé le {formatDate(data.createdAt)}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {isEditing ? (
            <>
              <button type="button" onClick={handleSave} disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg text-sm font-medium text-white transition-colors cursor-pointer shadow-sm"
              >
                <Save size={15} />
                {isSaving ? "Enregistrement…" : "Enregistrer"}
              </button>
              <button type="button" onClick={() => { setIsEditing(false); setDraft({ nom: data.nom, type: data.type, region: data.region ?? "", ville: data.ville ?? "", adresse: data.adresse ?? "", telephone: data.telephone ?? "", email: data.email ?? "" }); }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <X size={15} />
                Annuler
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Pencil size={15} />
                Modifier
              </button>
              <button type="button" onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-[#11355b] hover:bg-[#1a4a7a] rounded-lg text-sm font-medium text-white transition-colors cursor-pointer shadow-sm"
              >
                <Printer size={15} />
                Imprimer
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-5">

        {/* ===== COLONNE PRINCIPALE ===== */}
        <div className="space-y-5">

          {/* Informations générales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-[#11355b] uppercase tracking-wider mb-5 flex items-center gap-2">
              <Building2 size={16} />
              Informations générales
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {isEditing ? (
                <>
                  <EditField label="Nom officiel">
                    <input value={draft.nom} onChange={setField("nom")} className={inputClass} />
                  </EditField>
                  <EditField label="Type">
                    <select value={draft.type} onChange={setField("type")} className={inputClass}>
                      {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </EditField>
                </>
              ) : (
                <>
                  <InfoField label="Nom officiel" value={data.nom} />
                  <InfoField label="Type" value={formatTypeEtablissement(data.type)} />
                  <InfoField label="Code" value={data.code} />
                  <InfoField label="Date de création" value={formatDate(data.createdAt)} icon={<Calendar size={14} className="text-gray-400" />} />
                  <InfoField label="Statut" value={data.isActive ? "Actif" : "Inactif"} highlight={data.isActive ? "green" : "red"} />
                  <InfoField label="Utilisateurs" value={`${data.users.length}`} />
                </>
              )}
            </div>
          </div>

          {/* Localisation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-[#11355b] uppercase tracking-wider mb-5 flex items-center gap-2">
              <MapPin size={16} className="text-emerald-600" />
              Localisation
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {isEditing ? (
                <>
                  <EditField label="Région / Département">
                    <input value={draft.region} onChange={setField("region")} className={inputClass} />
                  </EditField>
                  <EditField label="Ville / Commune">
                    <input value={draft.ville} onChange={setField("ville")} className={inputClass} />
                  </EditField>
                  <div className="sm:col-span-2">
                    <EditField label="Adresse complète">
                      <input value={draft.adresse} onChange={setField("adresse")} className={inputClass} />
                    </EditField>
                  </div>
                </>
              ) : (
                <>
                  <InfoField label="Région / Département" value={data.region ?? "—"} />
                  <InfoField label="Ville / Commune" value={data.ville ?? "—"} />
                  <div className="sm:col-span-2">
                    <InfoField label="Adresse complète" value={data.adresse ?? "—"} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Contacts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-[#11355b] uppercase tracking-wider mb-5 flex items-center gap-2">
              <Phone size={16} className="text-blue-500" />
              Contacts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {isEditing ? (
                <>
                  <EditField label="Téléphone">
                    <input value={draft.telephone} onChange={setField("telephone")} className={inputClass} />
                  </EditField>
                  <EditField label="Email">
                    <input value={draft.email} onChange={setField("email")} className={inputClass} />
                  </EditField>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Phone size={18} className="text-[#11355b] shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Téléphone</p>
                      <p className="text-sm font-semibold text-gray-800">{data.telephone ?? "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Mail size={18} className="text-[#11355b] shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email</p>
                      <p className="text-sm font-semibold text-gray-800">{data.email ?? "—"}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Statistiques */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-bold text-[#11355b] uppercase tracking-wider mb-5 flex items-center gap-2">
              <Users size={16} className="text-orange-500" />
              Statistiques
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                icon={<Users size={20} className="text-[#11355b]" />}
                label="Utilisateurs"
                value={String(data.users.length)}
                color="blue"
              />
              <StatCard
                icon={<FileText size={20} className="text-emerald-600" />}
                label="Dépenses"
                value={String(data.depenses.length)}
                color="green"
              />
              <StatCard
                icon={<Wallet size={20} className="text-orange-500" />}
                label="Budget annuel"
                value={totalBudget !== null ? formatMontant(totalBudget) : "—"}
                color="orange"
              />
            </div>
          </div>
        </div>

        {/* ===== COLONNE LATÉRALE ===== */}
        <div className="space-y-4 lg:sticky lg:top-6 self-start">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 pb-3 border-b border-gray-100">
              Actions
            </h3>
            <button
              type="button"
              onClick={handleToggleStatut}
              className={`w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 mb-3 transition-colors cursor-pointer shadow-sm text-white ${
                data.isActive ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"
              }`}
            >
              {data.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
              {data.isActive ? "Désactiver l'établissement" : "Activer l'établissement"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Pencil size={16} />
              Modifier les informations
            </button>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#11355b] cursor-pointer transition-colors w-full"
              >
                <Printer size={15} />
                Imprimer la fiche
              </button>
            </div>
          </div>

          {/* Récap rapide */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 pb-3 border-b border-gray-100">
              Récapitulatif
            </h3>
            <div className="space-y-3 text-sm">
              <RecapRow label="Type" value={formatTypeEtablissement(data.type)} />
              <RecapRow label="Région" value={data.region ?? "—"} />
              <RecapRow label="Ville" value={data.ville ?? "—"} />
              <RecapRow label="Code" value={data.code} />
              <RecapRow label="Créé le" value={formatDate(data.createdAt)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}

function InfoField({ label, value, icon, highlight }: {
  label: string; value: string; icon?: React.ReactNode; highlight?: "green" | "red";
}) {
  return (
    <div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center gap-1.5">
        {icon}
        <p className={`text-sm font-semibold ${
          highlight === "green" ? "text-emerald-600" :
          highlight === "red" ? "text-red-500" : "text-gray-800"
        }`}>{value}</p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: "blue" | "green" | "orange";
}) {
  const bg = { blue: "bg-blue-50", green: "bg-emerald-50", orange: "bg-orange-50" }[color];
  return (
    <div className={`${bg} rounded-xl p-4 flex flex-col gap-3`}>
      {icon}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-[#11355b]">{value}</p>
      </div>
    </div>
  );
}

function RecapRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-gray-700 text-right max-w-[160px] truncate">{value}</span>
    </div>
  );
}

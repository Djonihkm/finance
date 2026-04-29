"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Ban, CheckCircle, AlertTriangle,
  Mail, Phone, Briefcase, Building2, Calendar, Pencil, X, Save,
} from "lucide-react";
import { toast } from "sonner";
import type { UserDetail } from "@/lib/queries";
import { formatRole, formatDate, ROLE_LABELS } from "@/lib/utils/formatters";

const ETAB_ROLE_LABELS = Object.fromEntries(
  Object.entries(ROLE_LABELS).filter(([k]) => ["ADMIN", "DIRECTEUR", "COMPTABLE"].includes(k))
);

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-[#11355b] text-white",
  MINISTERE:   "bg-[#1a4a7a] text-white",
  ADMIN:       "bg-blue-100 text-blue-700",
  COMPTABLE:   "bg-gray-100 text-gray-600",
  DIRECTEUR:   "bg-emerald-100 text-emerald-700",
};

const ROLES_NEED_ETABLISSEMENT = new Set(["ADMIN", "DIRECTEUR", "COMPTABLE"]);

interface Props {
  data: UserDetail;
  etablissements: { id: string; nom: string }[];
  isEtabAdmin?: boolean;
}

interface EditForm {
  nom: string;
  prenom: string;
  telephone: string;
  poste: string;
  role: string;
  etablissementId: string;
}

export default function UtilisateurDetailView({ data, etablissements, isEtabAdmin = false }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EditForm>({
    nom: data.nom,
    prenom: data.prenom,
    telephone: data.telephone ?? "",
    poste: data.poste ?? "",
    role: data.role,
    etablissementId: data.etablissement?.id ?? "",
  });

  const handleField = (field: keyof EditForm, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "role" && !ROLES_NEED_ETABLISSEMENT.has(value)) {
        next.etablissementId = "";
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/utilisateurs/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: form.nom,
          prenom: form.prenom,
          telephone: form.telephone || null,
          poste: form.poste || null,
          role: form.role,
          etablissementId: form.etablissementId || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Modifications enregistrées.");
      setEditing(false);
      router.refresh();
    } catch {
      toast.error("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      nom: data.nom,
      prenom: data.prenom,
      telephone: data.telephone ?? "",
      poste: data.poste ?? "",
      role: data.role,
      etablissementId: data.etablissement?.id ?? "",
    });
    setEditing(false);
  };

  const handleToggleStatut = async () => {
    const next = !data.isActive;
    try {
      const res = await fetch(`/api/utilisateurs/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      });
      if (!res.ok) throw new Error("Erreur");
      toast.success(`${data.prenom} ${data.nom} ${next ? "réactivé(e)" : "suspendu(e)"}.`);
      router.refresh();
    } catch {
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  const initiales = `${data.prenom[0] ?? ""}${data.nom[0] ?? ""}`.toUpperCase();
  const displayRole = editing ? form.role : data.role;

  return (
    <div className="max-w-7xl mx-auto">

      {/* Retour */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-[#11355b] transition-colors font-medium text-sm cursor-pointer"
        >
          <ArrowLeft size={16} />
          Retour
        </button>
      </div>

      {/* Hero */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5 flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-[#1a365d] to-[#3a6fa8] flex items-center justify-center text-white text-3xl font-bold shrink-0 select-none">
          {initiales}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-[#11355b] mb-1">{data.prenom} {data.nom}</h1>
          <p className="text-sm text-gray-400 mb-3">{data.poste ?? "—"}</p>
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              data.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
            }`}>
              {data.isActive ? "ACTIF" : "INACTIF"}
            </span>
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${ROLE_COLORS[data.role] ?? "bg-gray-100 text-gray-600"}`}>
              {formatRole(data.role)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
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
          <button
            type="button"
            onClick={handleToggleStatut}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer shadow-sm text-white ${
              data.isActive ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600"
            }`}
          >
            {data.isActive ? <Ban size={16} /> : <CheckCircle size={16} />}
            {data.isActive ? "Suspendre" : "Réactiver"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-5">

        {/* Colonne principale */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-bold text-[#11355b] mb-5 pb-3 border-b border-gray-100">
              Profil professionnel
            </h2>

            {editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <EditField
                  label="Prénom"
                  value={form.prenom}
                  onChange={(v) => handleField("prenom", v)}
                />
                <EditField
                  label="Nom"
                  value={form.nom}
                  onChange={(v) => handleField("nom", v)}
                />
                <EditField
                  label="Email"
                  value={data.email}
                  disabled
                  hint="L'email ne peut pas être modifié"
                />
                <EditField
                  label="Téléphone"
                  value={form.telephone}
                  onChange={(v) => handleField("telephone", v)}
                />
                <EditField
                  label="Poste"
                  value={form.poste}
                  onChange={(v) => handleField("poste", v)}
                />
                <div>
                  <label htmlFor="edit-role" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Rôle
                  </label>
                  <select
                    id="edit-role"
                    value={form.role}
                    onChange={(e) => handleField("role", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-colors"
                  >
                    {Object.entries(isEtabAdmin ? ETAB_ROLE_LABELS : ROLE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                {ROLES_NEED_ETABLISSEMENT.has(form.role) && !isEtabAdmin && (
                  <div className="sm:col-span-2">
                    <label htmlFor="edit-etablissement" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Établissement
                    </label>
                    <select
                      id="edit-etablissement"
                      value={form.etablissementId}
                      onChange={(e) => handleField("etablissementId", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-colors"
                    >
                      <option value="">— Aucun —</option>
                      {etablissements.map((e) => (
                        <option key={e.id} value={e.id}>{e.nom}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ProfileField
                  icon={<Mail size={16} className="text-[#11355b]" />}
                  label="Email"
                  value={data.email}
                />
                <ProfileField
                  icon={<Phone size={16} className="text-[#11355b]" />}
                  label="Téléphone"
                  value={data.telephone ?? "—"}
                />
                <ProfileField
                  icon={<Briefcase size={16} className="text-[#11355b]" />}
                  label="Poste"
                  value={data.poste ?? "—"}
                />
                <ProfileField
                  icon={<Calendar size={16} className="text-[#11355b]" />}
                  label="Date de création"
                  value={formatDate(data.createdAt)}
                />
                {data.etablissement && (
                  <ProfileField
                    icon={<Building2 size={16} className="text-[#11355b]" />}
                    label="Établissement"
                    value={`${data.etablissement.nom} (${data.etablissement.code})`}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-4 lg:sticky lg:top-6 self-start">

          <div className="bg-[#11355b] rounded-xl p-5 text-white">
            <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-3">Rôle</p>
            <p className="text-2xl font-bold mb-1">{formatRole(displayRole)}</p>
            <p className="text-sm text-white/70">Niveau d&apos;accès système</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-red-500 shrink-0" />
              <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider">Zone Critique</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Les modifications de statut sont enregistrées dans le journal d&apos;audit.
            </p>
            <button
              type="button"
              onClick={handleToggleStatut}
              className={`w-full text-sm font-bold py-2.5 rounded-lg transition-colors cursor-pointer ${
                data.isActive
                  ? "text-red-500 hover:text-red-600 border border-red-200 hover:bg-red-50"
                  : "text-emerald-600 hover:text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
              }`}
            >
              {data.isActive ? "Suspendre le compte" : "Réactiver le compte"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function EditField({
  label, value, onChange, disabled = false, hint,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  hint?: string;
}) {
  const fieldId = `edit-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div>
      <label htmlFor={fieldId} className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        id={fieldId}
        type="text"
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        disabled={disabled}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-colors disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
      />
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

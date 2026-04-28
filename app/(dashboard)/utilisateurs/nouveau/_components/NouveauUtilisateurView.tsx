"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Mail, Lock, Phone, Briefcase, Building2, ChevronRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { ROLE_LABELS } from "@/lib/utils/formatters";

const ROLES = Object.entries(ROLE_LABELS);

interface Etablissement {
  id: string;
  nom: string;
}

interface Props {
  etablissements: Etablissement[];
}

interface FormData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  telephone: string;
  poste: string;
  etablissementId: string;
}

const inputClass =
  "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-colors bg-white";
const selectClass =
  "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-colors bg-white cursor-pointer";
const labelClass = "block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5";

export default function NouveauUtilisateurView({ etablissements }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdName, setCreatedName] = useState("");

  const [form, setForm] = useState<FormData>({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "COMPTABLE",
    telephone: "",
    poste: "",
    etablissementId: "",
  });

  const set =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.nom.trim()) { toast.error("Le nom est requis."); return; }
    if (!form.prenom.trim()) { toast.error("Le prénom est requis."); return; }
    if (!form.email.trim()) { toast.error("L'email est requis."); return; }
    if (!form.password) { toast.error("Le mot de passe est requis."); return; }
    if (form.password.length < 8) { toast.error("Le mot de passe doit contenir au moins 8 caractères."); return; }
    if (form.password !== form.confirmPassword) { toast.error("Les mots de passe ne correspondent pas."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/utilisateurs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          password: form.password,
          role: form.role,
          telephone: form.telephone || undefined,
          poste: form.poste || undefined,
          etablissementId: form.etablissementId || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Erreur");
      }
      setCreatedName(`${form.prenom} ${form.nom}`);
      setShowSuccess(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  };

  const roleNeedsEtab = ["ADMIN", "DIRECTEUR", "COMPTABLE"].includes(form.role);

  return (
    <>
      <div className="max-w-7xl mx-auto">

        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-[#11355b] text-sm font-medium mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Retour
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#11355b]">Nouvel utilisateur</h1>
          <p className="text-gray-500 text-sm mt-2">Créez un nouveau compte utilisateur dans le système</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">

          {/* Formulaire */}
          <div className="space-y-5">

            {/* Identité */}
            <Section icon={<User size={18} className="text-white" />} iconBg="bg-[#11355b]" title="Identité">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Prénom">
                  <input type="text" value={form.prenom} onChange={set("prenom")} placeholder="Jean" className={inputClass} />
                </Field>
                <Field label="Nom">
                  <input type="text" value={form.nom} onChange={set("nom")} placeholder="DUPONT" className={inputClass} />
                </Field>
                <Field label="Téléphone">
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="tel" value={form.telephone} onChange={set("telephone")} placeholder="+229 00 00 00 00" className={`${inputClass} pl-9`} />
                  </div>
                </Field>
                <Field label="Poste / Profession">
                  <div className="relative">
                    <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={form.poste} onChange={set("poste")} placeholder="Ex: Comptable principal" className={`${inputClass} pl-9`} />
                  </div>
                </Field>
              </div>
            </Section>

            {/* Accès & Rôle */}
            <Section icon={<Mail size={18} className="text-white" />} iconBg="bg-blue-500" title="Accès & Rôle">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Email" span={2}>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" value={form.email} onChange={set("email")} placeholder="utilisateur@exemple.bj" className={`${inputClass} pl-9`} />
                  </div>
                </Field>
                <Field label="Rôle">
                  <select value={form.role} onChange={set("role")} className={selectClass}>
                    {ROLES.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </Field>
                {roleNeedsEtab && (
                  <Field label="Établissement">
                    <div className="relative">
                      <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select value={form.etablissementId} onChange={set("etablissementId")} className={`${selectClass} pl-9`}>
                        <option value="">— Sélectionner —</option>
                        {etablissements.map((e) => (
                          <option key={e.id} value={e.id}>{e.nom}</option>
                        ))}
                      </select>
                    </div>
                  </Field>
                )}
              </div>
            </Section>

            {/* Mot de passe */}
            <Section icon={<Lock size={18} className="text-white" />} iconBg="bg-orange-400" title="Mot de passe">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Mot de passe">
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="password" value={form.password} onChange={set("password")} placeholder="Min. 8 caractères" className={`${inputClass} pl-9`} />
                  </div>
                </Field>
                <Field label="Confirmer le mot de passe">
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="password" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="••••••••" className={`${inputClass} pl-9`} />
                  </div>
                </Field>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Le mot de passe doit contenir au moins 8 caractères. L&apos;utilisateur pourra le modifier depuis son profil.
              </p>
            </Section>
          </div>

          {/* Récapitulatif */}
          <div className="space-y-4 lg:sticky lg:top-6 self-start">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5 pb-3 border-b border-gray-100">
                Récapitulatif
              </h3>
              <div className="space-y-3 mb-6">
                <RecapRow label="Prénom" value={form.prenom} />
                <RecapRow label="Nom" value={form.nom} />
                <RecapRow label="Email" value={form.email} />
                <RecapRow label="Rôle" value={ROLE_LABELS[form.role] ?? form.role} />
                {roleNeedsEtab && (
                  <RecapRow
                    label="Établissement"
                    value={etablissements.find((e) => e.id === form.etablissementId)?.nom ?? "—"}
                  />
                )}
              </div>

              <div className="bg-blue-50 border-l-4 border-[#11355b] rounded-r-lg p-4 mb-5">
                <p className="text-xs text-blue-900 leading-relaxed">
                  Vérifiez toutes les informations avant de créer le compte.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                {loading ? "Création…" : "Créer l'utilisateur"}
                {!loading && <ChevronRight size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modale succès */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={44} className="text-emerald-500" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-[#11355b] mb-3">Utilisateur créé avec succès</h3>
            <p className="text-sm text-gray-500 mb-6">
              Le compte de <span className="font-semibold text-[#11355b]">{createdName}</span> a été créé et est prêt à l&apos;emploi.
            </p>
            <button
              type="button"
              onClick={() => { router.push("/utilisateurs"); router.refresh(); }}
              className="w-full bg-[#11355b] hover:bg-[#1a4a7a] text-white py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer"
            >
              Voir la liste des utilisateurs
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ icon, iconBg, title, children }: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-7">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <h2 className="text-lg font-bold text-[#11355b]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children, span }: {
  label: string;
  children: React.ReactNode;
  span?: number;
}) {
  return (
    <div className={`space-y-1.5 ${span === 2 ? "md:col-span-2" : ""}`}>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function RecapRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="font-medium text-right max-w-40 truncate text-gray-800">{value || "—"}</span>
    </div>
  );
}

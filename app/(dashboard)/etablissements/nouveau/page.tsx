/**
 * app/(dashboard)/etablissements/nouveau/page.tsx — Client Component
 * ───────────────────────────────────────────────────────────────────
 * Formulaire de création d'un établissement.
 * Soumet via POST /api/etablissements puis redirige vers la liste.
 *
 * Flux : ici → POST /api/etablissements → router.push('/etablissements')
 */

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Info, MapPin, Phone, FileText, Upload, CheckCircle2, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

const REGIONS = [
  "Alibori", "Atacora", "Atlantique", "Borgou", "Collines",
  "Couffo", "Donga", "Littoral", "Mono", "Ouémé", "Plateau", "Zou",
];

const TYPES = [
  { value: "LYCEE", label: "Lycée" },
  { value: "COLLEGE", label: "Collège" },
  { value: "CEG", label: "CEG" },
  { value: "ECOLE_PRIMAIRE", label: "École Primaire" },
  { value: "AUTRE", label: "Autre" },
];

interface FormData {
  nom: string;
  code: string;
  type: string;
  region: string;
  ville: string;
  adresse: string;
  telephone: string;
  email: string;
}

const inputClass =
  "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-colors";
const selectClass =
  "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-colors bg-white cursor-pointer";
const labelClass = "text-[11px] font-bold text-gray-400 uppercase tracking-wider";

export default function NouvelEtablissementPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<FormData>({
    nom: "",
    code: "",
    type: "LYCEE",
    region: "Littoral",
    ville: "",
    adresse: "",
    telephone: "",
    email: "",
  });

  const set =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.nom.trim()) { toast.error("Le nom est requis."); return; }
    if (!form.code.trim()) { toast.error("Le code est requis."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/etablissements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Erreur");
      }
      toast.success(`${form.nom} créé avec succès !`);
      router.push("/etablissements");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFile(file.name);
  };

  return (
    <div className="max-w-7xl mx-auto">

      {/* Retour */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-[#11355b] transition-colors font-medium text-sm cursor-pointer"
        >
          <ArrowLeft size={16} />
          Retour
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">

        {/* ===== FORMULAIRE ===== */}
        <div className="space-y-5">

          {/* 1 — Informations générales */}
          <Section icon={<Info size={18} className="text-white" />} iconBg="bg-[#11355b]" title="Informations générales">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Nom de l'établissement" span={2}>
                <input type="text" value={form.nom} onChange={set("nom")} placeholder="Nom officiel" className={inputClass} />
              </Field>
              <Field label="Code unique (ex: LYC-COT-001)">
                <input type="text" value={form.code} onChange={set("code")} placeholder="LYC-XXX-001" className={inputClass} />
              </Field>
              <Field label="Type d'établissement">
                <select value={form.type} onChange={set("type")} className={selectClass}>
                  {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          {/* 2 — Localisation */}
          <Section icon={<MapPin size={18} className="text-white" />} iconBg="bg-emerald-600" title="Localisation">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Région">
                <select value={form.region} onChange={set("region")} className={selectClass}>
                  {REGIONS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Ville / Commune">
                <input type="text" value={form.ville} onChange={set("ville")} placeholder="Ex: Cotonou" className={inputClass} />
              </Field>
              <Field label="Adresse complète" span={2}>
                <input type="text" value={form.adresse} onChange={set("adresse")} placeholder="Quartier, rue, numéro…" className={inputClass} />
              </Field>
            </div>
          </Section>

          {/* 3 — Contacts */}
          <Section icon={<Phone size={18} className="text-white" />} iconBg="bg-blue-500" title="Contacts">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Téléphone">
                <input type="tel" value={form.telephone} onChange={set("telephone")} placeholder="+229 00 00 00 00" className={inputClass} />
              </Field>
              <Field label="Email">
                <input type="email" value={form.email} onChange={set("email")} placeholder="contact@etablissement.bj" className={inputClass} />
              </Field>
            </div>
          </Section>

          {/* 4 — Documents */}
          <Section icon={<FileText size={18} className="text-white" />} iconBg="bg-orange-400" title="Documents">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
                isDragging ? "border-[#11355b] bg-blue-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
              }`}
            >
              <Upload size={28} className="text-gray-300" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">
                  {uploadedFile ?? "Glissez vos documents d'accréditation ici"}
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG ou PNG (Max 5Mo)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) setUploadedFile(f.name); }}
              />
            </div>
          </Section>
        </div>

        {/* ===== RÉCAPITULATIF ===== */}
        <div className="space-y-4 lg:sticky lg:top-6 self-start">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5 pb-3 border-b border-gray-100">
              Récapitulatif
            </h3>

            <div className="space-y-3 mb-6">
              <RecapRow label="Établissement" value={form.nom} />
              <RecapRow label="Code" value={form.code} />
              <RecapRow label="Type" value={TYPES.find((t) => t.value === form.type)?.label ?? form.type} />
              <RecapRow label="Région" value={form.region} />
              <RecapRow label="Ville" value={form.ville} />
            </div>

            <div className="bg-blue-50 border-l-4 border-[#11355b] rounded-r-lg p-4 mb-5">
              <p className="text-xs text-blue-900 leading-relaxed">
                Vérifiez toutes les informations avant de valider.
                Le code est unique et ne peut pas être modifié après création.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              {loading ? "Création…" : "Créer l'établissement"}
              {!loading && <ChevronRight size={16} />}
            </button>
          </div>

          <div className="px-1">
            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              {uploadedFile ? (
                <><CheckCircle2 size={12} className="text-emerald-500" /> Document joint</>
              ) : "Aucun document joint"}
            </p>
          </div>
        </div>
      </div>
    </div>
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

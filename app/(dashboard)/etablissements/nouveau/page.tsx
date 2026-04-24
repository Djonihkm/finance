"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Info, MapPin, Phone, Users,
  FileText, Upload, CheckCircle2, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/lib/store';

const DEPARTEMENTS = ['Alibori', 'Atacora', 'Atlantique', 'Borgou', 'Collines', 'Couffo', 'Donga', 'Littoral', 'Mono', 'Ouémé', 'Plateau', 'Zou'];
const NIVEAUX = ['Maternelle', 'Primaire', 'Secondaire Général', 'Secondaire Technique', 'Supérieur', 'Formation Professionnelle'];

interface FormData {
  nom: string;
  type: string;
  niveau: string;
  dateCreation: string;
  directeur: string;
  statut: string;
  departement: string;
  commune: string;
  adresse: string;
  telephone: string;
  email: string;
  effectif: string;
  enseignants: string;
  budgetAnnuel: string;
}

const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-colors";
const selectClass = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-colors bg-white cursor-pointer";
const labelClass = "text-[11px] font-bold text-gray-400 uppercase tracking-wider";

const NouvelEtablissementPage = () => {
  const router = useRouter();
  const addEtablissement = useStore((s) => s.addEtablissement);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!form.nom.trim()) { toast.error('Le nom de l\'établissement est requis.'); return; }
    if (!form.commune.trim()) { toast.error('La commune est requise.'); return; }
    const newId = `BJ-${Math.floor(10000 + Math.random() * 90000)}`;
    addEtablissement({
      id: newId,
      nom: form.nom,
      type: form.type === 'Public' ? 'PUBLIC' : 'PRIVÉ',
      departement: form.departement,
      commune: form.commune,
      niveau: form.niveau,
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      statut: form.statut as 'ACTIF' | 'INACTIF',
      directeur: form.directeur,
      telephone: form.telephone,
      email: form.email,
      effectif: Number(form.effectif) || 0,
      enseignants: Number(form.enseignants) || 0,
      budgetAnnuel: form.budgetAnnuel,
      adresse: form.adresse,
    });
    toast.success(`${form.nom} créé avec succès !`);
    router.push('/etablissements');
  };

  const [form, setForm] = useState<FormData>({
    nom: '',
    type: 'Public',
    niveau: 'Secondaire Général',
    dateCreation: '',
    directeur: '',
    statut: 'ACTIF',
    departement: 'Littoral',
    commune: '',
    adresse: '',
    telephone: '',
    email: '',
    effectif: '',
    enseignants: '',
    budgetAnnuel: '',
  });

  const set = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

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
                  <input type="text" value={form.nom} onChange={set('nom')} placeholder="Entrez le nom officiel" className={inputClass} />
                </Field>
                <Field label="Type d'établissement">
                  <select value={form.type} onChange={set('type')} className={selectClass}>
                    <option>Public</option>
                    <option>Privé</option>
                  </select>
                </Field>
                <Field label="Niveau d'enseignement">
                  <select value={form.niveau} onChange={set('niveau')} className={selectClass}>
                    {NIVEAUX.map((n) => <option key={n}>{n}</option>)}
                  </select>
                </Field>
                <Field label="Date de création">
                  <input type="date" value={form.dateCreation} onChange={set('dateCreation')} className={inputClass} />
                </Field>
                <Field label="Statut">
                  <select value={form.statut} onChange={set('statut')} className={selectClass}>
                    <option value="ACTIF">Actif</option>
                    <option value="INACTIF">Inactif</option>
                  </select>
                </Field>
                <Field label="Directeur / Responsable" span={2}>
                  <input type="text" value={form.directeur} onChange={set('directeur')} placeholder="Nom complet du responsable" className={inputClass} />
                </Field>
              </div>
            </Section>

            {/* 2 — Localisation */}
            <Section icon={<MapPin size={18} className="text-white" />} iconBg="bg-emerald-600" title="Localisation">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Département">
                  <select value={form.departement} onChange={set('departement')} className={selectClass}>
                    {DEPARTEMENTS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Commune">
                  <input type="text" value={form.commune} onChange={set('commune')} placeholder="Ex: Cotonou" className={inputClass} />
                </Field>
                <Field label="Adresse complète" span={2}>
                  <input type="text" value={form.adresse} onChange={set('adresse')} placeholder="Quartier, rue, numéro…" className={inputClass} />
                </Field>
              </div>
            </Section>

            {/* 3 — Contacts */}
            <Section icon={<Phone size={18} className="text-white" />} iconBg="bg-blue-500" title="Contacts">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Téléphone">
                  <input type="tel" value={form.telephone} onChange={set('telephone')} placeholder="+229 00 00 00 00" className={inputClass} />
                </Field>
                <Field label="Email">
                  <input type="email" value={form.email} onChange={set('email')} placeholder="contact@etablissement.bj" className={inputClass} />
                </Field>
              </div>
            </Section>

            {/* 4 — Statistiques */}
            <Section icon={<Users size={18} className="text-white" />} iconBg="bg-orange-500" title="Statistiques">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Field label="Effectif élèves">
                  <input type="number" min={0} value={form.effectif} onChange={set('effectif')} placeholder="Ex: 1200" className={inputClass} />
                </Field>
                <Field label="Nombre d'enseignants">
                  <input type="number" min={0} value={form.enseignants} onChange={set('enseignants')} placeholder="Ex: 65" className={inputClass} />
                </Field>
                <Field label="Budget annuel (FCFA)">
                  <input type="text" value={form.budgetAnnuel} onChange={set('budgetAnnuel')} placeholder="Ex: 45,000,000" className={inputClass} />
                </Field>
              </div>
            </Section>

            {/* 5 — Statut & Documents */}
            <Section icon={<FileText size={18} className="text-white" />} iconBg="bg-orange-400" title="Statut & Documents">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
                  isDragging ? 'border-[#11355b] bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                <Upload size={28} className="text-gray-300" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">
                    {uploadedFile ?? "Glissez vos documents d'accréditation ici"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF, JPG ou PNG (Max 5Mo par fichier)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setUploadedFile(f.name); }}
                />
              </div>

              <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">Statut Administratif : Dossier Djour</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Vérifié</span>
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
                <RecapRow label="Type" value={form.type} />
                <RecapRow label="Niveau" value={form.niveau} />
                <RecapRow label="Directeur" value={form.directeur} />
                <RecapRow label="Localisation" value={form.commune ? `${form.commune}, ${form.departement}` : form.departement} />
                <RecapRow label="Statut" value={form.statut} highlight={form.statut === 'ACTIF' ? 'green' : 'red'} />
              </div>

              <div className="mb-6 pt-3 border-t border-gray-100">
                <p className={labelClass + " mb-1"}>Budget Annuel</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {form.budgetAnnuel ? `${form.budgetAnnuel} FCFA` : '0 FCFA'}
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-[#11355b] rounded-r-lg p-4 mb-5">
                <p className="text-xs text-blue-900 leading-relaxed">
                  Veuillez vérifier toutes les informations saisies avant de valider. Toute erreur pourrait
                  retarder le processus de déblocage des fonds.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                Créer l&apos;établissement
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="px-1">
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Synchronisation en temps réel active
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-3 items-start">
              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-linear-to-br from-gray-300 to-gray-400" />
              <div>
                <p className="text-sm font-bold text-[#11355b]">Standard National</p>
                <p className="text-xs text-gray-500 leading-relaxed mt-1">
                  L&apos;infrastructure doit répondre aux normes décrétées en 2023 pour les établissements d&apos;excellence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    
  );
};

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
    <div className={`space-y-1.5 ${span === 2 ? 'md:col-span-2' : ''}`}>
      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function RecapRow({ label, value, highlight }: {
  label: string;
  value: string;
  highlight?: 'green' | 'red';
}) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className={`font-medium text-right max-w-40 truncate ${
        highlight === 'green' ? 'text-emerald-600' :
        highlight === 'red' ? 'text-red-500' :
        'text-gray-800'
      }`}>
        {value || '—'}
      </span>
    </div>
  );
}

export default NouvelEtablissementPage;

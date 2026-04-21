"use client";

import { use, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import {
  ArrowLeft, Building2, MapPin, Users, GraduationCap,
  Phone, Mail, CheckCircle, XCircle, Pencil, Printer,
  FileText, Calendar, Wallet, Save, X,
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '../../components/DashboardLayout';
import { useStore } from '@/lib/store';

const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-colors";

export default function EtablissementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { etablissements, updateEtablissement } = useStore();
  const etab = etablissements.find((e) => e.id === decodeURIComponent(id));

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(etab ?? null);

  if (!etab || !draft) notFound();

  const isActif = etab.statut === 'ACTIF';
  const isPublic = etab.type === 'PUBLIC';

  const setField = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setDraft((prev) => prev ? { ...prev, [field]: e.target.value } : prev);

  const handleSave = () => {
    if (!draft.nom.trim()) { toast.error('Le nom est requis.'); return; }
    updateEtablissement(etab.id, draft);
    toast.success('Modifications enregistrées.');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(etab);
    setIsEditing(false);
  };

  const handleToggleStatut = () => {
    const next = etab.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF';
    updateEtablissement(etab.id, { statut: next });
    toast.success(`Établissement ${next === 'ACTIF' ? 'activé' : 'désactivé'}.`);
  };

  const handlePrint = () => window.print();

  return (
    <DashboardLayout>
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

        {/* Hero header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-16 h-16 bg-[#11355b] rounded-xl flex items-center justify-center shrink-0">
            <Building2 size={28} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-[#11355b]">{etab.nom}</h1>
              <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${
                isPublic ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {etab.type}
              </span>
              <span className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded ${
                isActif ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isActif ? 'bg-emerald-500' : 'bg-red-500'}`} />
                {etab.statut}
              </span>
            </div>
            <p className="text-sm text-gray-400">ID: #{etab.id} · {etab.niveau}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium text-white transition-colors cursor-pointer shadow-sm"
                >
                  <Save size={15} />
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <X size={15} />
                  Annuler
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Pencil size={15} />
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
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
                    <EditField label="Nom officiel"><input value={draft.nom} onChange={setField('nom')} className={inputClass} /></EditField>
                    <EditField label="Type">
                      <select value={draft.type} onChange={setField('type')} className={inputClass}>
                        <option value="PUBLIC">Public</option>
                        <option value="PRIVÉ">Privé</option>
                      </select>
                    </EditField>
                    <EditField label="Niveau d'enseignement"><input value={draft.niveau} onChange={setField('niveau')} className={inputClass} /></EditField>
                    <EditField label="Date de création"><input value={draft.date} onChange={setField('date')} className={inputClass} /></EditField>
                    <EditField label="Directeur / Responsable"><input value={draft.directeur} onChange={setField('directeur')} className={inputClass} /></EditField>
                    <EditField label="Statut">
                      <select value={draft.statut} onChange={setField('statut')} className={inputClass}>
                        <option value="ACTIF">Actif</option>
                        <option value="INACTIF">Inactif</option>
                      </select>
                    </EditField>
                  </>
                ) : (
                  <>
                    <InfoField label="Nom officiel" value={etab.nom} />
                    <InfoField label="Type" value={etab.type} />
                    <InfoField label="Niveau d'enseignement" value={etab.niveau} />
                    <InfoField label="Date de création" value={etab.date} icon={<Calendar size={14} className="text-gray-400" />} />
                    <InfoField label="Directeur / Responsable" value={etab.directeur} />
                    <InfoField label="Statut" value={etab.statut} highlight={isActif ? 'green' : 'red'} />
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
                    <EditField label="Département"><input value={draft.departement} onChange={setField('departement')} className={inputClass} /></EditField>
                    <EditField label="Commune"><input value={draft.commune} onChange={setField('commune')} className={inputClass} /></EditField>
                    <div className="sm:col-span-2">
                      <EditField label="Adresse complète"><input value={draft.adresse} onChange={setField('adresse')} className={inputClass} /></EditField>
                    </div>
                  </>
                ) : (
                  <>
                    <InfoField label="Département" value={etab.departement} />
                    <InfoField label="Commune" value={etab.commune} />
                    <div className="sm:col-span-2">
                      <InfoField label="Adresse complète" value={etab.adresse} />
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
                    <EditField label="Téléphone"><input value={draft.telephone} onChange={setField('telephone')} className={inputClass} /></EditField>
                    <EditField label="Email"><input value={draft.email} onChange={setField('email')} className={inputClass} /></EditField>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Phone size={18} className="text-[#11355b] shrink-0" />
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Téléphone</p>
                        <p className="text-sm font-semibold text-gray-800">{etab.telephone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Mail size={18} className="text-[#11355b] shrink-0" />
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email</p>
                        <p className="text-sm font-semibold text-gray-800">{etab.email}</p>
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
              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <EditField label="Effectif élèves"><input type="number" value={draft.effectif} onChange={setField('effectif')} className={inputClass} /></EditField>
                  <EditField label="Enseignants"><input type="number" value={draft.enseignants} onChange={setField('enseignants')} className={inputClass} /></EditField>
                  <EditField label="Budget annuel (FCFA)"><input value={draft.budgetAnnuel} onChange={setField('budgetAnnuel')} className={inputClass} /></EditField>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard icon={<Users size={20} className="text-[#11355b]" />} label="Effectif élèves" value={etab.effectif.toLocaleString('fr-FR')} color="blue" />
                  <StatCard icon={<GraduationCap size={20} className="text-emerald-600" />} label="Enseignants" value={etab.enseignants.toString()} color="green" />
                  <StatCard icon={<Wallet size={20} className="text-orange-500" />} label="Budget annuel" value={`${etab.budgetAnnuel} FCFA`} color="orange" />
                </div>
              )}
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
                  isActif ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                {isActif ? <XCircle size={16} /> : <CheckCircle size={16} />}
                {isActif ? "Désactiver l'établissement" : "Activer l'établissement"}
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Pencil size={16} />
                Modifier les informations
              </button>

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#11355b] cursor-pointer transition-colors w-full"
                >
                  <Printer size={15} />
                  Imprimer la fiche
                </button>
                <button
                  type="button"
                  onClick={() => toast.info('Export PDF non disponible sans backend.')}
                  className="flex items-center gap-3 text-sm text-orange-500 hover:text-orange-600 cursor-pointer transition-colors w-full font-medium"
                >
                  <FileText size={15} />
                  Télécharger en PDF
                </button>
              </div>
            </div>

            {/* Récap rapide */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 pb-3 border-b border-gray-100">
                Récapitulatif
              </h3>
              <div className="space-y-3 text-sm">
                <RecapRow label="Type" value={etab.type} />
                <RecapRow label="Département" value={etab.departement} />
                <RecapRow label="Commune" value={etab.commune} />
                <RecapRow label="Niveau" value={etab.niveau} />
                <RecapRow label="Créé le" value={etab.date} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
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
  label: string; value: string; icon?: React.ReactNode; highlight?: 'green' | 'red';
}) {
  return (
    <div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center gap-1.5">
        {icon}
        <p className={`text-sm font-semibold ${
          highlight === 'green' ? 'text-emerald-600' :
          highlight === 'red' ? 'text-red-500' : 'text-gray-800'
        }`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: string; color: 'blue' | 'green' | 'orange';
}) {
  const bg = { blue: 'bg-blue-50', green: 'bg-emerald-50', orange: 'bg-orange-50' }[color];
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

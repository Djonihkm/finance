"use client";

import { use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { ArrowLeft, Ban, ChevronRight, FileText, LogIn, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/lib/store';

const roleBadge: Record<string, string> = {
  'SUPER ADMIN': 'bg-[#11355b] text-white',
  'DF':          'bg-[#1a4a7a] text-white',
  'COMPTABLE':   'bg-gray-100 text-gray-600',
  'AUDITEUR':    'bg-gray-100 text-gray-600',
  'LECTEUR':     'bg-gray-100 text-gray-600',
};

export default function UtilisateurDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { utilisateurs, updateStatutUtilisateur } = useStore();
  const user = utilisateurs.find((u) => u.id === Number(id));

  if (!user) notFound();

  const isActif    = user.statut === 'ACTIF';
  const isSuspendu = user.statut === 'SUSPENDU';

  const handleToggleStatut = () => {
    if (isSuspendu) {
      updateStatutUtilisateur(user.id, 'ACTIF');
      toast.success(`${user.nom} a été réactivé.`);
    } else {
      if (!confirm(`Suspendre le compte de ${user.nom} ?`)) return;
      updateStatutUtilisateur(user.id, 'SUSPENDU');
      toast.success(`${user.nom} a été suspendu.`);
    }
  };

  const handleRevoquer = () => {
    toast.info('Révocation d\'accès non disponible sans backend.');
  };

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
          {/* Avatar */}
          <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-[#1a365d] to-[#3a6fa8] flex items-center justify-center text-white text-3xl font-bold shrink-0 select-none">
            {user.nom.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-[#11355b] mb-1">{user.nom}</h1>
            <p className="text-sm text-gray-400 mb-3">
              {user.poste} &bull; ID: {user.idBadge}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                isActif    ? 'bg-emerald-100 text-emerald-700' :
                isSuspendu ? 'bg-red-100 text-red-600' :
                             'bg-gray-100 text-gray-500'
              }`}>
                {user.statut}
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                {user.niveau}
              </span>
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${roleBadge[user.role]}`}>
                {user.role}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleStatut}
            className={`shrink-0 flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer shadow-sm text-white ${
              isSuspendu
                ? 'bg-emerald-500 hover:bg-emerald-600'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {!isSuspendu && <Ban size={16} />}
            {isSuspendu ? 'Réactiver l\'utilisateur' : 'Suspendre l\'utilisateur'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-5">

          {/* ===== COLONNE PRINCIPALE ===== */}
          <div className="space-y-5">

            {/* Profil Professionnel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-[#11355b] mb-5 pb-3 border-b border-gray-100">
                Profil Professionnel
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ProfileField label="Direction régionale"   value={user.directionRegionale} />
                <ProfileField label="Date d'embauche"       value={user.dateEmbauche} />
                <ProfileField label="Email institutionnel"  value={user.emailInstitutionnel} />
                <ProfileField label="Habilitation sécurité" value={user.habilitationSecurite} />
                <ProfileField label="Département"           value={user.departement} />
                <ProfileField label="Dernière connexion"    value={user.derniereConnexion} />
              </div>
            </div>

            {/* Activités récentes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-bold text-[#11355b] mb-4">Activités Récentes</h2>
              <div className="space-y-3">
                {user.activites.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50/60 transition-colors cursor-pointer group"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      a.icon === 'doc' ? 'bg-blue-50' : 'bg-emerald-50'
                    }`}>
                      {a.icon === 'doc'
                        ? <FileText size={18} className="text-[#11355b]" />
                        : <LogIn    size={18} className="text-emerald-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{a.titre}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{a.detail}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-400 shrink-0 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ===== COLONNE LATÉRALE ===== */}
          <div className="space-y-4 lg:sticky lg:top-6 self-start">

            {/* Indicateurs de performance */}
            <div className="bg-[#11355b] rounded-xl p-5 text-white">
              <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-3">
                Indicateurs de performance
              </p>
              <p className="text-4xl font-bold mb-1">{user.performance}%</p>
              <p className="text-sm text-white/70 mb-4">Conformité aux protocoles</p>

              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    user.performance >= 90 ? 'bg-emerald-400' :
                    user.performance >= 70 ? 'bg-yellow-400' :
                                             'bg-red-400'
                  }`}
                  style={{ width: `${user.performance}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-white/40 font-bold uppercase tracking-wider">
                <span>Standard</span>
                <span>Exceptionnel</span>
              </div>
            </div>

            {/* Zone critique */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-red-500 shrink-0" />
                <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider">Zone Critique</h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Les modifications de statut nécessitent une validation de double authentification
                et seront inscrites au registre permanent des audits.
              </p>
              <button
                type="button"
                onClick={handleRevoquer}
                className="w-full text-sm font-bold text-red-500 hover:text-red-600 border border-red-200 hover:bg-red-50 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                Révoquer l&apos;accès aux archives
              </button>
            </div>
          </div>
        </div>
      </div>
    
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}

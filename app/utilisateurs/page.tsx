"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, Users, ShieldCheck, Lock } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { type Role, type Statut } from '../data/utilisateurs';
import { useStore } from '@/lib/store';

const ROLES: Role[] = ['SUPER ADMIN', 'DF', 'COMPTABLE', 'AUDITEUR', 'LECTEUR'];
const STATUTS: Statut[] = ['ACTIF', 'INACTIF', 'SUSPENDU'];

const roleBadge: Record<Role, string> = {
  'SUPER ADMIN': 'bg-[#11355b] text-white',
  'DF':          'bg-[#1a4a7a] text-white',
  'COMPTABLE':   'bg-gray-100 text-gray-600',
  'AUDITEUR':    'bg-gray-100 text-gray-600',
  'LECTEUR':     'bg-gray-100 text-gray-600',
};

const statutConfig: Record<Statut, { dot: string; text: string; label: string }> = {
  ACTIF:    { dot: 'bg-emerald-500', text: 'text-emerald-600', label: 'ACTIF' },
  INACTIF:  { dot: 'bg-gray-400',   text: 'text-gray-400',    label: 'INACTIF' },
  SUSPENDU: { dot: 'bg-red-500',    text: 'text-red-500',     label: 'SUSPENDU' },
};

const UtilisateursPage = () => {
  const router = useRouter();
  const { utilisateurs } = useStore();
  const [search, setSearch]             = useState('');
  const [roleFilter, setRoleFilter]     = useState<Role | ''>('');
  const [statutFilter, setStatutFilter] = useState<Statut | ''>('');

  const filtered = useMemo(() =>
    utilisateurs.filter((u) => {
      const matchSearch = u.nom.toLowerCase().includes(search.toLowerCase()) ||
                          u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole   = !roleFilter   || u.role   === roleFilter;
      const matchStatut = !statutFilter || u.statut === statutFilter;
      return matchSearch && matchRole && matchStatut;
    }),
  [utilisateurs, search, roleFilter, statutFilter]);

  const total     = utilisateurs.length;
  const actifs    = utilisateurs.filter((u) => u.statut === 'ACTIF').length;
  const suspendus = utilisateurs.filter((u) => u.statut === 'SUSPENDU').length;

  return (
    <DashboardLayout>
      <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-6">

        {/* Titre */}
        <h1 className="text-2xl font-bold text-[#11355b]">Liste des utilisateurs</h1>

        {/* KPI Cards — en haut sur mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5">
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
              <Users size={20} className="text-[#11355b]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Utilisateurs</p>
              <p className="text-2xl md:text-3xl font-bold text-[#11355b]">{total}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Utilisateurs Actifs</p>
              <p className="text-2xl md:text-3xl font-bold text-emerald-600">{actifs}</p>
            </div>
          </div>

          <div className="bg-[#11355b] rounded-xl p-5 shadow-lg flex items-center gap-4">
            <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
              <Lock size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-white/60 uppercase tracking-wider">Comptes Suspendus</p>
              <p className="text-2xl md:text-3xl font-bold text-white">{suspendus}</p>
            </div>
          </div>
        </div>

        {/* Filtres — recherche pleine largeur, selects en grille 2 col sur mobile */}
        <div className="flex flex-col gap-3">
          {/* Barre de recherche — toujours pleine largeur */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un utilisateur..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-colors bg-white"
            />
          </div>

          {/* Selects — 2 colonnes sur mobile, inline sur sm+ */}
          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3">
            <div className="relative w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as Role | '')}
                className="w-full sm:w-auto appearance-none pl-3 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-colors bg-white cursor-pointer truncate"
              >
                <option value="">Tous les rôles</option>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative w-full sm:w-auto">
              <select
                value={statutFilter}
                onChange={(e) => setStatutFilter(e.target.value as Statut | '')}
                className="w-full sm:w-auto appearance-none pl-3 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-colors bg-white cursor-pointer"
              >
                <option value="">Tous les statuts</option>
                {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[480px]">
              <thead>
                <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/70 border-b border-gray-100">
                  <th className="px-4 md:px-6 py-4">Nom</th>
                  {/* Email masqué sur mobile */}
                  <th className="px-4 md:px-6 py-4 hidden sm:table-cell">Email</th>
                  <th className="px-4 md:px-6 py-4">Rôle</th>
                  {/* Département masqué sur mobile */}
                  <th className="px-4 md:px-6 py-4 hidden md:table-cell">Département</th>
                  {/* Dernière connexion masquée sur mobile et tablet */}
                  <th className="px-4 md:px-6 py-4 hidden lg:table-cell">Dernière connexion</th>
                  <th className="px-4 md:px-6 py-4">Statut</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-sm">
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => {
                    const s = statutConfig[u.statut];
                    return (
                      <tr
                        key={u.id}
                        onClick={() => router.push(`/utilisateurs/${u.id}`)}
                        className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer"
                      >
                        <td className="px-4 md:px-6 py-4">
                          <p className="font-semibold text-[#11355b] text-sm leading-tight">{u.nom}</p>
                          {/* Email affiché sous le nom sur mobile uniquement */}
                          <p className="text-xs text-gray-400 mt-0.5 sm:hidden truncate max-w-[140px]">{u.email}</p>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-gray-500 hidden sm:table-cell">{u.email}</td>
                        <td className="px-4 md:px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${roleBadge[u.role]}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-gray-600 hidden md:table-cell">{u.departement}</td>
                        <td className="px-4 md:px-6 py-4 text-gray-400 hidden lg:table-cell">{u.derniereConnexion}</td>
                        <td className="px-4 md:px-6 py-4">
                          <span className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${s.text}`}>
                            <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                            {s.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default UtilisateursPage;
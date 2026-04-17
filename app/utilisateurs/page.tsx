"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, Users, ShieldCheck, Lock } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { utilisateurs, type Role, type Statut } from '../data/utilisateurs';

const ROLES: Role[] = ['SUPER ADMIN', 'DF', 'COMPTABLE', 'AUDITEUR', 'LECTEUR'];
const STATUTS: Statut[] = ['ACTIF', 'INACTIF', 'SUSPENDU'];

const roleBadge: Record<Role, string> = {
  'SUPER ADMIN':         'bg-[#11355b] text-white',
  'DF': 'bg-[#1a4a7a] text-white',
  'COMPTABLE':           'bg-gray-100 text-gray-600',
  'AUDITEUR':            'bg-gray-100 text-gray-600',
  'LECTEUR':             'bg-gray-100 text-gray-600',
};

const statutConfig: Record<Statut, { dot: string; text: string; label: string }> = {
  ACTIF:     { dot: 'bg-emerald-500', text: 'text-emerald-600', label: 'ACTIF' },
  INACTIF:   { dot: 'bg-gray-400',   text: 'text-gray-400',    label: 'INACTIF' },
  SUSPENDU:  { dot: 'bg-red-500',    text: 'text-red-500',     label: 'SUSPENDU' },
};

const UtilisateursPage = () => {
  const router = useRouter();
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [statutFilter, setStatutFilter] = useState<Statut | ''>('');

  const filtered = useMemo(() =>
    utilisateurs.filter((u) => {
      const matchSearch = u.nom.toLowerCase().includes(search.toLowerCase()) ||
                          u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole   = !roleFilter   || u.role   === roleFilter;
      const matchStatut = !statutFilter || u.statut === statutFilter;
      return matchSearch && matchRole && matchStatut;
    }),
  [search, roleFilter, statutFilter]);

  const total     = 48;
  const actifs    = 39;
  const suspendus = 9;

  return (
    <DashboardLayout>
      <div className="max-w-300 mx-auto space-y-6">

        {/* Titre */}
        <h1 className="text-2xl font-bold text-[#11355b]">Liste des utilisateurs</h1>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un utilisateur..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-colors bg-white"
            />
          </div>

          {/* Filtre rôle */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as Role | '')}
              className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-colors bg-white cursor-pointer"
            >
              <option value="">Tous les rôles</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Filtre statut */}
          <div className="relative">
            <select
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value as Statut | '')}
              className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-colors bg-white cursor-pointer"
            >
              <option value="">Tous les statuts</option>
              {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/70 border-b border-gray-100">
                  <th className="px-6 py-4">Nom complet</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Rôle</th>
                  <th className="px-6 py-4">Département</th>
                  <th className="px-6 py-4">Dernière connexion</th>
                  <th className="px-6 py-4">Statut</th>
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
                        <td className="px-6 py-4 font-semibold text-[#11355b]">{u.nom}</td>
                        <td className="px-6 py-4 text-gray-500">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${roleBadge[u.role]}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{u.departement}</td>
                        <td className="px-6 py-4 text-gray-400">{u.derniereConnexion}</td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${s.text}`}>
                            <span className={`w-2 h-2 rounded-full ${s.dot}`} />
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

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pb-8">
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
              <Users size={22} className="text-[#11355b]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Utilisateurs</p>
              <p className="text-3xl font-bold text-[#11355b]">{total}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck size={22} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Utilisateurs Actifs</p>
              <p className="text-3xl font-bold text-emerald-600">{actifs}</p>
            </div>
          </div>

          <div className="bg-[#11355b] rounded-xl p-6 shadow-lg flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
              <Lock size={22} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Comptes Suspendus</p>
              <p className="text-3xl font-bold text-white">{suspendus}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UtilisateursPage;

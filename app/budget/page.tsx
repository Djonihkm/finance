"use client";

import React, { useState } from 'react';
import {
  Landmark, ShoppingCart, PiggyBank, CalendarCheck,
  SlidersHorizontal, Download, ChevronLeft, ChevronRight,
  TrendingUp,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

interface Direction {
  id: string;
  nom: string;
  code: string;
  categorie: string;
  alloue: number;
  depense: number;
  statut: 'SÉCURISÉ' | 'ATTENTION' | 'EN COURS' | 'CRITIQUE';
  color: string; // couleur de l'icône bg
}

const directions: Direction[] = [
  { id: '1', nom: 'Infrastructures Publiques', code: 'INF-2024-001', categorie: 'Investissements',  alloue: 12_450_000, depense: 5_120_400,  statut: 'SÉCURISÉ',  color: 'from-slate-600 to-slate-800' },
  { id: '2', nom: 'Éducation & Recherche',     code: 'EDU-2024-004', categorie: 'Fonctionnement',   alloue:  8_200_000, depense: 6_850_000,  statut: 'ATTENTION', color: 'from-blue-600 to-blue-800' },
  { id: '3', nom: 'Santé Publique',            code: 'SAN-2024-012', categorie: 'Social & Santé',   alloue: 15_300_000, depense: 3_200_000,  statut: 'SÉCURISÉ',  color: 'from-teal-600 to-teal-800' },
  { id: '4', nom: 'Environnement',             code: 'ENV-2024-008', categorie: 'Développement',    alloue:  6_850_000, depense: 3_025_000,  statut: 'EN COURS',  color: 'from-green-600 to-green-800' },
  { id: '5', nom: 'Agriculture & Élevage',     code: 'AGR-2024-015', categorie: 'Développement',    alloue:  4_200_000, depense: 4_100_000,  statut: 'CRITIQUE',  color: 'from-orange-600 to-orange-800' },
  { id: '6', nom: 'Sécurité Intérieure',       code: 'SEC-2024-003', categorie: 'Fonctionnement',   alloue:  9_750_000, depense: 2_800_000,  statut: 'SÉCURISÉ',  color: 'from-indigo-600 to-indigo-800' },
  { id: '7', nom: 'Transport & Mobilité',      code: 'TRA-2024-021', categorie: 'Investissements',  alloue:  7_100_000, depense: 3_550_000,  statut: 'EN COURS',  color: 'from-cyan-600 to-cyan-800' },
  { id: '8', nom: 'Affaires Sociales',         code: 'AFS-2024-009', categorie: 'Social & Santé',   alloue:  3_900_000, depense: 1_200_000,  statut: 'SÉCURISÉ',  color: 'from-purple-600 to-purple-800' },
];

const statutConfig = {
  'SÉCURISÉ': { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500' },
  'ATTENTION': { bg: 'bg-red-50',    text: 'text-red-600',     bar: 'bg-red-500' },
  'EN COURS':  { bg: 'bg-yellow-50', text: 'text-yellow-700',  bar: 'bg-yellow-400' },
  'CRITIQUE':  { bg: 'bg-red-100',   text: 'text-red-700',     bar: 'bg-red-600' },
};

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';

const fmtM = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M FCFA`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}k FCFA`;
  return `${n} FCFA`;
};

const ITEMS_PER_PAGE = 4;
const TOTAL_DIRECTIONS = 24;

const BudgetPage = () => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(directions.length / ITEMS_PER_PAGE);
  const paginated  = directions.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalAnnuel  = 42_800_000;
  const consomme     = 18_200_000;
  const disponible   = 24_600_000;
  const engage       =  6_400_000;
  const pctConsomme  = Math.round((consomme / totalAnnuel) * 100);

  return (
    <DashboardLayout>
      <div className="max-w-300 mx-auto space-y-6">

        {/* ── KPI CARDS ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">

          {/* Total Annuel */}
          <div className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
              <Landmark size={16} className="text-[#11355b]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">Total Annuel</p>
              <p className="text-base font-bold text-[#11355b] leading-tight">{fmtM(totalAnnuel)}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <TrendingUp size={11} className="text-emerald-500 shrink-0" />
                <span className="text-[10px] text-emerald-600 font-medium">+4.2% vs l&apos;an dernier</span>
              </div>
            </div>
          </div>

          {/* Consommé */}
          <div className="bg-white  rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
              <ShoppingCart size={16} className="text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Consommé</p>
              <p className="text-base font-bold text-[#11355b] leading-tight">{fmtM(consomme)}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-gray-100 rounded-full h-1">
                  <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${pctConsomme}%` }} />
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">{pctConsomme}%</span>
              </div>
            </div>
          </div>

          {/* Disponible */}
          <div className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center shrink-0">
              <PiggyBank size={16} className="text-yellow-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Disponible</p>
              <p className="text-base font-bold text-[#11355b] leading-tight">{fmtM(disponible)}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Prévu fin de trimestre</p>
            </div>
          </div>

          {/* Engagé */}
          <div className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
              <CalendarCheck size={16} className="text-red-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Engagé</p>
              <p className="text-base font-bold text-[#11355b] leading-tight">{fmtM(engage)}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">En attente de validation</p>
            </div>
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">

          {/* Header table */}
          <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-lg font-bold text-[#11355b]">Répartition par Direction</h2>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
                <SlidersHorizontal size={15} />
                Filtrer
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#11355b] hover:bg-[#1a4a7a] text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer shadow-sm">
                <Download size={15} />
                Exporter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/60 border-b border-gray-100">
                  <th className="px-6 py-4">Direction / Département</th>
                  <th className="px-6 py-4">Catégorie</th>
                  <th className="px-6 py-4">Alloué</th>
                  <th className="px-6 py-4">Dépensé</th>
                  <th className="px-6 py-4">Exécution %</th>
                  <th className="px-6 py-4">Statut</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {paginated.map((d) => {
                  const pct = Math.round((d.depense / d.alloue) * 100);
                  const s   = statutConfig[d.statut];
                  const initiales = d.nom.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
                  return (
                    <tr
                      key={d.id}
                      className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer"
                    >
                      {/* Direction */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-linear-to-br ${d.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                            {initiales}
                          </div>
                          <div>
                            <p className="font-semibold text-[#11355b]">{d.nom}</p>
                            <p className="text-xs text-gray-400">Code: {d.code}</p>
                          </div>
                        </div>
                      </td>

                      {/* Catégorie */}
                      <td className="px-6 py-4 text-gray-500">{d.categorie}</td>

                      {/* Alloué */}
                      <td className="px-6 py-4 font-bold text-[#11355b]">
                        {fmt(d.alloue)}
                      </td>

                      {/* Dépensé */}
                      <td className={`px-6 py-4 font-semibold ${pct >= 80 ? 'text-red-500' : 'text-emerald-600'}`}>
                        {fmt(d.depense)}
                      </td>

                      {/* Exécution */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-w-[120px]">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                            <div
                              className={`${s.bar} h-1.5 rounded-full transition-all`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-600 w-8 text-right">{pct}%</span>
                        </div>
                      </td>

                      {/* Statut */}
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${s.bg} ${s.text}`}>
                          {d.statut}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 flex justify-between items-center bg-gray-50/40 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Affichage de {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, directions.length)} sur {TOTAL_DIRECTIONS} directions
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BudgetPage;

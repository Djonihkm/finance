"use client";

import { useState, useEffect, useCallback } from "react";
import { ScrollText, Search, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useNavigation } from "@/lib/navigation-context";
import { formatDate } from "@/lib/utils/formatters";

interface EntiteRef {
  id: string;
  reference?: string;
  intitule?: string;
  designation?: string;
  nom?: string;
  objet?: string;
}

interface JournalEntry {
  id: string;
  action: string;
  commentaire: string | null;
  createdAt: string;
  user: { id: string; nom: string; prenom: string; role: string };
  depense:        EntiteRef | null;
  bonCommande:    EntiteRef | null;
  immobilisation: EntiteRef | null;
  fournisseur:    EntiteRef | null;
  marche:         EntiteRef | null;
  contrat:        EntiteRef | null;
}

interface Props {
  userPrismaRole: string;
  etablissementId: string;
}

const ACTION_LABELS: Record<string, string> = {
  CREE:        "Création",
  MODIFIE:     "Modification",
  SOUMIS:      "Soumission",
  SIGNE:       "Signature",
  VALIDE:      "Validation",
  REJETE:      "Rejet",
  PAYE:        "Paiement",
  ATTRIBUE:    "Attribution",
  RESILIE:     "Résiliation",
  SORTI:       "Sortie",
  CONNEXION:   "Connexion",
  DECONNEXION: "Déconnexion",
};

const ACTION_COLORS: Record<string, string> = {
  CREE:        "bg-blue-100 text-blue-700",
  MODIFIE:     "bg-gray-100 text-gray-600",
  SOUMIS:      "bg-amber-100 text-amber-700",
  SIGNE:       "bg-purple-100 text-purple-700",
  VALIDE:      "bg-emerald-100 text-emerald-700",
  REJETE:      "bg-red-100 text-red-600",
  PAYE:        "bg-teal-100 text-teal-700",
  ATTRIBUE:    "bg-indigo-100 text-indigo-700",
  RESILIE:     "bg-red-100 text-red-600",
  SORTI:       "bg-gray-100 text-gray-500",
  CONNEXION:   "bg-green-100 text-green-700",
  DECONNEXION: "bg-orange-100 text-orange-700",
};

const ENTITE_LABELS: Record<string, string> = {
  "":             "Toutes entités",
  depense:        "Dépenses",
  bon:            "Bons de commande",
  immobilisation: "Immobilisations",
  fournisseur:    "Fournisseurs",
  marche:         "Marchés",
  contrat:        "Contrats",
  session:        "Connexions",
};

export default function JournalView({ userPrismaRole, etablissementId }: Props) {
  const { navigate } = useNavigation();

  const [entries, setEntries]   = useState<JournalEntry[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);

  const [filterAction, setFilterAction] = useState("");
  const [filterEntite, setFilterEntite] = useState("");
  const [filterDateDebut, setFilterDateDebut] = useState("");
  const [filterDateFin, setFilterDateFin]     = useState("");
  const [search, setSearch] = useState("");

  const PAGE_SIZE = 50;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchJournal = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (filterAction)   params.set("action", filterAction);
      if (filterEntite)   params.set("entite", filterEntite);
      if (filterDateDebut) params.set("dateDebut", filterDateDebut);
      if (filterDateFin)   params.set("dateFin", filterDateFin);

      const res = await fetch(`/api/journal?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      setEntries(data.entries);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [page, filterAction, filterEntite, filterDateDebut, filterDateFin]);

  useEffect(() => { fetchJournal(); }, [fetchJournal]);

  const resetFilters = () => {
    setFilterAction("");
    setFilterEntite("");
    setFilterDateDebut("");
    setFilterDateFin("");
    setSearch("");
    setPage(1);
  };

  // Identifier le type et construire le lien vers l'entité
  const getEntiteInfo = (e: JournalEntry): { label: string; href: string | null } => {
    if (e.depense)        return { label: `Dépense ${e.depense.reference ?? ""}`, href: null };
    if (e.bonCommande)    return { label: `Bon ${e.bonCommande.reference ?? ""}`, href: `/depensesEtablissement/bons/${encodeURIComponent(e.bonCommande.reference ?? "")}` };
    if (e.immobilisation) return { label: `${e.immobilisation.reference ?? ""} — ${e.immobilisation.designation ?? ""}`, href: `/immobilisations/${e.immobilisation.id}` };
    if (e.fournisseur)    return { label: `Fournisseur : ${e.fournisseur.nom ?? ""}`, href: `/fournisseurs/${e.fournisseur.id}` };
    if (e.marche)         return { label: `Marché ${e.marche.reference ?? ""}`, href: `/marches/${e.marche.id}` };
    if (e.contrat)        return { label: `Contrat ${e.contrat.reference ?? ""}`, href: `/contrats/${e.contrat.id}` };
    return { label: "Système", href: null };
  };

  const filteredLocally = entries.filter((e) => {
    if (!search) return true;
    const info = getEntiteInfo(e);
    return (
      info.label.toLowerCase().includes(search.toLowerCase()) ||
      `${e.user.prenom} ${e.user.nom}`.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#11355b] flex items-center gap-2">
          <ScrollText size={24} /> Journal d'activités
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Piste d'audit complète — {total} événement{total > 1 ? "s" : ""} enregistré{total > 1 ? "s" : ""}
        </p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Recherche</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Référence, utilisateur…"
                className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none"
                aria-label="Rechercher dans le journal"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Action</label>
            <select
              value={filterAction}
              onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none cursor-pointer"
              aria-label="Filtrer par action"
            >
              <option value="">Toutes actions</option>
              {Object.entries(ACTION_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Entité</label>
            <select
              value={filterEntite}
              onChange={(e) => { setFilterEntite(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none cursor-pointer"
              aria-label="Filtrer par type d'entité"
            >
              {Object.entries(ENTITE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Du</label>
            <input
              type="date"
              value={filterDateDebut}
              onChange={(e) => { setFilterDateDebut(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none"
              aria-label="Date de début"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Au</label>
            <input
              type="date"
              value={filterDateFin}
              onChange={(e) => { setFilterDateFin(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none"
              aria-label="Date de fin"
            />
          </div>
          {(filterAction || filterEntite || filterDateDebut || filterDateFin || search) && (
            <button
              type="button"
              onClick={resetFilters}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 underline cursor-pointer"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Chargement…</div>
        ) : filteredLocally.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">Aucun événement trouvé.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredLocally.map((entry) => {
              const entiteInfo = getEntiteInfo(entry);
              return (
                <div key={entry.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/60">
                  {/* Badge action */}
                  <div className="pt-0.5 shrink-0">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase whitespace-nowrap ${ACTION_COLORS[entry.action] ?? "bg-gray-100 text-gray-600"}`}>
                      {ACTION_LABELS[entry.action] ?? entry.action}
                    </span>
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-800">
                        {entry.user.prenom} {entry.user.nom}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{entry.user.role}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-sm text-gray-600">{entiteInfo.label}</span>
                      {entiteInfo.href && (
                        <button
                          type="button"
                          onClick={() => navigate(entiteInfo.href!)}
                          className="text-[#11355b] hover:text-[#1a4a7a] cursor-pointer"
                          aria-label="Voir l'entité"
                        >
                          <ExternalLink size={13} />
                        </button>
                      )}
                    </div>
                    {entry.commentaire && (
                      <p className="text-xs text-gray-400 mt-1 italic">« {entry.commentaire} »</p>
                    )}
                  </div>

                  {/* Heure */}
                  <div className="text-xs text-gray-400 whitespace-nowrap shrink-0 pt-0.5">
                    {formatDate(entry.createdAt)}
                    <span className="ml-1 text-gray-300">
                      {new Date(entry.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Page {page} sur {totalPages} ({total} résultats)</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft size={14} /> Précédent
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
            >
              Suivant <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

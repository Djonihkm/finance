"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  type EtatFinancier,
  type LigneEntree,
} from "@/lib/queries/etat-financier";
import { formatMontant, formatDate } from "@/lib/utils/formatters";

interface Props {
  etat: EtatFinancier;
  anneeSelectionnee: number;
  userPrismaRole: string;
  // Comptes de trésorerie disponibles pour le formulaire d'ajout
  comptesTresorerie: { id: number; numero: string; nom: string }[];
}

export default function EtatFinancierView({
  etat,
  anneeSelectionnee,
  userPrismaRole,
  comptesTresorerie,
}: Props) {
  const router = useRouter();

  // Sections dépliables
  const [chargesOuvertes, setChargesOuvertes] = useState(true);
  const [produitsOuverts, setProduitsOuverts] = useState(true);
  const [tresorerieOuverte, setTresorerieOuverte] = useState(true);

  // Formulaire d'ajout d'entrée
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    libelle: "",
    montant: "",
    compteId: comptesTresorerie[0]?.id ?? "",
  });

  // Rôles pouvant ajouter/supprimer des entrées
  const peutModifier = ["DIRECTEUR", "COMPTABLE", "ADMIN"].includes(
    userPrismaRole,
  );

  // Années disponibles dans le sélecteur (5 dernières années)
  const anneeActuelle = new Date().getFullYear();
  const annees = Array.from({ length: 5 }, (_, i) => anneeActuelle - i);

  const handleAnneeChange = (annee: number) => {
    router.push(`/etat-financier?annee=${annee}`);
  };

  // ============================================================
  // Ajouter une entrée de trésorerie
  // ============================================================
  const handleAjouterEntree = async () => {
    if (!form.libelle.trim()) {
      toast.error("Le libellé est requis.");
      return;
    }
    if (!form.montant || parseFloat(form.montant) <= 0) {
      toast.error("Le montant doit être supérieur à 0.");
      return;
    }

    setFormLoading(true);
    try {
      const res = await fetch("/api/entrees-tresorerie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          libelle: form.libelle,
          montant: parseFloat(form.montant),
          compteId: form.compteId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erreur inconnue");
      }

      toast.success("Entrée enregistrée.");
      setShowForm(false);
      setForm({
        date: new Date().toISOString().split("T")[0],
        libelle: "",
        montant: "",
        compteId: comptesTresorerie[0]?.id ?? "",
      });
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de l'enregistrement.";
      toast.error(message);
    } finally {
      setFormLoading(false);
    }
  };

  // ============================================================
  // Supprimer une entrée de trésorerie
  // ============================================================
  const handleSupprimerEntree = async (id: string) => {
    if (!confirm("Supprimer cette entrée ?")) return;
    try {
      const res = await fetch(`/api/entrees-tresorerie/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Entrée supprimée.");
      router.refresh();
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  };

  const resultatPositif = etat.resultat > 0;
  const resultatNul = etat.resultat === 0;
  const soldePositif = etat.soldeTresorerie > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── En-tête ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#11355b]">État Financier</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Exercice {anneeSelectionnee}
          </p>
        </div>
        <select
          value={anneeSelectionnee}
          onChange={(e) => handleAnneeChange(parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 cursor-pointer"
        >
          {annees.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {/* ── Cartes résumé ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CarteResume
          label="Total Entrées"
          montant={etat.totalEntrees}
          couleur="green"
          icone={<TrendingUp size={20} />}
        />
        <CarteResume
          label="Total Charges"
          montant={etat.totalCharges}
          couleur="red"
          icone={<TrendingDown size={20} />}
        />
        <CarteResume
          label="Solde Trésorerie"
          montant={etat.soldeTresorerie}
          couleur={soldePositif ? "green" : "red"}
          icone={
            soldePositif ? <TrendingUp size={20} /> : <TrendingDown size={20} />
          }
          isResultat
          suffixe={soldePositif ? "Disponible" : "Insuffisant ⚠️"}
        />
        <CarteResume
          label="Résultat"
          montant={etat.resultat}
          couleur={resultatPositif ? "green" : resultatNul ? "gray" : "red"}
          icone={
            resultatPositif ? (
              <TrendingUp size={20} />
            ) : resultatNul ? (
              <Minus size={20} />
            ) : (
              <TrendingDown size={20} />
            )
          }
          isResultat
          suffixe={
            resultatPositif ? "Excédent" : resultatNul ? "Équilibre" : "Déficit"
          }
        />
      </div>

      {/* ── Section Trésorerie ──────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button
            type="button"
            onClick={() => setTresorerieOuverte((v) => !v)}
            className="flex items-center gap-3 hover:opacity-70 transition-opacity cursor-pointer"
          >
            {tresorerieOuverte ? (
              <ChevronDown size={18} className="text-gray-400" />
            ) : (
              <ChevronRight size={18} className="text-gray-400" />
            )}
            <div className="text-left">
              <p className="font-bold text-[#11355b] text-sm">Trésorerie</p>
              <p className="text-xs text-gray-400">
                Entrées et sorties par compte
              </p>
            </div>
          </button>

          {/* Bouton ajouter — visible uniquement pour les rôles autorisés */}
          {peutModifier && tresorerieOuverte && (
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#11355b] hover:bg-[#1a4a7a] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Plus size={14} />
              Ajouter une entrée
            </button>
          )}
        </div>

        {tresorerieOuverte && (
          <div>
            {/* Formulaire d'ajout */}
            {showForm && (
              <div className="p-4 bg-blue-50 border-b border-blue-100">
                <p className="text-xs font-bold text-[#11355b] uppercase tracking-wider mb-3">
                  Nouvelle entrée de trésorerie
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Date */}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      Date
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, date: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#11355b]/20"
                    />
                  </div>

                  {/* Libellé */}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      Libellé
                    </label>
                    <input
                      type="text"
                      value={form.libelle}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, libelle: e.target.value }))
                      }
                      placeholder="Ex: Subvention État"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#11355b]/20"
                    />
                  </div>

                  {/* Compte */}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      Compte
                    </label>
                    <select
                      value={form.compteId}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          compteId: parseInt(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 bg-white cursor-pointer"
                    >
                      {comptesTresorerie.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.numero} — {c.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Montant */}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      Montant (FCFA)
                    </label>
                    <input
                      type="number"
                      value={form.montant}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, montant: e.target.value }))
                      }
                      placeholder="0"
                      min={1}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#11355b]/20"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handleAjouterEntree}
                    disabled={formLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    {formLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />{" "}
                        Enregistrement...
                      </>
                    ) : (
                      "Enregistrer"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm cursor-pointer transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Liste des entrées groupées par compte */}
            {etat.tresorerie.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                Aucune entrée de trésorerie pour cette période.
              </p>
            ) : (
              etat.tresorerie.map((section) => (
                <div
                  key={section.compteId}
                  className="border-b border-gray-100 last:border-0"
                >
                  {/* Nom du compte (Banque / Caisse) */}
                  <div className="flex items-center justify-between px-6 py-3 bg-gray-50">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <span className="font-mono text-gray-400 mr-2">
                        {section.numero}
                      </span>
                      {section.nom}
                    </span>
                    <span
                      className={`text-sm font-bold ${section.solde >= 0 ? "text-emerald-600" : "text-red-600"}`}
                    >
                      Solde : {formatMontant(section.solde)}
                    </span>
                  </div>

                  {/* Entrées */}
                  {section.entrees.map((entree) => (
                    <div
                      key={entree.id}
                      className="flex items-center justify-between px-8 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-400 w-24 shrink-0">
                          {formatDate(entree.date)}
                        </span>
                        <span className="text-sm text-gray-700">
                          {entree.libelle}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-emerald-600">
                          +{formatMontant(entree.montant)}
                        </span>
                        {peutModifier && (
                          <button
                            type="button"
                            onClick={() => handleSupprimerEntree(entree.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Résumé du compte */}
                  <div className="flex items-center justify-between px-6 py-2 text-xs text-gray-500">
                    <span>
                      Entrées :{" "}
                      <span className="font-semibold text-emerald-600">
                        {formatMontant(section.totalEntrees)}
                      </span>
                    </span>
                    <span>
                      Sorties :{" "}
                      <span className="font-semibold text-red-500">
                        -{formatMontant(section.totalSorties)}
                      </span>
                    </span>
                  </div>
                </div>
              ))
            )}

            {/* Total trésorerie */}
            {etat.tresorerie.length > 0 && (
              <div className="flex items-center justify-between px-6 py-3 bg-[#11355b]/5 border-t border-[#11355b]/10">
                <span className="text-xs font-bold text-[#11355b] uppercase tracking-wider">
                  Solde Total Trésorerie
                </span>
                <span
                  className={`font-bold ${etat.soldeTresorerie >= 0 ? "text-emerald-600" : "text-red-600"}`}
                >
                  {formatMontant(etat.soldeTresorerie)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Section Charges ─────────────────────────────────── */}
      <Section
        titre="Charges"
        classeNom="Classe 6 — Charges engagées"
        total={etat.totalCharges}
        sections={etat.charges}
        ouvert={chargesOuvertes}
        onToggle={() => setChargesOuvertes((v) => !v)}
        couleur="red"
        vide="Aucune charge enregistrée pour cette période."
      />

      {/* ── Section Produits ────────────────────────────────── */}
      <Section
        titre="Produits"
        classeNom="Classe 7 — Produits perçus"
        total={etat.totalProduits}
        sections={etat.produits}
        ouvert={produitsOuverts}
        onToggle={() => setProduitsOuverts((v) => !v)}
        couleur="green"
        vide="Aucun produit enregistré pour cette période."
      />
    </div>
  );
}

// ============================================================
// Carte résumé
// ============================================================
function CarteResume({
  label,
  montant,
  couleur,
  icone,
  isResultat = false,
  suffixe,
}: {
  label: string;
  montant: number;
  couleur: "red" | "green" | "gray";
  icone: React.ReactNode;
  isResultat?: boolean;
  suffixe?: string;
}) {
  const styles = {
    red: { bg: "bg-red-50", text: "text-red-600", border: "border-red-100" },
    green: {
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-100",
    },
    gray: {
      bg: "bg-gray-50",
      text: "text-gray-600",
      border: "border-gray-100",
    },
  }[couleur];

  return (
    <div className={`${styles.bg} border ${styles.border} rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          {label}
        </p>
        <span className={styles.text}>{icone}</span>
      </div>
      <p className={`text-lg font-bold ${styles.text}`}>
        {isResultat && montant > 0 ? "+" : ""}
        {formatMontant(montant)}
      </p>
      {suffixe && <p className="text-xs text-gray-400 mt-1">{suffixe}</p>}
    </div>
  );
}

// ============================================================
// Section dépliable (Charges ou Produits)
// ============================================================
function Section({
  titre,
  classeNom,
  total,
  sections,
  ouvert,
  onToggle,
  couleur,
  vide,
}: {
  titre: string;
  classeNom: string;
  total: number;
  sections: EtatFinancier["charges"];
  ouvert: boolean;
  onToggle: () => void;
  couleur: "red" | "green";
  vide: string;
}) {
  const textCouleur = couleur === "red" ? "text-red-600" : "text-green-600";
  const bgCouleur = couleur === "red" ? "bg-red-50" : "bg-green-50";

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {ouvert ? (
            <ChevronDown size={18} className="text-gray-400" />
          ) : (
            <ChevronRight size={18} className="text-gray-400" />
          )}
          <div className="text-left">
            <p className="font-bold text-[#11355b] text-sm">{titre}</p>
            <p className="text-xs text-gray-400">{classeNom}</p>
          </div>
        </div>
        <span className={`font-bold text-base ${textCouleur}`}>
          {formatMontant(total)}
        </span>
      </button>

      {ouvert && (
        <div className="border-t border-gray-100">
          {sections.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">{vide}</p>
          ) : (
            sections.flatMap((s) =>
              s.comptes.map((compte) => (
                <div
                  key={compte.compteId}
                  className="flex items-center justify-between px-6 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <span className="text-xs font-mono text-gray-400 mr-2">
                      {compte.numero}
                    </span>
                    <span className="text-sm text-gray-700">{compte.nom}</span>
                  </div>
                  <span className={`text-sm font-semibold ${textCouleur}`}>
                    {formatMontant(compte.total)}
                  </span>
                </div>
              )),
            )
          )}
          {sections.length > 0 && (
            <div
              className={`flex items-center justify-between px-6 py-3 ${bgCouleur}`}
            >
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Total {titre}
              </span>
              <span className={`font-bold ${textCouleur}`}>
                {formatMontant(total)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

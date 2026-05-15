"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Wallet,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { type EtatFinancier } from "@/lib/queries/etat-financier";
import { formatMontant, formatDate } from "@/lib/utils/formatters";

interface Props {
  etat: EtatFinancier;
  anneeSelectionnee: number;
  userPrismaRole: string;
  comptesTresorerie: { id: number; numero: string; nom: string }[];
  comptesProduits: { id: number; numero: string; nom: string }[];
}

export default function EtatFinancierView({
  etat,
  anneeSelectionnee,
  userPrismaRole,
  comptesTresorerie,
   comptesProduits,
}: Props) {
  const router = useRouter();

  const [chargesOuvertes, setChargesOuvertes] = useState(true);
  const [produitsOuverts, setProduitsOuverts] = useState(true);
  const [tresorerieOuverte, setTresorerieOuverte] = useState(true);
  
  // États pour le formulaire Trésorerie
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    libelle: "",
    montant: "",
    compteId: comptesTresorerie[0]?.id ?? "",
  });

  // États pour le formulaire Produits
  const [showProduitForm, setShowProduitForm] = useState(false);
  const [produitFormLoading, setProduitFormLoading] = useState(false);
  const [produitForm, setProduitForm] = useState({
    date: new Date().toISOString().split("T")[0],
    libelle: "",
    montant: "",
    compteId: "", // Compte de produit (Classe 7)
    compteTresorerieId: comptesTresorerie[0]?.id ?? "", // Compte de trésorerie (Classe 5)
  });

  const peutModifier = ["DIRECTEUR", "COMPTABLE", "ADMIN"].includes(userPrismaRole);
  const anneeActuelle = new Date().getFullYear();
  const annees = Array.from({ length: 5 }, (_, i) => anneeActuelle - i);

  // Liste plate de tous les comptes de produits disponibles pour le select
  // const comptesProduits = etat.produits.flatMap((s) => s.comptes);

  const handleAnneeChange = (annee: number) => {
    router.push(`/etat-financier?annee=${annee}`);
  };

  // --- Gestion Trésorerie ---
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
      const message = err instanceof Error ? err.message : "Erreur lors de l'enregistrement.";
      toast.error(message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSupprimerEntree = async (id: string) => {
    if (!confirm("Supprimer cette entrée ?")) return;
    try {
      const res = await fetch(`/api/entrees-tresorerie/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Entrée supprimée.");
      router.refresh();
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  };

  // --- Gestion Produits ---
  const handleAjouterProduit = async () => {
    if (!produitForm.libelle.trim()) {
      toast.error("Le libellé est requis.");
      return;
    }
    if (!produitForm.montant || parseFloat(produitForm.montant) <= 0) {
      toast.error("Le montant doit être supérieur à 0.");
      return;
    }
    if (!produitForm.compteId) {
      toast.error("Veuillez sélectionner un compte de produit.");
      return;
    }

    setProduitFormLoading(true);
    try {
      const res = await fetch("/api/entrees-produits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: produitForm.date,
          libelle: produitForm.libelle,
          montant: parseFloat(produitForm.montant),
          compteId: produitForm.compteId,
          compteTresorerieId: produitForm.compteTresorerieId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erreur inconnue");
      }

      toast.success("Produit enregistré avec succès.");
      setShowProduitForm(false);
      setProduitForm({
        date: new Date().toISOString().split("T")[0],
        libelle: "",
        montant: "",
        compteId: "",
        compteTresorerieId: comptesTresorerie[0]?.id ?? "",
      });
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'enregistrement.";
      toast.error(message);
    } finally {
      setProduitFormLoading(false);
    }
  };

  const resultatPositif = etat.resultat > 0;
  const resultatNul = etat.resultat === 0;
  const soldePositif = etat.soldeTresorerie > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#11355b]">État Financier</h1>
          <p className="text-sm text-gray-500 mt-0.5">Exercice {anneeSelectionnee}</p>
        </div>
        <select
          value={anneeSelectionnee}
          onChange={(e) => handleAnneeChange(parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 cursor-pointer"
        >
          {annees.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Cartes résumé */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white px-5 py-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Entrées</p>
            <p className="text-lg font-bold text-[#11355b]">{formatMontant(etat.totalEntrees)}</p>
          </div>
          <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
            <TrendingUp size={18} />
          </div>
        </div>

        <div className="bg-white px-5 py-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Charges</p>
            <p className="text-lg font-bold text-[#11355b]">{formatMontant(etat.totalCharges)}</p>
          </div>
          <div className="bg-red-50 p-2 rounded-lg text-red-500">
            <TrendingDown size={18} />
          </div>
        </div>

        <div className="bg-white px-5 py-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Solde Trésorerie</p>
            <p className="text-lg font-bold text-[#11355b]">{formatMontant(etat.soldeTresorerie)}</p>
            <p className={`text-[10px] mt-0.5 ${soldePositif ? "text-emerald-600" : "text-red-500"}`}>
              {soldePositif ? "Disponible" : "Insuffisant"}
            </p>
          </div>
          <div className={`p-2 rounded-lg ${soldePositif ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
            <Wallet size={18} />
          </div>
        </div>

        {resultatPositif ? (
          <div className="bg-[#11355b] px-5 py-4 rounded-xl shadow-sm flex justify-between items-center text-white">
            <div>
              <p className="text-[10px] font-bold opacity-70 uppercase tracking-wider mb-0.5">Résultat</p>
              <p className="text-lg font-bold">+{formatMontant(etat.resultat)}</p>
              <p className="text-[10px] opacity-60 mt-0.5">Excédent</p>
            </div>
            <div className="bg-white/10 p-2 rounded-lg">
              <TrendingUp size={18} />
            </div>
          </div>
        ) : (
          <div className="bg-white px-5 py-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Résultat</p>
              <p className={`text-lg font-bold ${resultatNul ? "text-gray-600" : "text-red-500"}`}>
                {formatMontant(etat.resultat)}
              </p>
              <p className={`text-[10px] mt-0.5 ${resultatNul ? "text-gray-400" : "text-red-400"}`}>
                {resultatNul ? "Équilibre" : "Déficit"}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${resultatNul ? "bg-gray-50 text-gray-500" : "bg-red-50 text-red-500"}`}>
              {resultatNul ? <Minus size={18} /> : <TrendingDown size={18} />}
            </div>
          </div>
        )}
      </div>

      {/* Section Trésorerie */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
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
              <p className="font-bold text-[#11355b]">Trésorerie</p>
              <p className="text-xs text-gray-400">Entrées et sorties par compte</p>
            </div>
          </button>

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
            {showForm && (
              <div className="p-6 bg-blue-50 border-b border-blue-100">
                <p className="text-xs font-bold text-[#11355b] uppercase tracking-wider mb-3">
                  Nouvelle entrée de trésorerie
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#11355b]/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Libellé</label>
                    <input
                      type="text"
                      value={form.libelle}
                      onChange={(e) => setForm((f) => ({ ...f, libelle: e.target.value }))}
                      placeholder="Ex: Subvention État"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#11355b]/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Compte</label>
                    <select
                      value={form.compteId}
                      onChange={(e) => setForm((f) => ({ ...f, compteId: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 bg-white cursor-pointer"
                    >
                      {comptesTresorerie.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.numero} — {c.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Montant (FCFA)</label>
                    <input
                      type="number"
                      value={form.montant}
                      onChange={(e) => setForm((f) => ({ ...f, montant: e.target.value }))}
                      placeholder="0"
                      min={1}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#11355b]/20"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={handleAjouterEntree}
                    disabled={formLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    {formLoading ? (
                      <><Loader2 size={14} className="animate-spin" /> Enregistrement...</>
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

            {etat.tresorerie.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                Aucune entrée de trésorerie pour cette période.
              </p>
            ) : (
              etat.tresorerie.map((section) => (
                <div key={section.compteId} className="border-b border-gray-100 last:border-0">
                  <div className="flex items-center justify-between px-6 py-3 bg-gray-50">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <span className="font-mono text-gray-400 mr-2">{section.numero}</span>
                      {section.nom}
                    </span>
                    <span className={`text-sm font-bold ${section.solde >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      Solde : {formatMontant(section.solde)}
                    </span>
                  </div>

                  {section.entrees.map((entree) => (
                    <div
                      key={entree.id}
                      className="flex items-center justify-between px-8 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-400 w-24 shrink-0">{formatDate(entree.date)}</span>
                        <span className="text-sm text-gray-700">{entree.libelle}</span>
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

                  <div className="flex items-center justify-between px-6 py-2 text-xs text-gray-500">
                    <span>Entrées : <span className="font-semibold text-emerald-600">{formatMontant(section.totalEntrees)}</span></span>
                    <span>Sorties : <span className="font-semibold text-red-500">-{formatMontant(section.totalSorties)}</span></span>
                  </div>
                </div>
              ))
            )}

            {etat.tresorerie.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 bg-[#11355b]/5 border-t border-[#11355b]/10">
                <span className="text-xs font-bold text-[#11355b] uppercase tracking-wider">
                  Solde Total Trésorerie
                </span>
                <span className={`font-bold ${etat.soldeTresorerie >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatMontant(etat.soldeTresorerie)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section Charges */}
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

      {/* Section Produits (Customisée pour inclure le bouton d'ajout) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <button
            type="button"
            onClick={() => setProduitsOuverts((v) => !v)}
            className="flex items-center gap-3 hover:opacity-70 transition-opacity cursor-pointer"
          >
            {produitsOuverts ? (
              <ChevronDown size={18} className="text-gray-400" />
            ) : (
              <ChevronRight size={18} className="text-gray-400" />
            )}
            <div className="text-left">
              <p className="font-bold text-[#11355b]">Produits</p>
              <p className="text-xs text-gray-400">Classe 7 — Produits perçus</p>
            </div>
          </button>

          <div className="flex items-center gap-4">
            {peutModifier && produitsOuverts && (
              <button
                type="button"
                onClick={() => setShowProduitForm((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5  bg-[#11355b] hover:bg-[#1a4a7a] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Plus size={14} />
                Ajouter un produit
              </button>
            )}
          </div>
        </div>

        {produitsOuverts && (
          <div>
            {showProduitForm && (
              <div className="p-6 bg-emerald-50 border-b border-emerald-100">
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3">
                  Nouvelle entrée de produit
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Date</label>
                    <input
                      type="date"
                      value={produitForm.date}
                      onChange={(e) => setProduitForm((f) => ({ ...f, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Libellé</label>
                    <input
                      type="text"
                      value={produitForm.libelle}
                      onChange={(e) => setProduitForm((f) => ({ ...f, libelle: e.target.value }))}
                      placeholder="Ex: Subvention État"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Compte Produit (Cl. 7)</label>
                    <select
                      value={produitForm.compteId}
                      onChange={(e) => setProduitForm((f) => ({ ...f, compteId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white cursor-pointer"
                    >
                      <option value="">Sélectionner...</option>
                      {comptesProduits.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.numero} — {c.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Compte Trésorerie (Cl. 5)</label>
                    <select
                      value={produitForm.compteTresorerieId}
                      onChange={(e) => setProduitForm((f) => ({ ...f, compteTresorerieId: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white cursor-pointer"
                    >
                      {comptesTresorerie.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.numero} — {c.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Montant (FCFA)</label>
                    <input
                      type="number"
                      value={produitForm.montant}
                      onChange={(e) => setProduitForm((f) => ({ ...f, montant: e.target.value }))}
                      placeholder="0"
                      min={1}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={handleAjouterProduit}
                    disabled={produitFormLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    {produitFormLoading ? (
                      <><Loader2 size={14} className="animate-spin" /> Enregistrement...</>
                    ) : (
                      "Enregistrer"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProduitForm(false)}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm cursor-pointer transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {etat.produits.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                Aucun produit enregistré pour cette période.
              </p>
            ) : (
              etat.produits.flatMap((s) =>
                s.comptes.map((compte) => (
                  <div
                    key={compte.compteId}
                    className="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <div>
                      <span className="text-xs font-mono text-gray-400 mr-2">{compte.numero}</span>
                      <span className="text-sm text-gray-700">{compte.nom}</span>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">
                      {formatMontant(compte.total)}
                    </span>
                  </div>
                ))
              )
            )}
            {etat.produits.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 bg-emerald-50">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Total Produits
                </span>
                <span className="font-bold text-emerald-600">{formatMontant(etat.totalProduits)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

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
  const textCouleur = couleur === "red" ? "text-red-600" : "text-emerald-600";
  const bgCouleur = couleur === "red" ? "bg-red-50" : "bg-emerald-50";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {ouvert ? (
            <ChevronDown size={18} className="text-gray-400" />
          ) : (
            <ChevronRight size={18} className="text-gray-400" />
          )}
          <div className="text-left">
            <p className="font-bold text-[#11355b]">{titre}</p>
            <p className="text-xs text-gray-400">{classeNom}</p>
          </div>
        </div>
        <span className={`font-bold text-lg ${textCouleur}`}>{formatMontant(total)}</span>
      </button>

      {ouvert && (
        <div className="border-t border-gray-100">
          {sections.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">{vide}</p>
          ) : (
            sections.flatMap((s) =>
              s.comptes.map((compte) => (
                <div
                  key={compte.compteId}
                  className="flex items-center justify-between px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <div>
                    <span className="text-xs font-mono text-gray-400 mr-2">{compte.numero}</span>
                    <span className="text-sm text-gray-700">{compte.nom}</span>
                  </div>
                  <span className={`text-sm font-semibold ${textCouleur}`}>
                    {formatMontant(compte.total)}
                  </span>
                </div>
              ))
            )
          )}
          {sections.length > 0 && (
            <div className={`flex items-center justify-between px-6 py-4 ${bgCouleur}`}>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Total {titre}
              </span>
              <span className={`font-bold ${textCouleur}`}>{formatMontant(total)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
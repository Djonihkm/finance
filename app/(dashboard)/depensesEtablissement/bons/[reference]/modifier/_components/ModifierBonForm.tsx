"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { type BonRow } from "@/lib/queries";

interface Ligne {
  id?: string;
  designation: string;
  quantite: number;
  prixUnitaire: number;
}

export default function ModifierBonForm({ data }: { data: BonRow }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [bonData, setBonData] = useState({
    intitule: data.intitule,
    fournisseur: data.fournisseur ?? "",
    date: new Date(data.date).toISOString().slice(0, 10),
  });

  const [lignes, setLignes] = useState<Ligne[]>(
    data.lignes.map((l) => ({
      id: l.id,
      designation: l.designation,
      quantite: l.quantite,
      prixUnitaire: parseFloat(l.prixUnitaire.toString()),
    }))
  );

  const handleBonChange = (field: string, value: string) =>
    setBonData((prev) => ({ ...prev, [field]: value }));

  const handleLigneChange = (index: number, field: keyof Ligne, value: string | number) => {
    const updated = [...lignes];
    updated[index] = { ...updated[index], [field]: field === "designation" ? value : Number(value) };
    setLignes(updated);
  };

  const ajouterLigne = () => setLignes([...lignes, { designation: "", quantite: 1, prixUnitaire: 0 }]);
  const supprimerLigne = (i: number) => setLignes(lignes.filter((_, idx) => idx !== i));

  const sousTotal = lignes.reduce((acc, l) => acc + l.quantite * l.prixUnitaire, 0);

  const handleSubmit = async (resoumettre = false) => {
    if (!bonData.intitule.trim()) { toast.error("L'intitulé est requis."); return; }
    if (lignes.some((l) => !l.designation.trim())) { toast.error("Toutes les désignations sont requises."); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/bons-commande/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intitule: bonData.intitule,
          fournisseur: bonData.fournisseur || undefined,
          date: bonData.date,
          lignes: lignes.map((l) => ({
            designation: l.designation,
            quantite: l.quantite,
            prixUnitaire: l.prixUnitaire,
          })),
        }),
      });
      if (!res.ok) throw new Error();

      if (resoumettre) {
        const res2 = await fetch(`/api/bons-commande/${data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "resoumettre" }),
        });
        if (!res2.ok) throw new Error();
        toast.success("Bon modifié et resoumis pour validation.");
      } else {
        toast.success("Modifications enregistrées.");
      }

      router.push(`/depensesEtablissement/bons/${encodeURIComponent(data.reference)}`);
      router.refresh();
    } catch {
      toast.error("Erreur lors de la sauvegarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-[#11355b] text-sm font-medium mb-4 transition-colors cursor-pointer"
      >
        <ArrowLeft size={18} />
        Retour
      </button>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-10">

            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10 pb-6 border-b border-gray-100">
              <div className="w-20 h-20 relative shrink-0">
                <Image src="/fav.png" alt="Logo" fill className="object-contain" priority />
              </div>
              <div className="text-center flex-1">
                <h1 className="text-xl md:text-2xl font-bold text-[#11355b]">MODIFIER LE BON DE COMMANDE</h1>
                <p className="text-[11px] text-gray-400 uppercase tracking-widest mt-1 font-mono">{data.reference}</p>
              </div>
              <div className="text-xs text-gray-600 text-right leading-relaxed">
                <p>Cité Ministérielle</p>
                <p>Quartier Cadjèhoun – Ahouanléko</p>
                <p>Cotonou, République du Bénin</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="border-l-4 border-[#11355b] pl-4">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Intitulé du bon</p>
                  <input
                    type="text"
                    value={bonData.intitule}
                    onChange={(e) => handleBonChange("intitule", e.target.value)}
                    className="text-base font-bold text-[#11355b] bg-transparent w-full focus:outline-none focus:bg-blue-50/50 rounded px-1 -ml-1"
                  />
                </div>
                <div className="border-l-4 border-[#11355b] pl-4">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Date d&apos;émission</p>
                  <input
                    type="date"
                    value={bonData.date}
                    onChange={(e) => handleBonChange("date", e.target.value)}
                    className="text-base font-semibold text-[#11355b] bg-transparent w-full focus:outline-none focus:bg-blue-50/50 rounded px-1 -ml-1"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Fournisseur</p>
                <input
                  type="text"
                  value={bonData.fournisseur}
                  onChange={(e) => handleBonChange("fournisseur", e.target.value)}
                  placeholder="Nom du fournisseur"
                  className="text-base font-bold text-[#11355b] bg-transparent w-full focus:outline-none focus:bg-white rounded px-1 -ml-1"
                />
              </div>
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#11355b] text-white">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">Désignation</th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider w-24">Quantité</th>
                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider w-36">Prix unitaire</th>
                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider w-36">Total</th>
                    <th className="px-2 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {lignes.map((ligne, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={ligne.designation}
                          onChange={(e) => handleLigneChange(i, "designation", e.target.value)}
                          placeholder="Description de l'article"
                          className="w-full text-sm text-gray-700 bg-transparent focus:outline-none focus:bg-blue-50/40 rounded px-2 py-1"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          value={ligne.quantite}
                          min={1}
                          onChange={(e) => handleLigneChange(i, "quantite", e.target.value)}
                          className="w-full text-sm text-gray-700 text-center bg-transparent focus:outline-none focus:bg-blue-50/40 rounded px-2 py-1"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          value={ligne.prixUnitaire}
                          min={0}
                          onChange={(e) => handleLigneChange(i, "prixUnitaire", e.target.value)}
                          className="w-full text-sm text-gray-700 text-right bg-transparent focus:outline-none focus:bg-blue-50/40 rounded px-2 py-1"
                        />
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-[#11355b]">
                        {(ligne.quantite * ligne.prixUnitaire).toLocaleString("fr-FR")}
                      </td>
                      <td className="px-2 py-3 text-center">
                        {lignes.length > 1 && (
                          <button type="button" onClick={() => supprimerLigne(i)} className="text-red-400 hover:text-red-600 cursor-pointer transition-colors">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={ajouterLigne}
              className="flex items-center gap-2 text-sm font-semibold text-[#11355b] hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors mb-6 cursor-pointer"
            >
              <Plus size={16} />
              Ajouter une ligne
            </button>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <div className="bg-gray-50 rounded-lg p-5 w-full max-w-xs">
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-base font-bold text-[#11355b] uppercase tracking-wide">Total TTC</span>
                  <span className="text-xl font-bold text-[#11355b]">{sousTotal.toLocaleString("fr-FR")} FCFA</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="lg:sticky lg:top-6 space-y-3">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs italic text-blue-600 text-center">Cliquez sur un bloc pour le modifier.</p>
            </div>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors shadow-md cursor-pointer"
            >
              {loading ? "En cours…" : "Sauvegarder et resoumettre"}
              {!loading && <ArrowRight size={18} />}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="w-full bg-white border border-gray-200 hover:border-[#11355b] disabled:opacity-50 text-[#11355b] px-5 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-colors cursor-pointer"
            >
              Sauvegarder sans resoumettre
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, FileText, Landmark, Wallet } from "lucide-react";
import { toast } from "sonner";
import { type DepenseRow } from "@/lib/queries";

const CATEGORIES = [
  { value: "FOURNITURE", label: "Fourniture" },
  { value: "MOBILIER", label: "Mobilier" },
  { value: "PERSONNEL", label: "Personnel" },
  { value: "PEDAGOGIE", label: "Pédagogie" },
  { value: "EQUIPEMENT", label: "Équipement" },
  { value: "TRAVAUX", label: "Travaux" },
  { value: "AUTRE", label: "Autre" },
];

const PAIEMENTS = [
  { value: "ESPECES", label: "Espèces" },
  { value: "VIREMENT", label: "Virement" },
  { value: "VIREMENT_30J", label: "Virement 30j" },
  { value: "VIREMENT_60J", label: "Virement 60j" },
  { value: "CHEQUE", label: "Chèque" },
  { value: "CARTE_BANCAIRE", label: "Carte bancaire" },
];

const inputClass =
  "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-all";
const labelClass = "block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2";

export default function ModifierDepenseForm({ data }: { data: DepenseRow }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    intitule: data.intitule,
    categorie: data.categorie,
    date: new Date(data.date).toISOString().slice(0, 10),
    paiement: data.paiement,
    montant: data.montant.toString(),
    fournisseur: data.fournisseur ?? "",
    description: data.description ?? "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (resoumettre = false) => {
    if (!form.intitule.trim()) { toast.error("L'intitulé est requis."); return; }
    if (!form.montant || Number(form.montant) <= 0) { toast.error("Le montant est requis."); return; }
    if (!form.date) { toast.error("La date est requise."); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/depenses/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intitule: form.intitule,
          categorie: form.categorie,
          paiement: form.paiement,
          montant: parseFloat(form.montant),
          date: form.date,
          fournisseur: form.fournisseur || undefined,
          description: form.description || undefined,
        }),
      });
      if (!res.ok) throw new Error();

      if (resoumettre) {
        const res2 = await fetch(`/api/depenses/${data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "resoumettre" }),
        });
        if (!res2.ok) throw new Error();
        toast.success("Dépense modifiée et resoumise pour validation.");
      } else {
        toast.success("Modifications enregistrées.");
      }

      router.push(`/depensesEtablissement/${encodeURIComponent(data.reference)}`);
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

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#11355b]">Modifier la dépense</h1>
        <p className="text-gray-500 text-sm mt-2 font-mono">{data.reference}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#11355b] rounded-lg flex items-center justify-center shrink-0">
                <FileText size={20} className="text-white" />
              </div>
              <h2 className="text-base font-bold text-[#11355b] uppercase tracking-wide">Identification</h2>
            </div>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Intitulé de la dépense</label>
                <input type="text" name="intitule" value={form.intitule} onChange={handleChange} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Catégorie</label>
                  <select name="categorie" value={form.categorie} onChange={handleChange} className={inputClass}>
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Mode de paiement</label>
                  <select name="paiement" value={form.paiement} onChange={handleChange} className={inputClass}>
                    {PAIEMENTS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Date</label>
                  <input type="date" name="date" value={form.date} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#11355b] rounded-lg flex items-center justify-center shrink-0">
                <Landmark size={20} className="text-white" />
              </div>
              <h2 className="text-base font-bold text-[#11355b] uppercase tracking-wide">Fournisseur</h2>
            </div>
            <div>
              <label className={labelClass}>Nom du fournisseur (optionnel)</label>
              <input type="text" name="fournisseur" value={form.fournisseur} onChange={handleChange} placeholder="Nom ou entité…" className={inputClass} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                <Wallet size={20} className="text-white" />
              </div>
              <h2 className="text-base font-bold text-[#11355b] uppercase tracking-wide">Montant</h2>
            </div>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Montant</label>
                <div className="relative">
                  <input
                    type="number"
                    name="montant"
                    value={form.montant}
                    onChange={handleChange}
                    min={0}
                    className={`${inputClass} pr-16`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">FCFA</span>
                </div>
              </div>
              <div>
                <label className={labelClass}>Description (optionnelle)</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} />
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="lg:sticky lg:top-6 space-y-3">
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

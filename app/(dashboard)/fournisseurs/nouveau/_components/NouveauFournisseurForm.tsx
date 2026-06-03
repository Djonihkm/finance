"use client";

import { useState } from "react";
import { useNavigation } from "@/lib/navigation-context";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const CATEGORIES = [
  { value: "FOURNITURES", label: "Fournitures" },
  { value: "SERVICES",    label: "Services" },
  { value: "TRAVAUX",     label: "Travaux" },
  { value: "AUTRE",       label: "Autre" },
];

const inputClass =
  "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-all";
const labelClass =
  "block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2";

export default function NouveauFournisseurForm() {
  const { navigate } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    categorie: "FOURNITURES",
    telephone: "",
    email: "",
    adresse: "",
    rccm: "",
    nif: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom) { toast.error("Le nom est requis"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/fournisseurs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      toast.success("Fournisseur créé avec succès");
      navigate(`/fournisseurs/${data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate("/fournisseurs")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#11355b] mb-6 cursor-pointer transition-colors"
      >
        <ArrowLeft size={16} /> Retour aux fournisseurs
      </button>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
        <h2 className="text-lg font-bold text-[#11355b]">Informations du fournisseur</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className={labelClass}>Nom du fournisseur *</label>
            <input name="nom" value={form.nom} onChange={handleChange} required
              placeholder="Ex : Société ABC SARL" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Catégorie *</label>
            <select name="categorie" value={form.categorie} onChange={handleChange} className={inputClass}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Téléphone</label>
            <input name="telephone" value={form.telephone} onChange={handleChange}
              placeholder="Ex : +229 97 00 00 00" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="contact@fournisseur.com" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>RCCM</label>
            <input name="rccm" value={form.rccm} onChange={handleChange}
              placeholder="Ex : RB/COT/2024/A/1234" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>NIF</label>
            <input name="nif" value={form.nif} onChange={handleChange}
              placeholder="Ex : 3201234567890" className={inputClass} />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Adresse</label>
            <input name="adresse" value={form.adresse} onChange={handleChange}
              placeholder="Adresse complète du fournisseur" className={inputClass} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/fournisseurs")}
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-[#11355b] hover:bg-[#1a4a7a] text-white text-sm font-semibold transition-colors shadow-md cursor-pointer disabled:opacity-60"
          >
            {loading ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}

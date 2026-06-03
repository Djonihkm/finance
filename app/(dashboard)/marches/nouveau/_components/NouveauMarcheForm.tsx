"use client";

import { useState } from "react";
import { useNavigation } from "@/lib/navigation-context";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const TYPES = [
  { value: "FOURNITURES", label: "Fournitures" },
  { value: "SERVICES",    label: "Services" },
  { value: "TRAVAUX",     label: "Travaux" },
  { value: "AUTRE",       label: "Autre" },
];

const inputClass =
  "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-all";
const labelClass =
  "block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2";

export default function NouveauMarcheForm() {
  const { navigate } = useNavigation();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    objet: "",
    type: "FOURNITURES",
    montantEstime: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.objet || !form.montantEstime) {
      toast.error("Objet et montant estimé sont requis");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/marches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, montantEstime: parseFloat(form.montantEstime) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      toast.success("Marché créé avec succès");
      navigate(`/marches/${data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate("/marches")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#11355b] mb-6 cursor-pointer transition-colors"
      >
        <ArrowLeft size={16} /> Retour aux marchés
      </button>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
        <h2 className="text-lg font-bold text-[#11355b]">Informations du marché</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className={labelClass}>Objet du marché *</label>
            <input name="objet" value={form.objet} onChange={handleChange} required
              placeholder="Ex : Fourniture de tables-bancs scolaires" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Type *</label>
            <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Montant estimé (FCFA) *</label>
            <input name="montantEstime" type="number" min="0" value={form.montantEstime} onChange={handleChange} required
              placeholder="Ex : 5000000" className={inputClass} />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              placeholder="Précisions sur l'objet du marché…"
              className={inputClass + " resize-none"} />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700">
          Le marché sera créé avec le statut <strong>En attente</strong>. Vous pourrez lui attribuer un fournisseur depuis la page de détail.
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate("/marches")}
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer">
            Annuler
          </button>
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-[#11355b] hover:bg-[#1a4a7a] text-white text-sm font-semibold transition-colors shadow-md cursor-pointer disabled:opacity-60">
            {loading ? "Enregistrement…" : "Créer le marché"}
          </button>
        </div>
      </form>
    </div>
  );
}

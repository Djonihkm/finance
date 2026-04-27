/**
 * app/(dashboard)/depensesEtablissement/nouveau/page.tsx — Client Component
 * ──────────────────────────────────────────────────────────────────────────
 * Formulaire de création d'une dépense pour un établissement.
 * Soumet via POST /api/depenses puis redirige vers la liste.
 *
 * Flux : ici → POST /api/depenses → router.push('/depensesEtablissement')
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, FileText, Landmark, Wallet, UploadCloud, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

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

interface FormData {
  intitule: string;
  categorie: string;
  date: string;
  paiement: string;
  montant: string;
  fournisseur: string;
  description: string;
}

const inputClass =
  "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-all";
const labelClass = "block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2";

export default function NouvelleDepensePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [form, setForm] = useState<FormData>({
    intitule: "",
    categorie: "FOURNITURE",
    date: "",
    paiement: "VIREMENT",
    montant: "",
    fournisseur: "",
    description: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.intitule.trim()) { toast.error("L'intitulé est requis."); return; }
    if (!form.montant || Number(form.montant) <= 0) { toast.error("Le montant est requis."); return; }
    if (!form.date) { toast.error("La date est requise."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/depenses", {
        method: "POST",
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
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Erreur");
      }
      setShowSuccess(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccess(false);
    router.push("/depensesEtablissement");
    router.refresh();
  };

  return (
    <>
      <div className="max-w-7xl mx-auto">

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-[#11355b] text-sm font-medium mb-4 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
          Retour
        </button>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#11355b]">Nouvelle dépense</h1>
          <p className="text-gray-500 text-sm mt-2">Enregistrez une nouvelle dépense dans le système</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Formulaire */}
          <div className="md:col-span-2 space-y-6">

            {/* Identification */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#11355b] rounded-lg flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-white" />
                </div>
                <h2 className="text-base md:text-lg font-bold text-[#11355b] uppercase tracking-wide">
                  Identification
                </h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Intitulé de la dépense</label>
                  <input
                    type="text"
                    name="intitule"
                    value={form.intitule}
                    onChange={handleChange}
                    placeholder="Entrez le libellé complet…"
                    className={inputClass}
                  />
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

            {/* Fournisseur */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#11355b] rounded-lg flex items-center justify-center shrink-0">
                  <Landmark size={20} className="text-white" />
                </div>
                <h2 className="text-base md:text-lg font-bold text-[#11355b] uppercase tracking-wide">
                  Fournisseur
                </h2>
              </div>
              <div>
                <label className={labelClass}>Nom du fournisseur (optionnel)</label>
                <input
                  type="text"
                  name="fournisseur"
                  value={form.fournisseur}
                  onChange={handleChange}
                  placeholder="Nom ou entité…"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Montant & Validation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                  <Wallet size={20} className="text-white" />
                </div>
                <h2 className="text-base md:text-lg font-bold text-[#11355b] uppercase tracking-wide">
                  Montant & Validation
                </h2>
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
                      placeholder="0"
                      min={0}
                      className={`${inputClass} pr-16`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">FCFA</span>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Description (optionnelle)</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Description détaillée…"
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Pièce justificative (optionnelle)</label>
                  <div className="border-2 border-dashed border-gray-200 bg-blue-50/40 rounded-xl p-8 text-center hover:border-[#11355b] hover:bg-blue-50/70 transition-all cursor-pointer">
                    <UploadCloud size={32} className="text-[#11355b] mx-auto mb-2" />
                    <p className="text-sm font-semibold text-[#11355b]">Cliquez pour téléverser</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max. 10MB)</p>
                    <input type="file" className="hidden" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="md:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-4">
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                <h3 className="text-xs font-bold text-[#11355b] uppercase tracking-wider mb-5 pb-3 border-b border-gray-100">
                  Récapitulatif
                </h3>
                <div className="space-y-4">
                  <RecapItem label="Intitulé" value={form.intitule} />
                  <RecapItem label="Catégorie" value={CATEGORIES.find((c) => c.value === form.categorie)?.label ?? ""} />
                  <RecapItem label="Paiement" value={PAIEMENTS.find((p) => p.value === form.paiement)?.label ?? ""} />
                  <RecapItem
                    label="Montant"
                    value={form.montant ? `${Number(form.montant).toLocaleString("fr-FR")} FCFA` : "—"}
                  />
                </div>
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <p className="text-xs italic text-blue-600 bg-blue-50 p-3 rounded-lg">
                    Vérifiez l&apos;exactitude des données avant la soumission.
                  </p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors shadow-md cursor-pointer"
              >
                {loading ? "Envoi…" : "Soumettre pour validation"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modale succès */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-scaleIn">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={44} className="text-emerald-500" strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold text-[#11355b] mb-3">Dépense soumise avec succès</h3>
            <p className="text-sm text-gray-500 mb-6">La dépense a été enregistrée et soumise pour validation.</p>
            <button
              onClick={handleCloseModal}
              className="w-full bg-[#11355b] hover:bg-[#1a4a7a] text-white py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.25s ease-out; }
      `}</style>
    </>
  );
}

function RecapItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-semibold text-[#11355b] truncate">{value || "—"}</p>
    </div>
  );
}

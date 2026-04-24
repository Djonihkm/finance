"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, FileText, Landmark, Wallet, UploadCloud, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/lib/store';

const NouvelleDepensePage = () => {
  const router = useRouter();
  const addDepense = useStore((s) => s.addDepense);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    intitule: '',
    categorie: '',
    reference: '',
    date: '',
    nomBanque: '',
    numeroCompte: '',
    modePaiement: 'Virement bancaire',
    numeroCheque: '',
    montant: '',
    beneficiaire: '',
    motif: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.intitule.trim()) { toast.error('L\'intitulé est requis.'); return; }
    if (!formData.montant) { toast.error('Le montant est requis.'); return; }
    addDepense({
      date: formData.date || new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
      intitule: formData.intitule,
      montant: Number(formData.montant).toLocaleString('fr-FR', { minimumFractionDigits: 2 }),
      paiement: formData.modePaiement,
      reference: formData.reference || `CS-${Date.now()}`,
      categorie: formData.categorie || 'Autres',
      fournisseur: formData.beneficiaire,
    });
    setShowSuccess(true);
  };

  const handleCloseModal = () => {
    setShowSuccess(false);
    router.push('/depensesEtablissement');
  };

  const inputClass =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-all";

  const labelClass =
    "block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2";

  return (
    
      <div className="max-w-7xl mx-auto">

        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-[#11355b] text-sm font-medium mb-4 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
          Retour
        </button>

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#11355b]">
            Caisse — Nouvelle dépense
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Enregistrez une nouvelle dépense dans le système de gestion financière
          </p>
        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Colonne formulaire */}
          <div className="md:col-span-2 space-y-6">

            {/* Section : Identification */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#11355b] rounded-lg flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-white" />
                </div>
                <h2 className="text-base md:text-lg font-bold text-[#11355b] uppercase tracking-wide">
                  Identification de la dépense
                </h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Intitulé de la dépense</label>
                  <input
                    type="text"
                    name="intitule"
                    value={formData.intitule}
                    onChange={handleChange}
                    placeholder="Entrez le libellé complet..."
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Catégorie</label>
                    <select
                      name="categorie"
                      value={formData.categorie}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      <option value="fournitures">Fournitures</option>
                      <option value="materiel">Matériel</option>
                      <option value="services">Services</option>
                      <option value="salaires">Salaires</option>
                      <option value="autres">Autres</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Numéro de référence</label>
                    <input
                      type="text"
                      name="reference"
                      value={formData.reference}
                      onChange={handleChange}
                      placeholder="REF-0000"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section : Informations bancaires */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#11355b] rounded-lg flex items-center justify-center shrink-0">
                  <Landmark size={20} className="text-white" />
                </div>
                <h2 className="text-base md:text-lg font-bold text-[#11355b] uppercase tracking-wide">
                  Informations bancaires
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Nom de la banque</label>
                  <input
                    type="text"
                    name="nomBanque"
                    value={formData.nomBanque}
                    onChange={handleChange}
                    placeholder="Entrez le nom de l'institution..."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Numéro de compte</label>
                  <input
                    type="text"
                    name="numeroCompte"
                    value={formData.numeroCompte}
                    onChange={handleChange}
                    placeholder="FR76 0000 0000 0000..."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Mode de paiement</label>
                  <select
                    name="modePaiement"
                    value={formData.modePaiement}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Virement bancaire">Virement bancaire</option>
                    <option value="Chèque">Chèque</option>
                    <option value="Espèces">Espèces</option>
                    <option value="Carte bancaire">Carte bancaire</option>
                    <option value="Mobile Money">Mobile Money</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Numéro de chèque / reçu</label>
                  <input
                    type="text"
                    name="numeroCheque"
                    value={formData.numeroCheque}
                    onChange={handleChange}
                    placeholder="N° 827364"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Section : Montant & Validation */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Montant</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="montant"
                        value={formData.montant}
                        onChange={handleChange}
                        placeholder="0"
                        className={`${inputClass} pr-16`}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                        FCFA
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Bénéficiaire</label>
                    <input
                      type="text"
                      name="beneficiaire"
                      value={formData.beneficiaire}
                      onChange={handleChange}
                      placeholder="Nom ou entité..."
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Motif de la dépense</label>
                  <textarea
                    name="motif"
                    value={formData.motif}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Description détaillée..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Pièce justificative</label>
                  <div className="border-2 border-dashed border-gray-200 bg-blue-50/40 rounded-xl p-8 text-center hover:border-[#11355b] hover:bg-blue-50/70 transition-all cursor-pointer">
                    <UploadCloud size={32} className="text-[#11355b] mx-auto mb-2" />
                    <p className="text-sm font-semibold text-[#11355b]">
                      Cliquez pour téléverser ou glissez un fichier
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PDF, JPG, PNG (Max. 10MB)
                    </p>
                    <input type="file" className="hidden" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne récapitulatif */}
          <div className="md:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-4">

              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                <h3 className="text-xs font-bold text-[#11355b] uppercase tracking-wider mb-5 pb-3 border-b border-gray-100">
                  Récapitulatif
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Intitulé</p>
                    <p className="text-sm font-semibold text-[#11355b] truncate">
                      {formData.intitule || '—'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Catégorie</p>
                    <p className="text-sm font-semibold text-[#11355b] capitalize">
                      {formData.categorie || '—'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Numéro de référence</p>
                    <p className="text-sm font-semibold text-[#11355b]">
                      {formData.reference || '—'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Montant</p>
                    <p className="text-lg font-bold text-[#11355b]">
                      {formData.montant ? `${Number(formData.montant).toLocaleString('fr-FR')} FCFA` : '—'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t border-gray-100">
                  <p className="text-xs italic text-blue-600 bg-blue-50 p-3 rounded-lg">
                    &quot;Veuillez vérifier l&apos;exactitude des données financières avant la soumission finale.&quot;
                  </p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-colors shadow-md cursor-pointer"
              >
                Soumettre pour validation
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODALE DE SUCCÈS */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-scaleIn">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={44} className="text-emerald-500" strokeWidth={2.5} />
            </div>

            <h3 className="text-xl font-bold text-[#11355b] mb-3">
              Dépense soumise avec succès
            </h3>

            <p className="text-sm text-gray-500 mb-6">
              La nouvelle dépense a été soumise avec succès
            </p>

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
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.25s ease-out; }
      `}</style>
    
  );
};

export default NouvelleDepensePage;
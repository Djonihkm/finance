"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";

interface LigneCommande {
  designation: string;
  quantite: number;
  prixUnitaire: number;
}

interface Etablissement {
  adresse: string | null;
  ville: string | null;
  region: string | null;
}

interface Props {
  etablissement: Etablissement | null;
}

export default function NouveauBonForm({ etablissement }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdRef, setCreatedRef] = useState("");

  const [bonData, setBonData] = useState({
    intitule: "",
    fournisseurNom: "",
    fournisseurAdresse: "",
    fournisseurEmail: "",
    dateEmission: new Date().toISOString().slice(0, 10),
    faitA: "",
  });

  const [lignes, setLignes] = useState<LigneCommande[]>([
    { designation: "", quantite: 1, prixUnitaire: 0 },
  ]);

  const handleBonChange = (field: string, value: string) =>
    setBonData((prev) => ({ ...prev, [field]: value }));

  const handleLigneChange = (index: number, field: keyof LigneCommande, value: string | number) => {
    const updated = [...lignes];
    updated[index] = { ...updated[index], [field]: field === "designation" ? value : Number(value) };
    setLignes(updated);
  };

  const ajouterLigne = () => setLignes([...lignes, { designation: "", quantite: 1, prixUnitaire: 0 }]);
  const supprimerLigne = (i: number) => setLignes(lignes.filter((_, idx) => idx !== i));

  const sousTotal = lignes.reduce((acc, l) => acc + l.quantite * l.prixUnitaire, 0);

  const qrContent = [
    bonData.intitule || "Bon de commande",
    bonData.fournisseurNom || "Fournisseur inconnu",
    `Montant: ${sousTotal.toLocaleString("fr-FR")} FCFA`,
    `Date: ${bonData.dateEmission}`,
  ].join(" | ");

  const handleSubmit = async () => {
    if (!bonData.intitule.trim()) { toast.error("L'intitulé est requis."); return; }
    if (lignes.some((l) => !l.designation.trim())) { toast.error("Toutes les désignations sont requises."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/bons-commande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intitule: bonData.intitule,
          fournisseur: bonData.fournisseurNom || undefined,
          date: bonData.dateEmission,
          lignes: lignes.map((l) => ({
            designation: l.designation,
            quantite: l.quantite,
            prixUnitaire: l.prixUnitaire,
          })),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Erreur");
      }
      const data = await res.json();
      setCreatedRef(data.reference ?? "");
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Document */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-10">

              {/* En-tête */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10 pb-6 border-b border-gray-100">
                <div className="w-20 h-20 relative shrink-0">
                  <Image src="/fav.png" alt="Logo" fill className="object-contain" priority />
                </div>
                <div className="text-center flex-1">
                  <h1 className="text-xl md:text-2xl font-bold text-[#11355b]">BON DE COMMANDE</h1>
                  <p className="text-[11px] text-gray-400 uppercase tracking-widest mt-1">
                    Document de procurement autorisé
                  </p>
                </div>
                <div className="text-xs text-gray-600 text-right leading-relaxed">
                  {etablissement?.adresse && <p>{etablissement.adresse}</p>}
                  {etablissement?.region && <p>{etablissement.region}</p>}
                  {etablissement?.ville && <p>{etablissement.ville}, République du Bénin</p>}
                </div>
              </div>

              {/* Intitulé + Infos commande */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="relative border-l-4 border-[#11355b] pl-4 rounded-r-lg py-2 pr-2 hover:bg-blue-50/40 hover:border-blue-400 transition-all duration-150 cursor-text group">
                    <span className="absolute top-2 right-2 text-[9px] font-bold text-blue-400 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-150">✎ Modifier</span>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 group-hover:text-blue-500 transition-colors">
                      Intitulé du bon
                    </p>
                    <input
                      type="text"
                      value={bonData.intitule}
                      onChange={(e) => handleBonChange("intitule", e.target.value)}
                      placeholder="Objet de la commande"
                      className="text-base font-bold text-[#11355b] bg-transparent w-full focus:outline-none rounded px-1 -ml-1"
                    />
                  </div>
                  <div className="relative border-l-4 border-[#11355b] pl-4 rounded-r-lg py-2 pr-2 hover:bg-blue-50/40 hover:border-blue-400 transition-all duration-150 cursor-text group">
                    <span className="absolute top-2 right-2 text-[9px] font-bold text-blue-400 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-150">✎ Modifier</span>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 group-hover:text-blue-500 transition-colors">
                      Date d&apos;émission
                    </p>
                    <input
                      type="date"
                      value={bonData.dateEmission}
                      onChange={(e) => handleBonChange("dateEmission", e.target.value)}
                      className="text-base font-semibold text-[#11355b] bg-transparent w-full focus:outline-none rounded px-1 -ml-1"
                    />
                  </div>
                </div>

                <div className="relative bg-gray-50 rounded-lg p-5 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all duration-150 cursor-text group">
                  <span className="absolute top-3 right-3 text-[9px] font-bold text-blue-400 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-150">✎ Modifier</span>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 group-hover:text-blue-500 transition-colors">
                    Coordonnées du fournisseur
                  </p>
                  <input
                    type="text"
                    value={bonData.fournisseurNom}
                    onChange={(e) => handleBonChange("fournisseurNom", e.target.value)}
                    placeholder="Nom du fournisseur"
                    className="text-base font-bold text-[#11355b] bg-transparent w-full focus:outline-none focus:bg-white rounded px-1 -ml-1 mb-2"
                  />
                  <input
                    type="text"
                    value={bonData.fournisseurAdresse}
                    onChange={(e) => handleBonChange("fournisseurAdresse", e.target.value)}
                    placeholder="Adresse"
                    className="text-xs text-gray-600 bg-transparent w-full focus:outline-none focus:bg-white rounded px-1 -ml-1 mb-1"
                  />
                  <input
                    type="email"
                    value={bonData.fournisseurEmail}
                    onChange={(e) => handleBonChange("fournisseurEmail", e.target.value)}
                    placeholder="Email"
                    className="text-xs text-gray-600 bg-transparent w-full focus:outline-none focus:bg-white rounded px-1 -ml-1"
                  />
                </div>
              </div>

              {/* Tableau lignes */}
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
                      <tr key={i} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-100 cursor-text">
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
                            <button onClick={() => supprimerLigne(i)} className="text-red-400 hover:text-red-600 cursor-pointer transition-colors">
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
                onClick={ajouterLigne}
                className="flex items-center gap-2 text-sm font-semibold text-[#11355b] hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors mb-8 cursor-pointer"
              >
                <Plus size={16} />
                Ajouter une ligne
              </button>

              {/* Totaux + signature */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                <div className="bg-gray-50 rounded-lg p-5 space-y-3">
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-base font-bold text-[#11355b] uppercase tracking-wide">Total TTC</span>
                    <span className="text-xl font-bold text-[#11355b]">
                      {sousTotal.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Signature du comptable
                    </p>
                    <div className="h-20 border border-gray-300 rounded-lg bg-white" />
                    <div className="mt-3 relative hover:bg-blue-50/40 hover:border-blue-200 border border-transparent rounded-lg px-2 py-1 transition-all duration-150 cursor-text group">
                      <span className="absolute top-1 right-1 text-[9px] font-bold text-blue-400 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-150">✎ Modifier</span>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 group-hover:text-blue-500 transition-colors">Fait à</p>
                      <input
                        type="text"
                        value={bonData.faitA}
                        onChange={(e) => handleBonChange("faitA", e.target.value)}
                        placeholder="Cotonou"
                        className="w-full text-sm text-gray-700 border-b border-gray-300 bg-transparent focus:outline-none focus:border-[#11355b] py-1"
                      />
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-center">
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-2 invisible select-none">QR</p>
                    <QRCodeSVG
                      value={qrContent}
                      size={80}
                      bgColor="#ffffff"
                      fgColor="#11355b"
                      level="M"
                      className="rounded border border-gray-200"
                    />
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-1">Vérification</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs italic text-blue-600 text-center">
                  Cliquez sur un bloc pour le modifier.
                </p>
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
            <h3 className="text-xl font-bold text-[#11355b] mb-3">Bon de commande soumis</h3>
            <p className="text-sm text-gray-500 mb-6">
              Le bon{createdRef ? <> <span className="font-bold text-[#11355b]">{createdRef}</span></> : ""} a été soumis avec succès.
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
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.25s ease-out; }
      `}</style>
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import Image from "next/image";

interface LigneCommande {
  designation: string;
  quantite: number;
  prixUnitaire: number;
}

const NouveauBonPage = () => {
  const router = useRouter();
  const addBon = useStore((s) => s.addBon);
  const [showSuccess, setShowSuccess] = useState(false);

  const [bonData, setBonData] = useState({
    numero: "PO-2024-00972",
    dateEmission: "2024-10-24",
    dateExpedition: "2024-12-24",
    fournisseurNom: "Jean-Baptiste Architecture",
    fournisseurAdresse: "15 Avenue Montaigne, 75008 Paris",
    fournisseurEmail: "jb@architecture-design.com",
    tva: 20,
    promo: 150,
    faitA: "",
    laDate: "",
    signature: "",
  });

  const [lignes, setLignes] = useState<LigneCommande[]>([
    {
      designation: "Poutres en chêne massif (H=2.40m)",
      quantite: 12,
      prixUnitaire: 450,
    },
  ]);

  const handleBonChange = (field: string, value: string | number) => {
    setBonData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLigneChange = (
    index: number,
    field: keyof LigneCommande,
    value: string | number,
  ) => {
    const newLignes = [...lignes];
    newLignes[index] = {
      ...newLignes[index],
      [field]: field === "designation" ? value : Number(value),
    };
    setLignes(newLignes);
  };

  const ajouterLigne = () => {
    setLignes([...lignes, { designation: "", quantite: 1, prixUnitaire: 0 }]);
  };

  const supprimerLigne = (index: number) => {
    setLignes(lignes.filter((_, i) => i !== index));
  };

  const sousTotal = lignes.reduce(
    (acc, l) => acc + l.quantite * l.prixUnitaire,
    0,
  );
  const tvaMontant = (sousTotal * bonData.tva) / 100;
  const totalTTC = sousTotal + tvaMontant - bonData.promo;

  const handleSubmit = () => {
    if (!bonData.fournisseurNom.trim()) { toast.error('Le nom du fournisseur est requis.'); return; }
    addBon({
      date: bonData.dateEmission || new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
      intitule: `Commande ${bonData.fournisseurNom}`,
      montant: totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 }),
      paiement: 'Virement',
      reference: bonData.numero,
      categorie: 'Commande',
      fournisseur: bonData.fournisseurNom,
    });
    setShowSuccess(true);
  };

  const handleCloseModal = () => {
    setShowSuccess(false);
    router.push("/depensesEtablissement");
  };

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

        {/* Layout principal */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Document Bon de Commande */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-10">
              {/* En-tête du document */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 relative shrink-0">
                    <Image
                      src="/fav.png"
                      alt="Logo"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>

                <div className="text-center flex-1">
                  <h1 className="text-1xl md:text-2xl font-bold text-[#11355b] ">
                    BON DE COMMANDE
                  </h1>
                  <p className="text-[11px] text-gray-400 uppercase tracking-widest mt-1">
                    Document de procurement autorisé
                  </p>
                </div>

                <div className="text-xs text-gray-600 text-right leading-relaxed">
                  <p>Cité Ministérielle</p>
                  <p>Quartier Cadjèhoun – Ahouanléko</p>
                  <p>
                    12<sup>e</sup> arrondissement, Commune de Cotonou
                  </p>
                  <p>République du Bénin</p>
                </div>
              </div>

              {/* Infos commande + fournisseur */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="border-l-4 border-[#11355b] pl-4">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      N° de commande
                    </p>
                    <input
                      type="text"
                      value={bonData.numero}
                      onChange={(e) =>
                        handleBonChange("numero", e.target.value)
                      }
                      className="text-lg font-bold text-[#11355b] bg-transparent w-full focus:outline-none focus:bg-blue-50/50 rounded px-1 -ml-1"
                    />
                  </div>

                  <div className="border-l-4 border-[#11355b] pl-4">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Date d&apos;émission
                    </p>
                    <input
                      type="date"
                      value={bonData.dateEmission}
                      onChange={(e) =>
                        handleBonChange("dateEmission", e.target.value)
                      }
                      className="text-base font-semibold text-[#11355b] bg-transparent w-full focus:outline-none focus:bg-blue-50/50 rounded px-1 -ml-1"
                    />
                  </div>

                  <div className="border-l-4 border-[#11355b] pl-4">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Date d&apos;expédition
                    </p>
                    <input
                      type="date"
                      value={bonData.dateExpedition}
                      onChange={(e) =>
                        handleBonChange("dateExpedition", e.target.value)
                      }
                      className="text-base font-semibold text-[#11355b] bg-transparent w-full focus:outline-none focus:bg-blue-50/50 rounded px-1 -ml-1"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Coordonnées du fournisseur
                  </p>
                  <input
                    type="text"
                    value={bonData.fournisseurNom}
                    onChange={(e) =>
                      handleBonChange("fournisseurNom", e.target.value)
                    }
                    placeholder="Nom du fournisseur"
                    className="text-base font-bold text-[#11355b] bg-transparent w-full focus:outline-none focus:bg-white rounded px-1 -ml-1 mb-2"
                  />
                  <input
                    type="text"
                    value={bonData.fournisseurAdresse}
                    onChange={(e) =>
                      handleBonChange("fournisseurAdresse", e.target.value)
                    }
                    placeholder="Adresse"
                    className="text-xs text-gray-600 bg-transparent w-full focus:outline-none focus:bg-white rounded px-1 -ml-1 mb-1"
                  />
                  <input
                    type="email"
                    value={bonData.fournisseurEmail}
                    onChange={(e) =>
                      handleBonChange("fournisseurEmail", e.target.value)
                    }
                    placeholder="Email"
                    className="text-xs text-gray-600 bg-transparent w-full focus:outline-none focus:bg-white rounded px-1 -ml-1"
                  />
                </div>
              </div>

              {/* Tableau des articles */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#11355b] text-white">
                      <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">
                        Désignation
                      </th>
                      <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider w-24">
                        Quantité
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider w-32">
                        Prix unitaire
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider w-32">
                        Total
                      </th>
                      <th className="px-2 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lignes.map((ligne, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50/50"
                      >
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={ligne.designation}
                            onChange={(e) =>
                              handleLigneChange(
                                index,
                                "designation",
                                e.target.value,
                              )
                            }
                            placeholder="Description de l'article"
                            className="w-full text-sm text-gray-700 bg-transparent focus:outline-none focus:bg-blue-50/40 rounded px-2 py-1"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            value={ligne.quantite}
                            onChange={(e) =>
                              handleLigneChange(
                                index,
                                "quantite",
                                e.target.value,
                              )
                            }
                            className="w-full text-sm text-gray-700 text-center bg-transparent focus:outline-none focus:bg-blue-50/40 rounded px-2 py-1"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            type="number"
                            value={ligne.prixUnitaire}
                            onChange={(e) =>
                              handleLigneChange(
                                index,
                                "prixUnitaire",
                                e.target.value,
                              )
                            }
                            className="w-full text-sm text-gray-700 text-right bg-transparent focus:outline-none focus:bg-blue-50/40 rounded px-2 py-1"
                          />
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-[#11355b]">
                          {(ligne.quantite * ligne.prixUnitaire).toLocaleString(
                            "fr-FR",
                            { minimumFractionDigits: 2 },
                          )}
                        </td>
                        <td className="px-2 py-3 text-center">
                          {lignes.length > 1 && (
                            <button
                              onClick={() => supprimerLigne(index)}
                              className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                            >
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

              {/* Récap totaux + signature */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                {/* Totaux */}
                <div className="bg-gray-50 rounded-lg p-5 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 uppercase text-xs font-bold tracking-wider">
                      Sous-total
                    </span>
                    <span className="font-semibold text-[#11355b]">
                      {sousTotal.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 uppercase text-xs font-bold tracking-wider">
                      TVA ({bonData.tva}%)
                    </span>
                    <span className="font-semibold text-[#11355b]">
                      {tvaMontant.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-orange-500 uppercase text-xs font-bold tracking-wider">
                      Promo / Remise
                    </span>
                    <span className="font-semibold text-orange-500">
                      -{" "}
                      {bonData.promo.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-base font-bold text-[#11355b] uppercase tracking-wide">
                      Total TTC
                    </span>
                    <span className="text-xl font-bold text-[#11355b]">
                      {totalTTC.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                {/* Signature */}
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Signature du comptable
                  </p>
                  <textarea
                    value={bonData.signature}
                    onChange={(e) =>
                      handleBonChange("signature", e.target.value)
                    }
                    placeholder="Bon pour accord"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 italic focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-all resize-none mb-4"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Fait à
                      </p>
                      <input
                        type="text"
                        value={bonData.faitA}
                        onChange={(e) =>
                          handleBonChange("faitA", e.target.value)
                        }
                        placeholder="Cotonou"
                        className="w-full text-sm text-gray-700 border-b border-gray-300 bg-transparent focus:outline-none focus:border-[#11355b] py-1"
                      />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        La date
                      </p>
                      <input
                        type="date"
                        value={bonData.laDate}
                        onChange={(e) =>
                          handleBonChange("laDate", e.target.value)
                        }
                        className="w-full text-sm text-gray-700 border-b border-gray-300 bg-transparent focus:outline-none focus:border-[#11355b] py-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar action */}
          <div className="md:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs italic text-blue-600 text-center">
                  &quot;Cliquez sur un bloc pour le modifier.&quot;
                </p>
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
              <CheckCircle2
                size={44}
                className="text-emerald-500"
                strokeWidth={2.5}
              />
            </div>

            <h3 className="text-xl font-bold text-[#11355b] mb-3">
              Bon de commande soumis avec succès
            </h3>

            <p className="text-sm text-gray-500 mb-6">
              Le bon de commande{" "}
              <span className="font-bold text-[#11355b]">{bonData.numero}</span>{" "}
              a été soumis avec succès.
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
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.25s ease-out;
        }
      `}</style>
    
  );
};

export default NouveauBonPage;

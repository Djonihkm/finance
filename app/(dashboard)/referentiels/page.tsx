import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Database } from "lucide-react";

const SECTIONS = [
  {
    titre: "Catégories de dépenses",
    description: "Utilisées lors de la saisie d'une dépense ou d'un bon de commande.",
    items: [
      { code: "FOURNITURE", label: "Fourniture", desc: "Consommables et matières" },
      { code: "MOBILIER",   label: "Mobilier",   desc: "Tables, chaises, armoires…" },
      { code: "PERSONNEL",  label: "Personnel",  desc: "Salaires, primes, charges sociales" },
      { code: "PEDAGOGIE",  label: "Pédagogie",  desc: "Manuels, activités, formation" },
      { code: "EQUIPEMENT", label: "Équipement", desc: "Matériel technique et informatique" },
      { code: "TRAVAUX",    label: "Travaux",    desc: "Réparations et aménagements" },
      { code: "AUTRE",      label: "Autre",      desc: "Dépenses non classifiées" },
    ],
  },
  {
    titre: "Types de marché",
    description: "Catégorie d'un marché ou d'un fournisseur.",
    items: [
      { code: "FOURNITURES", label: "Fournitures", desc: "Achat de biens et matières" },
      { code: "SERVICES",    label: "Services",    desc: "Prestations intellectuelles et techniques" },
      { code: "TRAVAUX",     label: "Travaux",     desc: "Construction, rénovation" },
      { code: "AUTRE",       label: "Autre",       desc: "" },
    ],
  },
  {
    titre: "Modes de paiement",
    description: "Modes de règlement disponibles pour les dépenses.",
    items: [
      { code: "ESPECES",       label: "Espèces",       desc: "Paiement en cash (→ compte 5700 Caisse)" },
      { code: "VIREMENT",      label: "Virement",      desc: "Virement bancaire immédiat (→ 5200 Banque)" },
      { code: "VIREMENT_30J",  label: "Virement 30j",  desc: "Virement à 30 jours" },
      { code: "VIREMENT_60J",  label: "Virement 60j",  desc: "Virement à 60 jours" },
      { code: "CHEQUE",        label: "Chèque",        desc: "Chèque bancaire" },
      { code: "CARTE_BANCAIRE",label: "Carte bancaire",desc: "Paiement par carte" },
      { code: "ACOMPTE",       label: "Acompte",       desc: "Paiement partiel d'avance" },
    ],
  },
  {
    titre: "Types d'établissement",
    description: "Classification des établissements scolaires.",
    items: [
      { code: "LYCEE",         label: "Lycée",         desc: "Enseignement secondaire supérieur" },
      { code: "COLLEGE",       label: "Collège",       desc: "Enseignement secondaire" },
      { code: "CEG",           label: "CEG",           desc: "Collège d'Enseignement Général" },
      { code: "ECOLE_PRIMAIRE",label: "École primaire",desc: "Enseignement primaire" },
      { code: "AUTRE",         label: "Autre",         desc: "" },
    ],
  },
  {
    titre: "Statuts des documents (workflow)",
    description: "États successifs d'un bon de commande ou d'une dépense.",
    items: [
      { code: "ATTENTE",  label: "En attente",   desc: "Créé, en attente de validation" },
      { code: "REVISION", label: "En révision",  desc: "Renvoyé pour correction" },
      { code: "VALIDE",   label: "Validé",       desc: "Approuvé par le directeur" },
      { code: "REJETE",   label: "Rejeté",       desc: "Refusé définitivement" },
      { code: "PAYE",     label: "Payé",         desc: "Règlement effectué (futur)" },
    ],
  },
  {
    titre: "Catégories d'immobilisations",
    description: "Classification des actifs dans le registre des immobilisations.",
    items: [
      { code: "INFORMATIQUE",   label: "Informatique",   desc: "Ordinateurs, serveurs, imprimantes" },
      { code: "MOBILIER",       label: "Mobilier",       desc: "Tables, chaises, armoires" },
      { code: "EQUIPEMENT",     label: "Équipement",     desc: "Matériel technique et scientifique" },
      { code: "VEHICULE",       label: "Véhicule",       desc: "Véhicules de service" },
      { code: "INFRASTRUCTURE", label: "Infrastructure", desc: "Bâtiments, clôtures, réseaux" },
      { code: "AUTRE",          label: "Autre",          desc: "" },
    ],
  },
];

export default async function ReferentielsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#11355b] flex items-center gap-2">
          <Database size={24} /> Référentiels
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Valeurs de référence utilisées dans l'application — lecture seule
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl px-5 py-3 text-sm text-amber-700">
        Ces valeurs sont définies dans le code source de l'application. Pour les modifier, une intervention technique est nécessaire.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {SECTIONS.map((section) => (
          <div key={section.titre} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="font-bold text-[#11355b] text-sm">{section.titre}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{section.description}</p>
            </div>
            <div className="divide-y divide-gray-50">
              {section.items.map((item) => (
                <div key={item.code} className="flex items-start gap-3 px-5 py-2.5">
                  <span className="font-mono text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded mt-0.5 shrink-0">
                    {item.code}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    {item.desc && <p className="text-xs text-gray-400">{item.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

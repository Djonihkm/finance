import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getEtablissementById } from "@/lib/queries";
import Image from "next/image";
import {
  Building2, CheckCircle2, Briefcase, MapPin, Mail, Phone,
} from "lucide-react";
import CopyButton from "./_components/CopyButton";
import { formatTypeEtablissement, formatDate } from "@/lib/utils/formatters";

export default async function MonEtablissementPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.etablissementId) redirect("/etablissements");

  const etab = await getEtablissementById(session.etablissementId);
  if (!etab) redirect("/login");

  const directeur = etab.users.find((u) => u.role === "DIRECTEUR") ?? etab.users[0] ?? null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#11355b]">Mon établissement</h1>
        <p className="text-gray-500 text-sm mt-1">Consultez les informations de votre établissement</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Carte gauche */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 text-center h-full relative overflow-hidden">
            <div className="relative w-full max-w-[260px] aspect-square mx-auto mb-6 rounded-xl overflow-hidden shadow-sm bg-gray-100">
              <Image src="/fav.png" alt={etab.nom} fill priority className="object-contain" />
              <div className="absolute bottom-2 right-2 w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle2 size={18} className="text-white" strokeWidth={3} />
              </div>
            </div>

            <h2 className="text-xl font-bold text-[#11355b] leading-tight px-2">{etab.nom}</h2>

            <div className="flex justify-center gap-2 mt-4 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold uppercase tracking-wide">
                {formatTypeEtablissement(etab.type)}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-wide flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {etab.isActive ? "ACTIF" : "INACTIF"}
              </span>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
              {(etab.region || etab.ville) && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Briefcase size={14} />
                  <span>
                    {etab.region && <span className="font-semibold text-gray-700">{etab.region}</span>}
                    {etab.region && etab.ville && ", "}
                    {etab.ville}
                  </span>
                </div>
              )}
              {etab.adresse && (
                <div className="flex items-start justify-center gap-2 text-sm text-gray-500">
                  <MapPin size={14} className="shrink-0 mt-0.5" />
                  <span className="text-center">{etab.adresse}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Détails droite */}
        <div className="md:col-span-2 space-y-6">

          {/* Informations générales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="mb-6 pb-4 border-b border-gray-50">
              <h3 className="text-xs font-bold text-[#11355b] uppercase tracking-wider flex items-center gap-2">
                <Building2 size={14} />
                Informations générales
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <ReadField label="Nom de l'institution" value={etab.nom} />
              <ReadField label="Type d'institution" value={formatTypeEtablissement(etab.type)} />
              <div>
                <label htmlFor="etab-code" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Identifiant (Code)
                </label>
                <div className="relative">
                  <input id="etab-code" type="text" value={etab.code} readOnly
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono cursor-not-allowed"
                  />
                  <CopyButton value={etab.code} />
                </div>
              </div>
              <ReadField label="Date de création" value={formatDate(etab.createdAt)} />
            </div>
          </div>

          {/* Représentant */}
          {directeur && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="mb-6 pb-4 border-b border-gray-50">
                <h3 className="text-xs font-bold text-[#11355b] uppercase tracking-wider flex items-center gap-2">
                  <Building2 size={14} />
                  Responsable principal
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <ReadField label="Nom du responsable" value={`${directeur.nom} ${directeur.prenom}`} />
                <ReadField label="Fonction / Rôle" value={directeur.poste ?? directeur.role} />
                {directeur.email && (
                  <div>
                    <label htmlFor="resp-email" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Email officiel
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input id="resp-email" type="email" value={directeur.email} readOnly
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-default"
                      />
                    </div>
                  </div>
                )}
                {directeur.telephone && (
                  <div>
                    <label htmlFor="resp-tel" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Téléphone
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input id="resp-tel" type="tel" value={directeur.telephone} readOnly
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-default"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReadField({ label, value }: { label: string; value: string }) {
  const id = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</label>
      <input id={id} type="text" value={value} readOnly
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#11355b] font-medium cursor-default"
      />
    </div>
  );
}

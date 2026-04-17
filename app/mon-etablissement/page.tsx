"use client";

import React from "react";
import Image from "next/image";
import {
  Copy,
  Building2,
  CheckCircle2,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  User,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

const MonEtablissementPage = () => {
  const etablissement = {
    nom: "Lycée Technique de Cotonou",
    departement: "Littoral",
    commune: "Cotonou",
    adresse: "Avenue de la Francophonie, BP 123",
    type: "Technical High School",
    id: "LTC-229-001",
    dateCreation: "1985-09-15",
    representantNom: "Dr. Koffi Mensah",
    role: "Head Accountant",
    email: "k.mensah@ltc.edu.bj",
    telephone: "+229 21 33 00 00",
    statutBadge1: "PUBLIC",
    statutBadge2: "ACTIF",
  };

  return (
    <DashboardLayout>
      <div className="max-w-300 mx-auto space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold text-[#11355b]">Mon établissement</h1>
          <p className="text-gray-500 text-sm mt-1">
            Consultez les informations de votre institution
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carte à gauche */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 text-center h-full relative overflow-hidden">
              {/* Image */}
              <div className="relative w-full max-w-[260px] aspect-square mx-auto mb-6 rounded-xl overflow-hidden shadow-sm bg-gray-100">
                <Image
                  src="/fav.png"
                  alt={etablissement.nom}
                  fill
                  priority
                  className="object-contain" // ✅ évite tout étirement : conserve les proportions
                />

                {/* Badge check vert */}
                <div className="absolute bottom-2 right-2 w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle2 size={18} className="text-white" strokeWidth={3} />
                </div>
              </div>

              <h2 className="text-xl font-bold text-[#11355b] leading-tight px-2">
                {etablissement.nom}
              </h2>

              <div className="flex justify-center gap-2 mt-4 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wide">
                  {etablissement.statutBadge1}
                </span>

                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wide flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {etablissement.statutBadge2}
                </span>
              </div>

              {/* Localisation */}
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Briefcase size={14} />
                  <span>
                    <span className="font-semibold text-gray-700">{etablissement.departement}</span>,{" "}
                    {etablissement.commune}
                  </span>
                </div>

                <div className="flex items-start justify-center gap-2 text-sm text-gray-500">
                  <MapPin size={14} className="shrink-0 mt-0.5" />
                  <span className="text-center">{etablissement.adresse}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Détails à droite */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations générales */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="mb-6 pb-4 border-b border-gray-50">
                <h3 className="text-xs font-bold text-[#11355b] uppercase tracking-wider flex items-center gap-2">
                  <Building2 size={14} />
                  Informations générales
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Nom de l’institution
                  </label>
                  <input
                    type="text"
                    value={etablissement.nom}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#11355b] font-medium cursor-default"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Type d’institution
                  </label>
                  <input
                    type="text"
                    value={etablissement.type}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#11355b] font-medium cursor-default"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Identifiant de l’institution
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={etablissement.id}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono cursor-not-allowed"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#11355b] transition-colors cursor-pointer"
                      aria-label="Copier"
                      onClick={() => navigator.clipboard?.writeText(etablissement.id)}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Date de création
                  </label>
                  <input
                    type="text"
                    value={new Date(etablissement.dateCreation).toLocaleDateString("fr-FR")}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-default"
                  />
                </div>
              </div>
            </div>

            {/* Détails représentant */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="mb-6 pb-4 border-b border-gray-50">
                <h3 className="text-xs font-bold text-[#11355b] uppercase tracking-wider flex items-center gap-2">
                  <User size={14} />
                  Détails du représentant
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Nom du représentant
                  </label>
                  <input
                    type="text"
                    value={etablissement.representantNom}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#11355b] font-medium cursor-default"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Fonction / Rôle
                  </label>
                  <input
                    type="text"
                    value={etablissement.role}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#11355b] font-medium cursor-default"
                  />
                  <p className="text-[10px] text-gray-400 mt-2 italic">
                    Point de contact principal pour l’audit financier.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Email officiel
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={etablissement.email}
                      readOnly
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-default"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Numéro de téléphone
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={etablissement.telephone}
                      readOnly
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-default"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MonEtablissementPage;
"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Key, Camera, Eye, EyeOff, Save, Lock, Info } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '../components/DashboardLayout';
import { useStore } from '@/lib/store';

const ParametresPage = () => {
  const router = useRouter();
  const { profil, updateProfil } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showPasswordCurrent, setShowPasswordCurrent] = useState(false);
  const [showPasswordNew, setShowPasswordNew] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const [formData, setFormData] = useState({
    nom: profil.nom,
    prenom: profil.prenom,
    email: profil.email,
    telephone: profil.telephone,
    role: profil.role,
    etablissement: profil.etablissement,
    motDePasseActuel: '',
    nouveauMotDePasse: '',
    confirmationMotDePasse: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateProfil({
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      telephone: formData.telephone,
      role: formData.role,
    });
    toast.success('Profil mis à jour avec succès.');
  };

  const handleCancel = () => {
    router.back();
  };

  const inputClass =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-all";

  const inputDisabledClass =
    "w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed";

  const labelClass =
    "block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2";

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold text-[#11355b]">Paramètres du compte</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gérez vos informations personnelles et sécurisez votre compte.
          </p>
        </div>

        {/* Section haut : Carte profil + Infos personnelles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Carte profil */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center h-full">

              {/* Avatar avec upload */}
              <div className="relative w-32 h-32 mx-auto mb-4 group">
                <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-md">
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-white text-center">
                      <User size={48} className="mx-auto mb-1" />
                      <p className="text-[9px] font-bold tracking-wider">SAFE PROFIL</p>
                    </div>
                  )}
                </div>

                {/* Bouton upload caméra */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-9 h-9 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center shadow-md transition-colors cursor-pointer border-2 border-white"
                >
                  <Camera size={16} className="text-white" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Nom + Rôle */}
              <h2 className="text-xl font-bold text-[#11355b]">
                {formData.prenom} {formData.nom}
              </h2>
              <p className="text-orange-500 font-semibold text-sm mt-1">
                {formData.role.split(' ')[0]}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                {formData.etablissement}
              </p>

              {/* Badges */}
              <div className="flex justify-center gap-2 mt-5">
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                  Actif
                </span>
                <span className="bg-blue-100 text-[#11355b] px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                  Admin
                </span>
              </div>
            </div>
          </div>

          {/* Informations personnelles */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 h-full">

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <User size={20} className="text-[#11355b]" />
                </div>
                <h2 className="text-lg font-bold text-[#11355b]">
                  Informations personnelles
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Nom</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Prénoms</label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Téléphone</label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Rôle / Profession</label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Établissement <span className="text-gray-400 normal-case">(lecture seule)</span>
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.etablissement}
                      disabled
                      className={`${inputDisabledClass} pl-10`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Changer le mot de passe */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
              <Key size={20} className="text-orange-500" />
            </div>
            <h2 className="text-lg font-bold text-[#11355b]">
              Changer le mot de passe
            </h2>
          </div>

          <div className="space-y-5">

            {/* Mot de passe actuel - pleine largeur */}
            <div>
              <label className={labelClass}>Mot de passe actuel</label>
              <div className="relative">
                <input
                  type={showPasswordCurrent ? 'text' : 'password'}
                  name="motDePasseActuel"
                  value={formData.motDePasseActuel}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordCurrent(!showPasswordCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#11355b] transition-colors cursor-pointer"
                >
                  {showPasswordCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Nouveau + Confirmation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPasswordNew ? 'text' : 'password'}
                    name="nouveauMotDePasse"
                    value={formData.nouveauMotDePasse}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordNew(!showPasswordNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#11355b] transition-colors cursor-pointer"
                  >
                    {showPasswordNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className={labelClass}>Confirmer le nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPasswordConfirm ? 'text' : 'password'}
                    name="confirmationMotDePasse"
                    value={formData.confirmationMotDePasse}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#11355b] transition-colors cursor-pointer"
                  >
                    {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Note de sécurité */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
              <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 leading-relaxed">
                Votre mot de passe doit contenir au moins 12 caractères, incluant des lettres majuscules, des chiffres et des caractères spéciaux pour une sécurité maximale.
              </p>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pb-8">
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-[#11355b] font-semibold text-sm transition-colors cursor-pointer px-6 py-3"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-bold text-sm transition-colors shadow-md cursor-pointer"
          >
            <Save size={18} />
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ParametresPage;
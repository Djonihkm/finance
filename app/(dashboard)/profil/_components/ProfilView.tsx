"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Key, Camera, Eye, EyeOff, Save, Lock, Info } from "lucide-react";
import { toast } from "sonner";
import type { UserDetail } from "@/lib/queries";
import { formatRole } from "@/lib/utils/formatters";

interface Props {
  user: UserDetail;
  userId: string;
}

export default function ProfilView({ user, userId }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showPasswordCurrent, setShowPasswordCurrent] = useState(false);
  const [showPasswordNew, setShowPasswordNew] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  const [formData, setFormData] = useState({
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    telephone: user.telephone ?? "",
    poste: user.poste ?? "",
  });

  const [passwords, setPasswords] = useState({
    motDePasseActuel: "",
    nouveauMotDePasse: "",
    confirmationMotDePasse: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePwdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/utilisateurs/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: formData.nom,
          prenom: formData.prenom,
          telephone: formData.telephone,
          poste: formData.poste,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Erreur");
      }
      toast.success("Profil mis à jour avec succès.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwords.motDePasseActuel) { toast.error("Le mot de passe actuel est requis."); return; }
    if (!passwords.nouveauMotDePasse) { toast.error("Le nouveau mot de passe est requis."); return; }
    if (passwords.nouveauMotDePasse !== passwords.confirmationMotDePasse) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    if (passwords.nouveauMotDePasse.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setChangingPwd(true);
    try {
      const res = await fetch(`/api/utilisateurs/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.motDePasseActuel,
          newPassword: passwords.nouveauMotDePasse,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Erreur");
      }
      toast.success("Mot de passe modifié avec succès.");
      setPasswords({ motDePasseActuel: "", nouveauMotDePasse: "", confirmationMotDePasse: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setChangingPwd(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#11355b]/20 focus:border-[#11355b] transition-all";
  const inputDisabledClass =
    "w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed";
  const labelClass =
    "block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2";

  return (
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
            <div className="relative w-32 h-32 mx-auto mb-4 group">
              <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-md">
                {profileImage ? (
                  <Image src={profileImage} alt="Profile" width={128} height={128} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-white text-center">
                    <User size={48} className="mx-auto mb-1" />
                    <p className="text-[9px] font-bold tracking-wider">PROFIL</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-9 h-9 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center shadow-md transition-colors cursor-pointer border-2 border-white"
              >
                <Camera size={16} className="text-white" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>

            <h2 className="text-xl font-bold text-[#11355b]">{formData.prenom} {formData.nom}</h2>
            <p className="text-orange-500 font-semibold text-sm mt-1">{formatRole(user.role)}</p>
            {user.etablissement && (
              <p className="text-gray-500 text-xs mt-1">{user.etablissement.nom}</p>
            )}
            <div className="flex justify-center gap-2 mt-5">
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                {user.isActive ? "Actif" : "Inactif"}
              </span>
              <span className="bg-blue-100 text-[#11355b] px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                {formatRole(user.role)}
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
              <h2 className="text-lg font-bold text-[#11355b]">Informations personnelles</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Nom</label>
                <input type="text" name="nom" value={formData.nom} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Prénoms</label>
                <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email <span className="text-gray-400 normal-case">(lecture seule)</span></label>
                <div className="relative">
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={formData.email} disabled className={`${inputDisabledClass} pl-10`} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Téléphone</label>
                <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Poste / Profession</label>
                <input type="text" name="poste" value={formData.poste} onChange={handleChange} className={inputClass} />
              </div>
              {user.etablissement && (
                <div>
                  <label className={labelClass}>Établissement <span className="text-gray-400 normal-case">(lecture seule)</span></label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={user.etablissement.nom} disabled className={`${inputDisabledClass} pl-10`} />
                  </div>
                </div>
              )}
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
          <h2 className="text-lg font-bold text-[#11355b]">Changer le mot de passe</h2>
        </div>
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Mot de passe actuel</label>
            <div className="relative">
              <input type={showPasswordCurrent ? "text" : "password"} name="motDePasseActuel" value={passwords.motDePasseActuel} onChange={handlePwdChange} placeholder="••••••••••••" className={`${inputClass} pr-12`} />
              <button type="button" onClick={() => setShowPasswordCurrent(!showPasswordCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#11355b] transition-colors cursor-pointer">
                {showPasswordCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Nouveau mot de passe</label>
              <div className="relative">
                <input type={showPasswordNew ? "text" : "password"} name="nouveauMotDePasse" value={passwords.nouveauMotDePasse} onChange={handlePwdChange} placeholder="••••••••••••" className={`${inputClass} pr-12`} />
                <button type="button" onClick={() => setShowPasswordNew(!showPasswordNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#11355b] transition-colors cursor-pointer">
                  {showPasswordNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Confirmer le nouveau mot de passe</label>
              <div className="relative">
                <input type={showPasswordConfirm ? "text" : "password"} name="confirmationMotDePasse" value={passwords.confirmationMotDePasse} onChange={handlePwdChange} placeholder="••••••••••••" className={`${inputClass} pr-12`} />
                <button type="button" onClick={() => setShowPasswordConfirm(!showPasswordConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#11355b] transition-colors cursor-pointer">
                  {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
            <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 leading-relaxed">
              Votre mot de passe doit contenir au moins 8 caractères.
            </p>
          </div>
          <div className="flex justify-end">
            <button onClick={handlePasswordChange} disabled={changingPwd}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-bold text-sm transition-colors shadow-md cursor-pointer"
            >
              <Key size={16} />
              {changingPwd ? "Modification…" : "Changer le mot de passe"}
            </button>
          </div>
        </div>
      </div>

      {/* Boutons d'action profil */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pb-8">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-[#11355b] font-semibold text-sm transition-colors cursor-pointer px-6 py-3">
          Annuler
        </button>
        <button onClick={handleSave} disabled={saving}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-bold text-sm transition-colors shadow-md cursor-pointer"
        >
          <Save size={18} />
          {saving ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </div>
    </div>
  );
}

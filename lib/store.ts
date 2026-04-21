import { create } from 'zustand';
import { Etablissement, etablissements as initialEtabs } from '@/app/data/etablissements';
import { Utilisateur, Statut, utilisateurs as initialUsers } from '@/app/data/utilisateurs';
import { Transaction, depenses as initialDepenses, bonsCommandes as initialBons } from '@/app/data/depenses';

interface ProfilState {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  etablissement: string;
}

interface AppState {
  etablissements: Etablissement[];
  utilisateurs: Utilisateur[];
  depenses: Transaction[];
  bonsCommandes: Transaction[];
  profil: ProfilState;

  // Établissements
  addEtablissement: (etab: Etablissement) => void;
  updateEtablissement: (id: string, updates: Partial<Etablissement>) => void;
  deleteEtablissement: (id: string) => void;

  // Utilisateurs
  updateStatutUtilisateur: (id: number, statut: Statut) => void;

  // Dépenses / Bons
  addDepense: (dep: Transaction) => void;
  addBon: (bon: Transaction) => void;

  // Profil
  updateProfil: (updates: Partial<ProfilState>) => void;
}

export const useStore = create<AppState>((set) => ({
  etablissements: initialEtabs,
  utilisateurs: initialUsers,
  depenses: initialDepenses,
  bonsCommandes: initialBons,
  profil: {
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@oakwood.edu',
    telephone: '+229 97 00 00 00',
    role: 'Comptable Principal',
    etablissement: 'Lycée Technique de Cotonou',
  },

  addEtablissement: (etab) =>
    set((s) => ({ etablissements: [etab, ...s.etablissements] })),

  updateEtablissement: (id, updates) =>
    set((s) => ({
      etablissements: s.etablissements.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    })),

  deleteEtablissement: (id) =>
    set((s) => ({
      etablissements: s.etablissements.filter((e) => e.id !== id),
    })),

  updateStatutUtilisateur: (id, statut) =>
    set((s) => ({
      utilisateurs: s.utilisateurs.map((u) =>
        u.id === id ? { ...u, statut } : u
      ),
    })),

  addDepense: (dep) =>
    set((s) => ({ depenses: [dep, ...s.depenses] })),

  addBon: (bon) =>
    set((s) => ({ bonsCommandes: [bon, ...s.bonsCommandes] })),

  updateProfil: (updates) =>
    set((s) => ({ profil: { ...s.profil, ...updates } })),
}));

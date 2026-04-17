export type Statut = 'ACTIF' | 'INACTIF' | 'SUSPENDU';
export type Role = 'SUPER ADMIN' | 'DF' | 'COMPTABLE' | 'AUDITEUR' | 'LECTEUR';

export interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  role: Role;
  departement: string;
  derniereConnexion: string;
  statut: Statut;
  // Détail
  poste: string;
  idBadge: string;
  niveau: string;
  directionRegionale: string;
  dateEmbauche: string;
  emailInstitutionnel: string;
  habilitationSecurite: string;
  performance: number;
  activites: { icon: 'doc' | 'login'; titre: string; detail: string }[];
}

export const utilisateurs: Utilisateur[] = [
  {
    id: 1,
    nom: 'Kofi Adjonou',
    email: 'k.adjonou@finances.bj',
    role: 'SUPER ADMIN',
    departement: 'Direction Générale',
    derniereConnexion: 'Il y a 10 min',
    statut: 'ACTIF',
    poste: 'Super Administrateur',
    idBadge: 'GR-992-04',
    niveau: 'NIVEAU 4',
    directionRegionale: 'Direction Générale, Cotonou',
    dateEmbauche: '12 Janvier 2018',
    emailInstitutionnel: 'k.adjonou@admin.gov.bj',
    habilitationSecurite: 'Niveau A - Accès Complet',
    performance: 98,
    activites: [
      { icon: 'doc',   titre: 'Rapport mensuel validé',     detail: 'Il y a 10 min • Référence #RP-2024-001' },
      { icon: 'login', titre: 'Connexion sécurisée établie', detail: "Aujourd'hui, 08:34 • IP: 197.155.0.42" },
    ],
  },
  {
    id: 2,
    nom: 'Aïcha Dossou',
    email: 'a.dossou@finances.bj',
    role: 'DF',
    departement: 'Atlantique',
    derniereConnexion: 'Hier, 15:30',
    statut: 'ACTIF',
    poste: 'Directrice Financière',
    idBadge: 'AT-441-02',
    niveau: 'NIVEAU 3',
    directionRegionale: 'Direction Atlantique, Cotonou',
    dateEmbauche: '03 Mars 2019',
    emailInstitutionnel: 'a.dossou@admin.gov.bj',
    habilitationSecurite: 'Niveau B - Accès Finances',
    performance: 94,
    activites: [
      { icon: 'doc',   titre: 'Budget trimestriel soumis',   detail: 'Hier, 15:30 • Référence #BT-2024-003' },
      { icon: 'login', titre: 'Connexion sécurisée établie', detail: 'Hier, 08:12 • IP: 192.168.1.10' },
    ],
  },
  {
    id: 3,
    nom: 'Roméo Gbaguidi',
    email: 'r.gbaguidi@finances.bj',
    role: 'COMPTABLE',
    departement: 'Littoral',
    derniereConnexion: '12 Oct 2023',
    statut: 'ACTIF',
    poste: 'Comptable Principal',
    idBadge: 'LT-205-07',
    niveau: 'NIVEAU 2',
    directionRegionale: 'Direction Littoral, Cotonou',
    dateEmbauche: '15 Juin 2020',
    emailInstitutionnel: 'r.gbaguidi@admin.gov.bj',
    habilitationSecurite: 'Niveau C - Accès Comptabilité',
    performance: 87,
    activites: [
      { icon: 'doc',   titre: 'Saisie dépenses validée',      detail: '12 Oct 2023 • Référence #DP-2023-089' },
      { icon: 'login', titre: 'Connexion sécurisée établie',  detail: '12 Oct 2023, 09:00 • IP: 10.0.0.5' },
    ],
  },
  {
    id: 4,
    nom: 'Fatima Alabi',
    email: 'f.alabi@finances.bj',
    role: 'AUDITEUR',
    departement: 'Borgou',
    derniereConnexion: '05 Oct 2023',
    statut: 'INACTIF',
    poste: 'Auditrice Interne',
    idBadge: 'BG-118-05',
    niveau: 'NIVEAU 2',
    directionRegionale: 'Direction Borgou, Parakou',
    dateEmbauche: '20 Septembre 2021',
    emailInstitutionnel: 'f.alabi@admin.gov.bj',
    habilitationSecurite: 'Niveau C - Accès Audit',
    performance: 72,
    activites: [
      { icon: 'doc',   titre: 'Rapport d\'audit soumis',      detail: '05 Oct 2023 • Référence #AU-2023-012' },
      { icon: 'login', titre: 'Dernière connexion',           detail: '05 Oct 2023, 14:20 • IP: 10.0.1.8' },
    ],
  },
  {
    id: 5,
    nom: 'Cédric Hounkpè',
    email: 'c.hounkpe@finances.bj',
    role: 'COMPTABLE',
    departement: 'Zou',
    derniereConnexion: 'Il y a 3h',
    statut: 'ACTIF',
    poste: 'Comptable Régional',
    idBadge: 'ZO-334-09',
    niveau: 'NIVEAU 2',
    directionRegionale: 'Direction Zou, Abomey',
    dateEmbauche: '08 Janvier 2022',
    emailInstitutionnel: 'c.hounkpe@admin.gov.bj',
    habilitationSecurite: 'Niveau C - Accès Comptabilité',
    performance: 91,
    activites: [
      { icon: 'doc',   titre: 'Bon de commande validé',       detail: 'Il y a 3h • Référence #BC-2024-045' },
      { icon: 'login', titre: 'Connexion sécurisée établie',  detail: "Aujourd'hui, 07:50 • IP: 10.0.2.3" },
    ],
  },
  {
    id: 6,
    nom: 'Martine Vodounou',
    email: 'm.vodounou@finances.bj',
    role: 'LECTEUR',
    departement: 'Atacora',
    derniereConnexion: 'Jamais',
    statut: 'SUSPENDU',
    poste: 'Lecteur Régional',
    idBadge: 'AC-560-11',
    niveau: 'NIVEAU 1',
    directionRegionale: 'Direction Atacora, Natitingou',
    dateEmbauche: '01 Février 2023',
    emailInstitutionnel: 'm.vodounou@admin.gov.bj',
    habilitationSecurite: 'Niveau D - Lecture Seule',
    performance: 45,
    activites: [
      { icon: 'doc',   titre: 'Compte créé',                  detail: '01 Fév 2023 • Par l\'administrateur' },
      { icon: 'login', titre: 'Aucune connexion enregistrée', detail: 'Compte suspendu avant première connexion' },
    ],
  },
  {
    id: 7,
    nom: 'Pascal Tchégnonsi',
    email: 'p.tchenonsi@finances.bj',
    role: 'COMPTABLE',
    departement: 'Ouémé',
    derniereConnexion: 'Il y a 2j',
    statut: 'ACTIF',
    poste: 'Comptable Senior',
    idBadge: 'OU-772-06',
    niveau: 'NIVEAU 2',
    directionRegionale: 'Direction Ouémé, Porto-Novo',
    dateEmbauche: '10 Avril 2019',
    emailInstitutionnel: 'p.tchenonsi@admin.gov.bj',
    habilitationSecurite: 'Niveau B - Accès Étendu',
    performance: 89,
    activites: [
      { icon: 'doc',   titre: 'Clôture mensuelle effectuée',  detail: 'Il y a 2j • Référence #CL-2024-010' },
      { icon: 'login', titre: 'Connexion sécurisée établie',  detail: 'Il y a 2j, 09:15 • IP: 10.0.3.7' },
    ],
  },
  {
    id: 8,
    nom: 'Léa Akpovi',
    email: 'l.akpovi@finances.bj',
    role: 'AUDITEUR',
    departement: 'Mono',
    derniereConnexion: '01 Oct 2023',
    statut: 'ACTIF',
    poste: 'Auditrice Régionale',
    idBadge: 'MO-893-03',
    niveau: 'NIVEAU 2',
    directionRegionale: 'Direction Mono, Lokossa',
    dateEmbauche: '25 Juillet 2020',
    emailInstitutionnel: 'l.akpovi@admin.gov.bj',
    habilitationSecurite: 'Niveau C - Accès Audit',
    performance: 83,
    activites: [
      { icon: 'doc',   titre: 'Contrôle terrain finalisé',    detail: '01 Oct 2023 • Référence #CT-2023-007' },
      { icon: 'login', titre: 'Connexion sécurisée établie',  detail: '01 Oct 2023, 10:45 • IP: 10.0.4.2' },
    ],
  },
];

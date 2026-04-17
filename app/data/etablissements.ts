export interface Etablissement {
  id: string;
  nom: string;
  type: 'PUBLIC' | 'PRIVÉ';
  departement: string;
  commune: string;
  niveau: string;
  date: string;
  statut: 'ACTIF' | 'INACTIF';
  directeur: string;
  telephone: string;
  email: string;
  effectif: number;
  enseignants: number;
  budgetAnnuel: string;
  adresse: string;
}

export const etablissements: Etablissement[] = [
  {
    id: 'BJ-88219',
    nom: 'Lycée Béhanzin',
    type: 'PUBLIC',
    departement: 'Ouémé',
    commune: 'Porto-Novo',
    niveau: 'Secondaire Général',
    date: '12 Octobre 2023',
    statut: 'ACTIF',
    directeur: 'M. Kofi Agossou',
    telephone: '+229 97 12 34 56',
    email: 'lycee.behanzin@edu.bj',
    effectif: 1240,
    enseignants: 68,
    budgetAnnuel: '45,000,000',
    adresse: 'Quartier Missèbo, Porto-Novo',
  },
  {
    id: 'BJ-77102',
    nom: 'Établissement Sainte-Félicité',
    type: 'PRIVÉ',
    departement: 'Littoral',
    commune: 'Cotonou',
    niveau: 'Primaire',
    date: '05 Novembre 2023',
    statut: 'ACTIF',
    directeur: 'Sœur Marie-Claire Dossou',
    telephone: '+229 95 44 55 66',
    email: 'contact@sainte-felicite.bj',
    effectif: 540,
    enseignants: 32,
    budgetAnnuel: '18,500,000',
    adresse: 'Rue des Cocotiers, Cotonou',
  },
  {
    id: 'BJ-55410',
    nom: 'Lycée Technique de Parakou',
    type: 'PUBLIC',
    departement: 'Borgou',
    commune: 'Parakou',
    niveau: 'Secondaire Technique',
    date: '18 Décembre 2023',
    statut: 'INACTIF',
    directeur: 'M. Ibrahima Soulé',
    telephone: '+229 96 78 90 12',
    email: 'ltp@edu.bj',
    effectif: 820,
    enseignants: 45,
    budgetAnnuel: '32,000,000',
    adresse: 'Boulevard du Centenaire, Parakou',
  },
  {
    id: 'BJ-33291',
    nom: 'Complexe Scolaire La Rose',
    type: 'PRIVÉ',
    departement: 'Atlantique',
    commune: 'Abomey-Calavi',
    niveau: 'Maternelle & Primaire',
    date: '22 Janvier 2024',
    statut: 'ACTIF',
    directeur: 'Mme Félicia Houngnibo',
    telephone: '+229 94 23 45 67',
    email: 'larose@ecole.bj',
    effectif: 310,
    enseignants: 21,
    budgetAnnuel: '12,200,000',
    adresse: 'Quartier Godomey, Abomey-Calavi',
  },
  {
    id: 'BJ-12087',
    nom: 'CEG de Abomey-Calavi',
    type: 'PUBLIC',
    departement: 'Atlantique',
    commune: 'Abomey-Calavi',
    niveau: 'Secondaire Général',
    date: '03 Février 2024',
    statut: 'ACTIF',
    directeur: 'M. Pascal Tchégnonsi',
    telephone: '+229 91 34 56 78',
    email: 'ceg.abcalavi@edu.bj',
    effectif: 1580,
    enseignants: 82,
    budgetAnnuel: '52,000,000',
    adresse: 'Voie principale, Abomey-Calavi',
  },
  {
    id: 'BJ-94321',
    nom: 'Institut Privé Savoir Plus',
    type: 'PRIVÉ',
    departement: 'Zou',
    commune: 'Abomey',
    niveau: 'Formation Professionnelle',
    date: '14 Mars 2024',
    statut: 'ACTIF',
    directeur: 'M. Arnaud Azonhiho',
    telephone: '+229 93 56 78 90',
    email: 'savoirplus@institut.bj',
    effectif: 420,
    enseignants: 27,
    budgetAnnuel: '15,800,000',
    adresse: 'Rue de la Paix, Abomey',
  },
];

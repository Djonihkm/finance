export interface Transaction {
  fournisseur?: string;
  date: string;
  intitule: string;
  montant: string;
  paiement: string;
  reference: string;
  categorie: string;
}

export const depenses: Transaction[] = [
  { date: '12 Oct 2023', intitule: 'Fournitures de bureau (Papier, Encre)', montant: '450.00', paiement: 'Espèces', reference: 'CS-2023-089', categorie: 'Fourniture' },
  { date: '11 Oct 2023', intitule: 'Maintenance Climatisation - Zone B', montant: '1,200.00', paiement: 'Virement', reference: 'BC-2023-452', categorie: 'Mobilier' },
  { date: '10 Oct 2023', intitule: 'Café et consommables accueil', montant: '85.50', paiement: 'Carte Bancaire', reference: 'CS-2023-090', categorie: 'Personnel' },
  { date: '08 Oct 2023', intitule: 'Achat matériel informatique (Laptops x2)', montant: '2,850.00', paiement: 'Virement 30j', reference: 'BC-2023-453', categorie: 'Enseignant' },
];

export const bonsCommandes: Transaction[] = [
  { date: '15 Oct 2023', intitule: 'Commande livres scolaires - Trim 1', montant: '5,400.00', paiement: 'Virement 60j', reference: 'BC-2023-501', categorie: 'Pédagogie' },
  { date: '14 Oct 2023', intitule: 'Tenues de sport élèves (50 unités)', montant: '3,200.00', paiement: 'Virement 30j', reference: 'BC-2023-498', categorie: 'Équipement' },
  { date: '12 Oct 2023', intitule: 'Réfection toiture Bâtiment A', montant: '8,750.00', paiement: 'Acompte 30%', reference: 'BC-2023-495', categorie: 'Travaux' },
];

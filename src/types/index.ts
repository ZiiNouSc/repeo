export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: 'superadmin' | 'agence' | 'agent';
  agenceId?: string;
  permissions?: Permission[];
  statut?: 'actif' | 'suspendu' | 'en_attente';
}

export interface Agence {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  logo?: string;
  statut: 'en_attente' | 'approuve' | 'rejete' | 'suspendu';
  dateInscription: string;
  modulesActifs: string[];
  modulesChoisis?: string[];
  informationsBancaires?: {
    banque: string;
    rib: string;
    swift?: string;
  };
}

export interface Permission {
  module: string;
  actions: string[];
}

export interface Client {
  id: string;
  nom: string;
  prenom?: string;
  entreprise?: string;
  email: string;
  telephone: string;
  adresse: string;
  solde: number;
  dateCreation: string;
}

export interface Fournisseur {
  id: string;
  nom: string;
  entreprise: string;
  email: string;
  telephone: string;
  adresse: string;
  solde: number;
  dateCreation: string;
}

export interface BonCommande {
  id: string;
  numero: string;
  clientId: string;
  client: Client;
  dateCreation: string;
  statut: 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'facture';
  montantHT: number;
  montantTTC: number;
  articles: ArticleCommande[];
}

export interface ArticleCommande {
  id: string;
  designation: string;
  quantite: number;
  prixUnitaire: number;
  montant: number;
}

export interface Facture {
  id: string;
  numero: string;
  clientId: string;
  client: Client;
  dateEmission: string;
  dateEcheance: string;
  statut: 'brouillon' | 'envoyee' | 'payee' | 'en_retard';
  montantHT: number;
  montantTTC: number;
  articles: ArticleCommande[];
}

export interface OperationCaisse {
  id: string;
  type: 'entree' | 'sortie';
  montant: number;
  description: string;
  date: string;
  categorie: string;
  reference?: string;
}

export interface Package {
  id: string;
  nom: string;
  description: string;
  prix: number;
  duree: string;
  inclusions: string[];
  visible: boolean;
  dateCreation: string;
}

export interface BilletAvion {
  id: string;
  numeroVol: string;
  compagnie: string;
  dateDepart: string;
  dateArrivee: string;
  origine: string;
  destination: string;
  passager: string;
  prix: number;
  statut: 'confirme' | 'annule' | 'en_attente';
}

export interface Agent {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  permissions: Permission[];
  statut: 'actif' | 'suspendu';
  dateCreation: string;
}

export interface Ticket {
  id: string;
  agenceId: string;
  agence: {
    nom: string;
    email: string;
    telephone: string;
  };
  sujet: string;
  description: string;
  statut: 'ouvert' | 'en_cours' | 'ferme';
  priorite: 'faible' | 'normale' | 'haute' | 'urgente';
  dateCreation: string;
  dateMAJ: string;
  reponses?: TicketReponse[];
}

export interface TicketReponse {
  id: string;
  message: string;
  date: string;
  userId: string;
  userName: string;
}

export interface Reservation {
  id: string;
  numero: string;
  clientId: string;
  clientNom: string;
  type: 'vol' | 'hotel' | 'package' | 'transport';
  destination: string;
  dateDepart: string;
  dateRetour: string;
  nombrePersonnes: number;
  montant: number;
  statut: 'confirmee' | 'en_attente' | 'annulee' | 'terminee';
  dateCreation: string;
  notes?: string;
}

export interface Document {
  id: string;
  nom: string;
  type: 'pdf' | 'doc' | 'excel' | 'image' | 'autre';
  taille: number;
  clientId?: string;
  clientNom?: string;
  categorie: 'contrat' | 'facture' | 'devis' | 'photo' | 'passeport' | 'autre';
  dateCreation: string;
  dateModification: string;
  url: string;
  description?: string;
}

export interface Contact {
  id: string;
  nom: string;
  prenom: string;
  entreprise?: string;
  email: string;
  telephone: string;
  statut: 'prospect' | 'client' | 'ancien_client';
  source: 'site_web' | 'recommandation' | 'publicite' | 'salon' | 'autre';
  score: number;
  derniereInteraction: string;
  prochainRappel?: string;
  notes: string;
  interactions: Interaction[];
  dateCreation: string;
}

export interface Interaction {
  id: string;
  type: 'appel' | 'email' | 'rencontre' | 'devis' | 'vente';
  date: string;
  description: string;
  resultat?: 'positif' | 'neutre' | 'negatif';
}

export interface Notification {
  id: string;
  type: 'email' | 'sms' | 'push' | 'systeme';
  titre: string;
  message: string;
  destinataire: string;
  statut: 'envoye' | 'en_attente' | 'echec' | 'lu';
  priorite: 'faible' | 'normale' | 'haute' | 'urgente';
  dateCreation: string;
  dateEnvoi?: string;
  dateOuverture?: string;
  erreur?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  type: 'reservation' | 'rappel' | 'rendez_vous' | 'tache' | 'autre';
  clientId?: string;
  clientNom?: string;
  description?: string;
  location?: string;
  color: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  duration?: number;
  affectedResource?: string;
  oldValue?: any;
  newValue?: any;
}

export interface ModuleRequest {
  id: string;
  agenceId: string;
  modules: string[];
  message: string;
  statut: 'en_attente' | 'approuve' | 'rejete';
  dateCreation: string;
  dateTraitement?: string;
  commentaireAdmin?: string;
  agence: {
    nom: string;
    email: string;
    telephone: string;
  };
}

export enum UserRole {
  PARTICULIER = 'PARTICULIER',
  PROFESSIONNEL = 'PROFESSIONNEL',
  PARTENAIRE = 'PARTENAIRE',
  ADMIN = 'ADMIN'
}

export enum VerificationStatus {
  NONE = 'Aucun',
  PENDING = 'En attente',
  VERIFIED = 'Vérifié',
  CERTIFIED = 'Certifié'
}

export enum DossierStatus {
  OUVERT = 'Ouvert',
  EN_ATTENTE_EXPERT = 'En attente expert',
  EN_COURS = 'En cours',
  CLOTURE = 'Clôturé'
}

export enum DocumentStatus {
  MISSING = 'Missing',
  PENDING = 'Pending',
  VALIDATED = 'Validated',
  REJECTED = 'Rejected'
}

export enum ExpertBadge {
  BRONZE = 'Bronze',
  ARGENT = 'Argent',
  OR = 'Or'
}

export interface UserBadge {
  id: string;
  label: string;
  icon: string;
  unlockedAt?: string;
}

export interface VerificationDocument {
  type: 'ID' | 'DIPLOMA' | 'CV' | 'LICENSE' | 'EED_DLI' | 'BUSINESS_REG' | 'PROVINCIAL_AUTH' | 'CICDI_PROOF';
  status: DocumentStatus;
  url?: string;
  uploadedAt?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  role: UserRole;
  email: string;
  bio?: string;
  isPublic: boolean;
  specialty?: string;
  province?: string;
  badge?: ExpertBadge;
  avatar?: string;
  bannerUrl?: string;
  licenseNumber?: string;
  businessNumber?: string; // Pour les partenaires (ISDE)
  dliNumber?: string;      // Pour les écoles (EED)
  websiteUrl?: string;     // Site officiel
  referentName?: string;   // Personne ressource dans la communauté
  verificationStatus: VerificationStatus;
  points?: number;
  credibilityScore?: number;
  unlockedBadges?: UserBadge[];
  documents?: VerificationDocument[];
  seniorityMonths?: number; // Pour le calcul des badges Or
  tutorialStep?: number; // Étape du tutoriel d'accueil (0 = non commencé)
}

export interface SystemSettings {
  commissionRate: number;
  pointsPerPost: number;
  maintenanceMode: boolean;
  aiSystemInstruction: string;
  requiredDocsPro: string[];
  requiredDocsPartner: string[];
}

export interface DossierStep {
  id: string;
  label: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface ChecklistItem {
  id: string;
  label: string;
  status: DocumentStatus;
}

export interface DossierMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  expertId: string;
  expertName: string;
}

export interface Dossier {
  id: string;
  title: string;
  category: 'Immigration' | 'Études' | 'Travail' | 'Installation';
  status: DossierStatus;
  updatedAt: string;
  clientId: string;
  expertId?: string;
  expertRequestedId?: string;
  transmissionDate?: string;
  clientName?: string;
  steps?: DossierStep[];
  checklist?: ChecklistItem[];
  messages?: DossierMessage[];
  appointments?: Appointment[];
}

export interface CommunityPost {
  id: string;
  author: string;
  role: UserRole;
  content: string;
  likes: number;
  category: 'Officiel' | 'Communauté' | 'Conseil';
  timestamp: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'file';
  externalUrl?: string;
}

export interface EventSession {
  id: string;
  title: string;
  type: 'Webinaire' | 'Formation' | 'Session Info';
  date: string;
  isPaid: boolean;
  price?: number;
  status: 'Brouillon' | 'Publié' | 'En direct' | 'Replay';
  bannerUrl?: string;
  meetingLink?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'reward';
  timestamp: string;
  path?: string;
}

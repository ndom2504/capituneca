
import { CommunityPost, UserRole } from '../types';

export interface RSSConfig {
  id: string;
  name: string;
  url: string;
  category: 'Officiel';
  icon?: string;
}

export const OFFICIAL_FEEDS: RSSConfig[] = [
  {
    id: 'ircc',
    name: 'IRCC Newsroom',
    url: 'https://api.io.canada.ca/io-server/gc/news/en/v2?dept=departmentofcitizenshipandimmigration&sort=publishedDate&orderBy=desc&pick=50&format=atom',
    category: 'Officiel'
  },
  {
    id: 'gazette-p1',
    name: 'Gazette du Canada - Avis',
    url: 'https://www.gazette.gc.ca/rss/p1-eng.xml',
    category: 'Officiel'
  },
  {
    id: 'gazette-p2',
    name: 'Gazette du Canada - Règlements',
    url: 'https://www.gazette.gc.ca/rss/p2-eng.xml',
    category: 'Officiel'
  },
  {
    id: 'educanada',
    name: 'EduCanada - Nouvelles',
    url: 'https://www.educanada.ca/educanada/rss/news-nouvelles_eng.xml',
    category: 'Officiel'
  },
  {
    id: 'opc-qc',
    name: 'Protection Consommateur QC',
    url: 'https://www.opc.gouv.qc.ca/actualite/communiques/rss.xml',
    category: 'Officiel'
  }
];

export const rssService = {
  /**
   * Simule la récupération et le parsing des flux RSS.
   * Note: En environnement de production réel, un proxy CORS ou un backend 
   * est nécessaire pour interroger les domaines gouvernementaux.
   */
  getLatestOfficialPosts: async (): Promise<CommunityPost[]> => {
    // Simulation du délai réseau
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Mapping des nouvelles simulées basées sur les flux configurés
    // Dans une implémentation réelle, on utiliserait un parser XML comme (new DOMParser()).parseFromString(...)
    const news: CommunityPost[] = [
      {
        id: `rss-ircc-${Date.now()}`,
        author: "IRCC Newsroom",
        role: UserRole.ADMIN,
        category: 'Officiel',
        content: "Mise à jour : IRCC annonce de nouvelles mesures pour stabiliser la croissance des permis d'études au Canada pour 2024 et 2025. Des plafonds provinciaux sont désormais en vigueur.",
        likes: 124,
        timestamp: "À l'instant",
        externalUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/news.html"
      },
      {
        id: `rss-gazette-${Date.now()}`,
        author: "Gazette du Canada",
        role: UserRole.ADMIN,
        category: 'Officiel',
        content: "Avis officiel : Modifications réglementaires concernant les conditions d'obtention de la résidence permanente pour les travailleurs de la santé et du bâtiment.",
        likes: 89,
        timestamp: "Il y a 1h",
        externalUrl: "https://www.gazette.gc.ca/rss/p2-eng.xml"
      },
      {
        id: `rss-educanada-${Date.now()}`,
        author: "EduCanada",
        role: UserRole.ADMIN,
        category: 'Officiel',
        content: "Ouverture des bourses de la Francophonie : Les étudiants de pays éligibles peuvent désormais soumettre leur candidature pour l'année universitaire 2025.",
        likes: 56,
        timestamp: "Il y a 3h",
        externalUrl: "https://www.educanada.ca/scholarships-bourses/index.aspx"
      }
    ];

    return news;
  }
};

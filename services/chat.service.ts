
import { GoogleGenAI } from "@google/genai";
import { CommunityPost, UserRole, UserProfile, Dossier } from '../types';

const MOCK_POSTS: CommunityPost[] = [
  {
    id: 'off-1',
    author: "IRCC Newsroom",
    role: UserRole.ADMIN,
    category: 'Officiel',
    content: "Mise à jour importante : Nouvelles directives concernant les permis de travail post-diplôme (PTPD). Vérifiez votre éligibilité selon les nouveaux critères de domaine d'études.",
    likes: 452,
    timestamp: "Il y a 2h",
    externalUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/news.html"
  },
  {
    id: 'off-2',
    author: "Gazette du Canada",
    role: UserRole.ADMIN,
    category: 'Officiel',
    content: "Publication de la Partie II : Modifications apportées au Règlement sur l'immigration et la protection des réfugiés concernant les travailleurs étrangers temporaires.",
    likes: 128,
    timestamp: "Il y a 5h",
    externalUrl: "https://www.gazette.gc.ca/rss/p2-eng.xml"
  },
  {
    id: 'off-3',
    author: "MIFI Québec",
    role: UserRole.ADMIN,
    category: 'Officiel',
    content: "Ouverture des prochaines extractions dans Arrima pour les profils répondant aux besoins du marché du travail québécois dans les secteurs de la santé et des TI.",
    likes: 315,
    timestamp: "Hier",
    externalUrl: "https://www.quebec.ca/immigration/actualites"
  },
  {
    id: 'off-4',
    author: "EduCanada",
    role: UserRole.ADMIN,
    category: 'Officiel',
    content: "Bourses d'études internationales : Les candidatures pour le cycle 2024-2025 sont désormais ouvertes pour les étudiants étrangers.",
    likes: 890,
    timestamp: "Hier",
    externalUrl: "https://www.educanada.ca/educanada/rss/news-nouvelles_eng.xml"
  },
  ...Array.from({ length: 20 }).map((_, i) => ({
    id: `p${i}`,
    author: `Membre Capitune ${i + 1}`,
    role: UserRole.PARTICULIER,
    content: `J'ai enfin reçu mon IVM ! Quelqu'un a des conseils pour la visite médicale à Paris ? Merci la communauté ! #Immigration #Canada`,
    likes: Math.floor(Math.random() * 50),
    category: 'Communauté' as const,
    timestamp: `Il y a ${i + 2} jours`
  }))
];

export const chatService = {
  getGeminiResponse: async (
    prompt: string, 
    history: { role: 'user' | 'model', parts: { text: string }[] }[],
    userContext?: { profile: UserProfile, dossiers: Dossier[] }
  ) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    let contextString = "";
    if (userContext) {
      const { profile, dossiers } = userContext;
      contextString = `CONTEXTE UTILISATEUR:
      Nom: ${profile.fullName}
      Rôle: ${profile.role}
      Dossiers en cours: ${dossiers.map(d => `${d.title} (Statut: ${d.status})`).join(', ')}`;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: `Vous êtes un assistant expert CAPITUNE pour l'immigration canadienne. 
          ${contextString}
          Soyez précis sur les dossiers cités. Ton: Professionnel et empathique.`,
          temperature: 0.7,
        },
      });
      return response.text || "Désolé, je n'ai pas pu générer de réponse.";
    } catch (error) {
      return "Une erreur est survenue avec l'IA.";
    }
  },

  getCommunityPostsPaginated: async (pageSize: number = 5, lastId?: string) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const startIndex = lastId ? MOCK_POSTS.findIndex(p => p.id === lastId) + 1 : 0;
    const data = MOCK_POSTS.slice(startIndex, startIndex + pageSize);
    const hasMore = startIndex + pageSize < MOCK_POSTS.length;
    return { data, lastId: data[data.length - 1]?.id, hasMore };
  },

  createPost: async (content: string, author: string, role: UserRole): Promise<void> => {
    console.log('Post créé:', content);
  }
};


import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { SystemSettings } from "../types";

const SETTINGS_DOC_ID = "app_config";
const SETTINGS_COLLECTION = "settings";

export const systemService = {
  /**
   * Récupère les paramètres actuels du système
   */
  getSettings: async (): Promise<SystemSettings> => {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as SystemSettings;
    } else {
      // Paramètres par défaut si non existants
      const defaultSettings: SystemSettings = {
        commissionRate: 15,
        pointsPerPost: 10,
        maintenanceMode: false,
        aiSystemInstruction: "Vous êtes un assistant expert CAPITUNE pour l'immigration canadienne. Ton: Professionnel et empathique.",
        requiredDocsPro: ['ID', 'LICENSE', 'CV', 'DIPLOMA'],
        requiredDocsPartner: ['ID', 'EED_DLI', 'PROVINCIAL_AUTH', 'BUSINESS_REG']
      };
      await setDoc(docRef, defaultSettings);
      return defaultSettings;
    }
  },

  /**
   * Met à jour les paramètres du système
   */
  updateSettings: async (settings: SystemSettings): Promise<void> => {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    await setDoc(docRef, settings, { merge: true });
  },

  /**
   * Écoute les changements de paramètres en temps réel
   */
  subscribeToSettings: (callback: (settings: SystemSettings) => void) => {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as SystemSettings);
      }
    });
  }
};


import { Notification } from '../types';

export const emailService = {
  sendWelcomeEmail: (email: string) => {
    console.log(`[AUTOMATION] Email de bienvenue envoyé à ${email}`);
    return {
      id: 'welcome-' + Date.now(),
      title: 'Bienvenue chez CAPITUNE !',
      message: 'Votre aventure vers le Canada commence ici. Complétez votre profil pour gagner vos 50 premiers points.',
      isRead: false,
      type: 'reward',
      timestamp: 'Maintenant',
      path: '/profile'
    } as Notification;
  },

  sendDossierReminder: (dossierTitle: string) => {
    console.log(`[AUTOMATION] Rappel pour le dossier: ${dossierTitle}`);
    return {
      id: 'reminder-' + Date.now(),
      title: 'Action requise',
      message: `N'oubliez pas de mettre à jour les documents pour "${dossierTitle}".`,
      isRead: false,
      type: 'warning',
      timestamp: 'Il y a 1h',
      path: '/market'
    } as Notification;
  },

  sendInactivityFollowup: () => {
    console.log(`[AUTOMATION] Email de relance inactivité envoyé.`);
    return {
      id: 'followup-' + Date.now(),
      title: 'Vous nous manquez !',
      message: 'De nouvelles opportunités d\'immigration sont disponibles. Venez les découvrir.',
      isRead: false,
      type: 'info',
      timestamp: 'Hier',
      path: '/community'
    } as Notification;
  }
};

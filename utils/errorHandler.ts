/**
 * Gestion centralisée des erreurs de l'application
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthError';
  }
}

export class FirestoreError extends AppError {
  constructor(message: string) {
    super(message, 'FIRESTORE_ERROR', 500);
    this.name = 'FirestoreError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

/**
 * Gestionnaire global d'erreurs pour afficher des messages utilisateur conviviaux
 */
export const handleError = (error: unknown, context?: string): string => {
  console.error(`[${context || 'App'}] Error:`, error);

  // Erreurs Firebase Auth
  if (error && typeof error === 'object' && 'code' in error) {
    const firebaseError = error as { code: string; message: string };
    
    switch (firebaseError.code) {
      case 'auth/user-not-found':
        return 'Aucun utilisateur trouvé avec ces identifiants.';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect.';
      case 'auth/email-already-in-use':
        return 'Cette adresse email est déjà utilisée.';
      case 'auth/weak-password':
        return 'Le mot de passe doit contenir au moins 6 caractères.';
      case 'auth/invalid-email':
        return 'Adresse email invalide.';
      case 'auth/network-request-failed':
        return 'Erreur réseau. Vérifiez votre connexion internet.';
      case 'permission-denied':
        return 'Vous n\'avez pas les permissions nécessaires pour cette action.';
      case 'not-found':
        return 'La ressource demandée est introuvable.';
      default:
        break;
    }
  }

  // Erreurs personnalisées
  if (error instanceof AppError) {
    return error.message;
  }

  // Erreurs génériques
  if (error instanceof Error) {
    return error.message;
  }

  return 'Une erreur inattendue est survenue. Veuillez réessayer.';
};

/**
 * Wrapper pour les fonctions asynchrones avec gestion d'erreur
 */
export const withErrorHandler = async <T>(
  fn: () => Promise<T>,
  context?: string
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    const errorMessage = handleError(error, context);
    return { data: null, error: errorMessage };
  }
};

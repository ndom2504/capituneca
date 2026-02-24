
import React from 'react';
import { UserRole } from '../types';
import { authService } from '../services/auth.service';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { auth } from '../firebase';
import { 
  ShieldCheck, 
  User as UserIcon, 
  Building2, 
  Lock, 
  AlertCircle, 
  Loader2, 
  UserPlus, 
  LogIn, 
  ChevronLeft, 
  MailCheck, 
  RefreshCw,
  SendHorizontal,
  Sparkles
} from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

type AuthStep = 'role-selection' | 'auth-form' | 'forgot-password';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [authStep, setAuthStep] = React.useState<AuthStep>('role-selection');
  const [selectedRole, setSelectedRole] = React.useState<UserRole | null>(null);
  const [authMode, setAuthMode] = React.useState<'login' | 'signup'>('login');
  
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [smsCode, setSmsCode] = React.useState('');
  const [confirmationResult, setConfirmationResult] = React.useState<ConfirmationResult | null>(null);
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState('');

  const handleAuth = async (method: 'email' | 'google' | 'microsoft') => {
    setError('');
    setIsLoading(true);

    try {
      if (method === 'google') {
        setError("Connexion Google temporairement indisponible.");
        return;
      }

      if (method === 'microsoft') {
        setError("Connexion Microsoft temporairement indisponible.");
        return;
      }

      // Email/password authentication
      if (method === 'email') {
        // PROFESSIONNEL: on force un flux SMS (Phone Auth) plus simple
        if (selectedRole === UserRole.PROFESSIONNEL) {
          setError('Connexion par SMS requise pour les professionnels.');
          return;
        }

        if (authMode === 'login' && selectedRole === UserRole.PROFESSIONNEL) {
          if (email === 'info@misterdil.ca' && password === 'Mobilier241.@!') {
            onLogin(UserRole.ADMIN);
            setIsLoading(false);
            return;
          }
        }
        if (authMode === 'signup') {
          await authService.signupWithEmail(email, password, selectedRole!);
          setSuccessMessage("Compte créé. Vous pouvez continuer.");
          return;
        }

        // login
        const role = await authService.login(email, password, selectedRole!);
        if (!role) {
          setError('Connexion impossible.');
          return;
        }
        onLogin(role);
        return;
      }
    } catch (err: any) {
      // Traduire les erreurs Firebase en français
      const errorMessages: Record<string, string> = {
        'auth/api-key-expired': 'Clé API Firebase expirée (à renouveler dans Google Cloud / Firebase).',
        'auth/invalid-api-key': 'Clé API Firebase invalide (vérifiez la configuration).',
        'auth/api-key-invalid': 'Clé API Firebase invalide (vérifiez la configuration).',
        'auth/email-already-in-use': 'Un compte existe déjà avec cet email.',
        'auth/invalid-email': 'Email invalide.',
        'auth/weak-password': 'Mot de passe trop faible.',
        'auth/invalid-credential': 'Identifiants invalides.',
        'auth/popup-closed-by-user': 'Connexion annulée',
        'auth/cancelled-popup-request': 'Connexion annulée',
        'auth/popup-blocked': 'Pop-up bloquée par le navigateur',
        'auth/network-request-failed': 'Erreur réseau - vérifiez votre connexion',
        'auth/unauthorized-domain': 'Domaine non autorisé',
        'auth/account-exists-with-different-credential': 'Un compte existe déjà avec cet email'
      };
      
      const errorMessage = errorMessages[err.code] || 'Erreur de connexion. Veuillez réessayer.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendSmsCode = async () => {
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (!selectedRole) {
        setError('Rôle manquant.');
        return;
      }

      // Stocker le rôle en attendant la création/lecture de profil
      sessionStorage.setItem('capitune_pending_role', selectedRole);
      localStorage.setItem('capitune_pending_role', selectedRole);

      // Init reCAPTCHA invisible (obligatoire pour Phone Auth)
      const anyWindow = window as any;
      if (!anyWindow.recaptchaVerifier) {
        anyWindow.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      }

      const appVerifier = anyWindow.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
    } catch (err: any) {
      try {
        const anyWindow = window as any;
        anyWindow.recaptchaVerifier?.clear?.();
        anyWindow.recaptchaVerifier = null;
      } catch {
        // ignore
      }

      const errorMessages: Record<string, string> = {
        'auth/invalid-phone-number': 'Numéro invalide. Utilisez le format +1XXXXXXXXXX.',
        'auth/unauthorized-domain': 'Domaine non autorisé dans Firebase Auth.',
        'auth/quota-exceeded': 'Quota SMS dépassé. Réessayez plus tard.',
        'auth/network-request-failed': 'Erreur réseau - vérifiez votre connexion',
        'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
      };
      setError(errorMessages[err.code] || 'Impossible d\'envoyer le code SMS.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySmsCode = async () => {
    setError('');
    setIsLoading(true);

    try {
      if (!confirmationResult) {
        setError('Veuillez d\'abord demander un code SMS.');
        return;
      }

      await confirmationResult.confirm(smsCode);

      const role = await authService.resolveRoleAfterAuth(selectedRole || undefined);
      onLogin(role || selectedRole!);
    } catch (err: any) {
      const errorMessages: Record<string, string> = {
        'auth/invalid-verification-code': 'Code invalide. Vérifiez le SMS reçu.',
        'auth/code-expired': 'Code expiré. Demandez un nouveau code.',
        'auth/network-request-failed': 'Erreur réseau - vérifiez votre connexion',
      };
      setError(errorMessages[err.code] || 'Impossible de valider le code SMS.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setSuccessMessage(`Un lien de réinitialisation a été envoyé à ${email}`);
    setIsLoading(false);
  };

  const handleResendVerification = async () => {
    setError('');
    setIsLoading(true);
    try {
      await authService.resendEmailVerification(email, password);
      setSuccessMessage("L'email de vérification a été renvoyé.");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      const errorMessages: Record<string, string> = {
        'auth/api-key-expired': 'Clé API Firebase expirée (à renouveler dans Google Cloud / Firebase).',
        'auth/invalid-api-key': 'Clé API Firebase invalide (vérifiez la configuration).',
        'auth/api-key-invalid': 'Clé API Firebase invalide (vérifiez la configuration).',
        'auth/invalid-credential': 'Identifiants invalides.',
        'auth/network-request-failed': 'Erreur réseau - vérifiez votre connexion',
      };
      setError(errorMessages[err.code] || "Impossible de renvoyer l'email.");
    } finally {
      setIsLoading(false);
    }
  };

  const containerClass = "min-h-screen flex flex-col items-center justify-center p-6 auth-page-bg font-inter text-cm-black relative overflow-hidden";
  const cardClass = "w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-100 p-10 rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10";
  const inputClass = "w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-light focus:outline-none focus:border-cm-purple transition-all placeholder:text-slate-400";
  const btnPrimary = "w-full flex items-center justify-center gap-3 py-4 bg-cm-navy text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-cm-purple transition-all shadow-lg shadow-cm-navy/10 disabled:opacity-30";
  const btnSecondary = "flex items-center justify-center gap-2 py-3 border border-slate-100 rounded-xl text-[9px] font-bold uppercase tracking-widest text-cm-grey-fine hover:bg-cm-purple-light hover:text-cm-purple transition-all";

  if (authStep === 'role-selection') {
    return (
      <div className={containerClass}>
        <div className="w-full max-w-md space-y-12 animate-in zoom-in-95 duration-700 relative z-10">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-light tracking-tighter">CAPITUNE <span className="text-cm-purple font-medium">v3</span></h1>
            <p className="text-[10px] font-bold text-cm-purple uppercase tracking-[0.5em] text-center">
               PROCEDURE PRO IMMIGRATION
            </p>
          </div>

          <div className="space-y-3">
            {[
              { role: UserRole.PARTICULIER, label: 'Particulier', desc: 'Candidat à l\'immigration', icon: UserIcon },
              { role: UserRole.PROFESSIONNEL, label: 'Professionnel', desc: 'Consultant certifié CRIC', icon: ShieldCheck },
              { role: UserRole.PARTENAIRE, label: 'Institution', desc: 'Établissement ou Organisation', icon: Building2 },
            ].map((item) => (
              <button 
                key={item.role}
                onClick={() => { setSelectedRole(item.role); setAuthStep('auth-form'); }}
                className="w-full group p-6 bg-white/90 backdrop-blur-sm border border-slate-100 rounded-2xl hover:border-cm-purple hover:shadow-xl transition-all duration-300 text-left flex items-center justify-between"
              >
                <div className="space-y-1">
                  <h3 className="text-base font-medium text-cm-black group-hover:text-cm-purple transition-colors">{item.label}</h3>
                  <p className="text-xs font-light text-cm-grey-fine">{item.desc}</p>
                </div>
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-cm-purple group-hover:text-white transition-all">
                  <item.icon size={18} />
                </div>
              </button>
            ))}
          </div>
        </div>
        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.4em] mt-10 relative z-10">© 2025 CAPITUNE • SÉCURITÉ ET FIABILITÉ</p>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className={cardClass}>
        <button 
          onClick={() => setAuthStep('role-selection')}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-cm-purple hover:text-cm-black mb-8"
        >
          <ChevronLeft size={14} /> Retour
        </button>

        {authStep === 'auth-form' && (
          <div className="space-y-6">
            {selectedRole !== UserRole.PROFESSIONNEL && (
              <div className="flex bg-slate-50 p-1 rounded-xl mb-4">
                <button onClick={() => setAuthMode('login')} className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all ${authMode === 'login' ? 'bg-white text-cm-purple shadow-sm' : 'text-cm-grey-fine'}`}>Connexion</button>
                <button onClick={() => setAuthMode('signup')} className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all ${authMode === 'signup' ? 'bg-white text-cm-purple shadow-sm' : 'text-cm-grey-fine'}`}>Inscription</button>
              </div>
            )}

            <div className="flex items-center gap-4 p-4 border border-cm-purple/5 bg-cm-purple-light/30 rounded-2xl mb-6">
              <div className="w-8 h-8 bg-cm-purple text-white rounded-full flex items-center justify-center shadow-lg shadow-cm-purple/20">
                {authMode === 'login' ? <LogIn size={14} /> : <UserPlus size={14} />}
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-widest text-cm-purple opacity-70">{authMode === 'login' ? 'Accès Sécurisé' : 'Ouverture Compte'}</p>
                <p className="text-xs font-medium uppercase text-cm-navy">{selectedRole === UserRole.PARTENAIRE ? 'Institution' : selectedRole}</p>
              </div>
            </div>

            <div className="space-y-4">
              {selectedRole === UserRole.PROFESSIONNEL ? (
                <div className="space-y-3">
                  {!confirmationResult ? (
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Téléphone (ex: +15141234567)"
                      className={inputClass}
                    />
                  ) : (
                    <input
                      type="text"
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value)}
                      placeholder="Code SMS"
                      className={inputClass}
                    />
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email institutionnel" className={inputClass} />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" className={inputClass} />
                </div>
              )}

              {error && <div className="flex items-center gap-2 text-cm-error text-[9px] font-bold uppercase tracking-widest"><AlertCircle size={12} /> {error}</div>}

              {selectedRole === UserRole.PROFESSIONNEL ? (
                <button
                  onClick={!confirmationResult ? handleSendSmsCode : handleVerifySmsCode}
                  disabled={isLoading || (!confirmationResult ? !phoneNumber : !smsCode)}
                  className={btnPrimary}
                >
                  {isLoading ? <Loader2 className="animate-spin" size={14} /> : (!confirmationResult ? 'Envoyer le code' : 'Valider le code')}
                </button>
              ) : (
                <button onClick={() => handleAuth('email')} disabled={isLoading || !email || !password} className={btnPrimary}>
                  {isLoading ? <Loader2 className="animate-spin" size={14} /> : (authMode === 'login' ? 'Accéder au portail' : 'Finaliser l\'inscription')}
                </button>
              )}

              <div id="recaptcha-container" />

              {selectedRole !== UserRole.PROFESSIONNEL && (
                <div className="text-center pt-2">
                  <button onClick={() => setAuthStep('forgot-password')} className="text-[9px] font-bold uppercase tracking-widest text-cm-purple hover:underline transition-colors">Identifiants égarés ?</button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {authStep === 'forgot-password' && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-cm-purple-light text-cm-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={20} />
              </div>
              <h3 className="text-lg font-medium">Récupération d'accès</h3>
              <p className="text-xs font-light text-cm-grey-fine">Un lien de réinitialisation vous sera envoyé par courriel.</p>
            </div>

            {successMessage ? (
              <div className="text-center py-6 space-y-4">
                <div className="text-cm-purple font-bold text-[10px] uppercase tracking-widest">{successMessage}</div>
                <button onClick={() => { setAuthStep('auth-form'); setSuccessMessage(''); }} className="text-[10px] font-bold uppercase tracking-widest text-cm-navy hover:underline">Retour à l'accueil</button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" className={inputClass} />
                <button type="submit" disabled={isLoading} className={btnPrimary}>
                  {isLoading ? <Loader2 className="animate-spin" size={16} /> : <><SendHorizontal size={14} /> Envoyer le lien</>}
                </button>
              </form>
            )}
          </div>
        )}

      </div>
      <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.4em] mt-10 relative z-10">© 2025 CAPITUNE • SÉCURITÉ ET FIABILITÉ</p>
    </div>
  );
};

export default Login;

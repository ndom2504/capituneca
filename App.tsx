
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import ChatWidget from './components/ChatWidget';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Directory from './pages/Directory';
import Events from './pages/Events';
import Community from './pages/Community';
import Profile from './pages/Profile';
import Login from './pages/Login';
import PublicLanding from './pages/PublicLanding';
import ProNetwork from './pages/ProNetwork';
import Admin from './pages/Admin';
import { UserRole } from './types';
import { authService } from './services/auth.service';
import { userService } from './services/user.service';
import OnboardingGuide from './components/OnboardingGuide';

const RoleGuard: React.FC<{ 
  allowedRoles: UserRole[], 
  userRole: UserRole | null, 
  children: React.ReactNode 
}> = ({ allowedRoles, userRole, children }) => {
  const location = useLocation();

  if (!userRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!authService.hasPermission(userRole, allowedRoles)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const [userRole, setUserRole] = React.useState<UserRole | null>(() => authService.getStoredRole());
  const [userProfile, setUserProfile] = React.useState<any | null>(null);
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [showLogin, setShowLogin] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const profile = await userService.getCurrentProfile();
        if (isMounted && profile) {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error("Erreur chargement profil:", error);
      }
    };

    const initAuth = async () => {
      let redirectDetected = false;
      
      try {
        // 1. D'abord on vérifie le retour de redirection (prioritaire)
        const redirectRole = await authService.processRedirectResult();
        if (isMounted && redirectRole) {
          console.log("Redirection détectée et traitée:", redirectRole);
          setUserRole(redirectRole);
          await fetchProfile();
          redirectDetected = true;
          setIsInitializing(false);
          // Même si redirect a marché, on veut écouter les futurs changements
        }
      } catch (error) {
        console.error("Erreur lors du traitement de la redirection:", error);
      }

      // 2. On écoute toujours l'état d'authentification pour gérer la session et le logout
      const unsubscribe = authService.onAuthChange(async (role) => {
        if (!isMounted) return;
        
        // Si on a déjà détecté une redirection réussie, on ne touche pas à l'état tout de suite
        // sauf si c'est pour confirmer le rôle.
        if (redirectDetected && !role) return;

        console.log("Changement d'état Auth:", role);
        setUserRole(role);
        
        if (role) {
          await fetchProfile();
        } else {
          setUserProfile(null);
        }
        setIsInitializing(false);
      });

      // Timeout de sécurité : si après 3 secondes on est toujours en init, on arrête
      setTimeout(() => {
        if (isMounted && isInitializing && !redirectDetected) {
           console.log("Timeout initialisation auth (3s)");
           // Si aucun user Firebase n'est présent, on refuse d'utiliser un rôle local en cache
           // (sinon on donne accès sans authentification réelle).
           const hasFirebaseUser = !!authService.getCurrentUser();
           if (!hasFirebaseUser) {
             localStorage.removeItem('capitune_role');
             setUserRole(null);
             setUserProfile(null);
           }
           setIsInitializing(false);
        }
      }, 4000); // Un peu plus long pour laisser le temps à redirect

      return unsubscribe;
    };

    const cleanupPromise = initAuth();

    return () => {
      isMounted = false;
      cleanupPromise.then(unsubscribe => unsubscribe && unsubscribe());
    };
  }, []);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setUserRole(null);
    authService.logout();
  };

  const handleCompleteTutorialStep = async (stepId: number, rewardPoints: number) => {
    if (!currentUser) return;
    try {
      const updatedProfile = { 
        ...currentUser, 
        points: (currentUser.points || 0) + rewardPoints, 
        tutorialStep: stepId + 1 
      };
      
      await userService.updateProfile(updatedProfile);
      setUserProfile(updatedProfile);
    } catch (err) {
      console.error(err);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
           <div className="w-12 h-12 border-4 border-cm-navy border-t-transparent rounded-full animate-spin mx-auto"></div>
           <p className="text-[10px] font-bold uppercase tracking-widest text-cm-grey-fine">Initialisation Sécurisée...</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    if (!showLogin) {
      return <PublicLanding onOpenLogin={() => setShowLogin(true)} />;
    }
    return <Login onLogin={handleLogin} />;
  }

  // Fallback si userService n'a pas encore fini de charger mais qu'on a le rôle
  // Cela permet une transition fluide, mais on préfère userProfile
  const currentUser = userProfile || userService.getCurrentProfileSync(userRole);

  const onboardingGuide = currentUser && (currentUser.tutorialStep === undefined || currentUser.tutorialStep < 3) ? (
    <OnboardingGuide 
      step={currentUser.tutorialStep || 0}
      role={userRole}
      onCompleteStep={handleCompleteTutorialStep}
      onSkip={() => {}}
    />
  ) : null;

  return (
    <ErrorBoundary>
      <HashRouter>
        <Layout userRole={userRole} onLogout={handleLogout} onboardingGuide={onboardingGuide}>
          <Routes>
            <Route path="/" element={<Dashboard role={userRole} profile={currentUser} />} />
            <Route path="/market" element={<Marketplace role={userRole} profile={currentUser} />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/events" element={<Events role={userRole} />} />
            <Route path="/community" element={<Community role={userRole} profile={currentUser} />} />
            <Route path="/profile" element={<Profile profile={currentUser} />} />
            <Route
              path="/network"
              element={
                <RoleGuard allowedRoles={[UserRole.PROFESSIONNEL, UserRole.ADMIN]} userRole={userRole}>
                  <ProNetwork />
                </RoleGuard>
              }
            />
            <Route
              path="/admin"
              element={
                <RoleGuard allowedRoles={[UserRole.ADMIN]} userRole={userRole}>
                  <Admin />
                </RoleGuard>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
        <ChatWidget />
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;

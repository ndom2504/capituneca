import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, Award, CheckCircle } from 'lucide-react';
import { UserRole } from '../types';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  targetPath: string; // Route vers laquelle rediriger
  reward: number;
  actionLabel: string;
}

const STEPS: Record<UserRole, OnboardingStep[]> = {
  [UserRole.PARTICULIER]: [
    {
      id: 0,
      title: "Bienvenue sur Capitune !",
      description: "Votre espace candidat sécurisé pour réussir votre immigration. Commençons par configurer votre profil.",
      targetPath: "/profile",
      reward: 50,
      actionLabel: "Configurer mon profil"
    },
    {
      id: 1,
      title: "Documents de Vérification",
      description: "Pour valider votre identité, vous devez télécharger une pièce d'identité officielle.",
      targetPath: "/profile",
      reward: 100,
      actionLabel: "Aller aux documents"
    },
    {
      id: 2,
      title: "Explorez le Marché",
      description: "Trouvez un expert certifié pour vous accompagner dans vos démarches.",
      targetPath: "/market",
      reward: 20,
      actionLabel: "Voir les experts"
    }
  ],
  [UserRole.PROFESSIONNEL]: [
    {
      id: 0,
      title: "Bienvenue Expert !",
      description: "Votre espace de pratique certifiée. Complétez votre profil professionnel pour être visible.",
      targetPath: "/profile",
      reward: 50,
      actionLabel: "Compléter ma fiche"
    },
    {
      id: 1,
      title: "Accréditation",
      description: "Téléchargez votre preuve d'accréditation (CRIC/Barreau) pour activer votre statut.",
      targetPath: "/profile",
      reward: 200,
      actionLabel: "Accréditation"
    }
  ],
  [UserRole.PARTENAIRE]: [],
  [UserRole.ADMIN]: []
};

interface OnboardingGuideProps {
  step: number;
  role: UserRole;
  onCompleteStep: (stepId: number, points: number) => void;
  onSkip: () => void;
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ step, role, onCompleteStep, onSkip }) => {
  const navigate = useNavigate();
  const currentSteps = STEPS[role] || [];
  const activeStep = currentSteps.find(s => s.id === step);

  if (!activeStep) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-10 fade-in duration-700">
      <div className="w-80 bg-white/90 backdrop-blur-xl border border-cm-purple/20 rounded-2xl shadow-2xl shadow-cm-purple/10 overflow-hidden relative">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
          <div 
            className="h-full bg-cm-purple transition-all duration-500"
            style={{ width: `${((step + 1) / currentSteps.length) * 100}%` }}
          />
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-cm-purple/10 rounded-lg">
              <Award className="text-cm-purple" size={20} />
            </div>
            <button 
              onClick={onSkip}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <h3 className="text-lg font-bold text-cm-navy mb-2">
            {activeStep.title}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            {activeStep.description}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cm-purple flex items-center gap-1">
              + {activeStep.reward} PTS
            </span>
            <button
              onClick={() => {
                onCompleteStep(activeStep.id, activeStep.reward);
                try {
                  navigate(activeStep.targetPath);
                } catch {
                  // Fallback si jamais le routeur n'est pas disponible
                  window.location.hash = `#${activeStep.targetPath}`;
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-cm-purple text-white text-xs font-bold uppercase tracking-wide rounded-lg hover:bg-cm-purple-dark transition-colors shadow-lg shadow-cm-purple/20"
            >
              {activeStep.actionLabel}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingGuide;

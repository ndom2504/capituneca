
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Bell,
  Trophy,
  Star,
  Target,
  Award,
  X,
  Sparkles,
  Zap,
  ShieldCheck,
  User as UserIcon,
  Building2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { UserRole, Notification, UserProfile } from '../types';
import { userService } from '../services/user.service';

const data = [
  { name: 'Lun', dossiers: 4 },
  { name: 'Mar', dossiers: 7 },
  { name: 'Mer', dossiers: 5 },
  { name: 'Jeu', dossiers: 9 },
  { name: 'Ven', dossiers: 12 },
  { name: 'Sam', dossiers: 8 },
  { name: 'Dim', dossiers: 6 },
];

const Dashboard: React.FC<{ role: UserRole; profile?: UserProfile }> = ({ role, profile: userProfile }) => {
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = React.useState(false);
  // Utiliser le profil passé en props ou fallback sur sync (pour compatibilité)
  const profile = userProfile || userService.getCurrentProfileSync(role);
  const [notifs] = React.useState<Notification[]>([
    { id: '1', title: 'Accréditation validée', message: 'Vos documents ont été acceptés par le conseil.', isRead: false, type: 'success', timestamp: '10m', path: '/profile' },
    { id: '2', title: 'Consultation', message: 'Une nouvelle demande de RDV est en attente.', isRead: false, type: 'info', timestamp: '1h', path: '/market' },
  ]);

  const handleOpenAIChat = () => {
    const event = new CustomEvent('open-capitune-chat', { 
      detail: { message: "Analyse mon tableau de bord actuel." } 
    });
    window.dispatchEvent(event);
  };

  const getSpaceConfig = () => {
    switch (role) {
      case UserRole.PARTICULIER:
        return { 
          label: "Espace Candidat Sécurisé", 
          icon: UserIcon, 
          color: "bg-green-500", 
          desc: "Gestion de votre parcours d'immigration" 
        };
      case UserRole.PROFESSIONNEL:
        return { 
          label: "Espace Expert Certifié", 
          icon: ShieldCheck, 
          color: "bg-cm-purple", 
          desc: "Supervision des mandats CRIC" 
        };
      case UserRole.PARTENAIRE:
        return { 
          label: "Espace Institutionnel Actif", 
          icon: Building2, 
          color: "bg-cm-gold", 
          desc: "Portail organisationnel Capitune" 
        };
      case UserRole.ADMIN:
        return { 
          label: "Console de Haute Gouvernance", 
          icon: Zap, 
          color: "bg-red-500", 
          desc: "Contrôle global du système" 
        };
      default:
        return { 
          label: "Espace Utilisateur", 
          icon: UserIcon, 
          color: "bg-slate-400", 
          desc: "Accès standard" 
        };
    }
  };

  const space = getSpaceConfig();

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-light tracking-tight text-cm-black">
            Bienvenue, <span className="font-semibold text-cm-purple">{profile.fullName.split(' ')[0]}</span>
          </h2>
          <div className="flex items-center gap-2 group cursor-help">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${space.color}`}></span>
            <p className="text-[10px] font-bold text-cm-grey-fine uppercase tracking-widest">
              {space.label}
            </p>
            <span className="h-2 w-[1px] bg-slate-200"></span>
            <p className="text-[10px] font-light text-slate-400 italic">
              {space.desc}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Bouton IA - Plus sobre et explicite */}
          <button 
            onClick={handleOpenAIChat}
            className="group relative flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-cm-black text-[10px] font-bold uppercase tracking-widest rounded-full transition-all hover:border-cm-purple hover:bg-slate-50 shadow-sm overflow-hidden"
          >
            <Sparkles size={14} className="text-cm-purple group-hover:scale-110 transition-transform" />
            <span>Assistant IA</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cm-purple/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowNotifs(!showNotifs)}
              className={`p-2.5 border rounded-full transition-all ${showNotifs ? 'bg-cm-purple border-cm-purple text-white shadow-glow-purple' : 'bg-white border-slate-200 text-slate-400 hover:border-cm-purple hover:text-cm-purple'}`}
            >
              <Bell size={18} strokeWidth={1.5} />
              {notifs.some(n => !n.isRead) && <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white animate-pulse"></span>}
            </button>
            {showNotifs && (
              <div className="absolute right-0 mt-4 w-72 glass-card rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 border border-slate-100">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="text-[9px] font-bold uppercase tracking-widest text-cm-grey-fine">Alertes</h4>
                  <button onClick={() => setShowNotifs(false)} aria-label="Fermer les notifications"><X size={12} /></button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifs.map(n => (
                    <div key={n.id} onClick={() => {setShowNotifs(false); if(n.path) navigate(n.path);}} className="p-4 border-b border-slate-50 hover:bg-cm-purple-light/30 cursor-pointer transition-colors">
                      <p className="text-[11px] font-bold">{n.title}</p>
                      <p className="text-[10px] font-light text-cm-grey-fine mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-gradient-to-br from-cm-purple to-cm-blue-hover p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-cm-purple/10 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl transition-transform group-hover:scale-150 duration-1000"></div>
           <div className="space-y-4 flex-1 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-bold uppercase tracking-widest text-white border border-white/10">
                <Target size={12} /> Objectif Prestige
              </div>
              <h3 className="text-2xl font-light text-white leading-tight">
                {role === UserRole.PARTICULIER ? "Réussite de votre" : "Performance"} <span className="font-semibold">{role === UserRole.PARTICULIER ? "Immigration" : "Gouvernementale"}</span>
              </h3>
              <p className="text-sm text-white/80 font-light leading-relaxed max-w-sm">
                {role === UserRole.PARTICULIER 
                  ? "Suivez l'avancement de vos démarches et interagissez avec des experts certifiés pour garantir votre succès."
                  : "Votre autorité est mesurée par la qualité de vos interactions et la complétude de vos dossiers certifiés."}
              </p>
           </div>
           <div className="w-20 h-20 flex items-center justify-center bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative z-10 group-hover:rotate-6 transition-transform">
              <Trophy size={40} strokeWidth={1} className="text-white opacity-90" />
           </div>
        </div>

        <div className="space-y-4">
           <h3 className="text-[10px] font-bold uppercase tracking-widest text-cm-grey-fine">Objectifs Mauve</h3>
           {[
             { title: role === UserRole.PARTICULIER ? 'Profil Complété' : 'Certification Gouvernance', reward: 500, icon: Award, progress: 85, color: '#7C3AED' },
             { title: role === UserRole.PARTICULIER ? 'Documents Validés' : 'Conformité Réglementaire', reward: 200, icon: Star, progress: 60, color: '#C5A059' }
           ].map((mission, i) => (
             <div key={i} className="p-5 glass-card border border-slate-100 rounded-2xl hover:border-cm-purple/30 transition-all group cursor-pointer">
               <div className="flex items-center justify-between mb-3">
                 <mission.icon size={18} strokeWidth={1.5} className="text-slate-300 group-hover:text-cm-purple transition-colors" />
                 <span className="text-[9px] font-bold text-cm-navy">+{mission.reward} PTS</span>
               </div>
               <p className="text-xs font-medium mb-2">{mission.title}</p>
               <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                 {/* eslint-disable-next-line react/forbid-dom-props */}
                 <div 
                   className="h-full transition-all duration-1000" 
                   style={{ 
                     width: `${mission.progress}%`, 
                     backgroundColor: mission.color 
                   }}
                 />
               </div>
             </div>
           ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Dossiers Actifs', value: '14', icon: Clock, color: 'text-cm-navy' },
          { label: role === UserRole.PARTICULIER ? 'Documents' : 'Accréditations', value: '08', icon: CheckCircle2, color: 'text-cm-purple' },
          { label: 'Notifications', value: '02', icon: AlertCircle, color: 'text-red-500' },
          { label: role === UserRole.PARTICULIER ? 'Avancement' : 'Score Intégrité', value: role === UserRole.PARTICULIER ? '65%' : '98%', icon: TrendingUp, color: 'text-cm-blue-nav' },
        ].map((stat, i) => (
          <div key={i} className="p-8 glass-card border border-slate-100 rounded-[2rem] hover:border-cm-purple/50 hover:shadow-xl hover:shadow-cm-purple/5 transition-all group">
            <stat.icon className={`mb-4 ${stat.color} opacity-40 group-hover:opacity-100 transition-all group-hover:scale-110`} size={24} strokeWidth={1} />
            <p className="text-[9px] font-bold text-cm-grey-fine uppercase tracking-widest">{stat.label}</p>
            <p className="text-3xl font-light mt-1 text-cm-black">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-cm-grey-fine">Volume Transactionnel</h3>
            <span className="text-[9px] font-bold text-cm-purple uppercase tracking-tighter">Monitorage Temps Réel</span>
          </div>
          <div className="h-64 w-full p-6 glass-card border border-slate-100 rounded-[2rem]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    backgroundColor: '#1A1A1A', 
                    color: '#fff', 
                    fontSize: '10px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)'
                  }} 
                />
                <Area type="monotone" dataKey="dossiers" stroke="#7C3AED" strokeWidth={2} fillOpacity={1} fill="url(#colorPurple)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-cm-grey-fine">Référents Certifiés</h3>
          <div className="space-y-3">
             {[
               { name: 'Dr. Sarah Tremblay', score: 98, img: 'e1' },
               { name: 'Marc-André Dubois', score: 95, img: 'e2' }
             ].map((expert, i) => (
               <div key={i} className="p-4 glass-card border border-slate-100 rounded-2xl hover:border-cm-purple/50 transition-all flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/directory')}>
                 <div className="w-10 h-10 rounded-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all border border-slate-100 ring-2 ring-transparent group-hover:ring-cm-purple/10">
                   <img src={`https://picsum.photos/seed/${expert.img}/40/40`} alt="" />
                 </div>
                 <div className="flex-1">
                   <h4 className="text-xs font-medium dark:text-zinc-800">{expert.name}</h4>
                   <p className="text-[9px] text-cm-purple font-bold uppercase tracking-tighter mt-0.5">Elite • {expert.score}%</p>
                 </div>
                 <ArrowRight size={14} className="text-slate-300 group-hover:text-cm-purple group-hover:translate-x-1 transition-all" />
               </div>
             ))}
             <button onClick={() => navigate('/directory')} className="w-full py-4 text-[9px] font-bold uppercase tracking-widest text-cm-grey-fine hover:text-cm-purple transition-colors border border-dashed border-slate-200 rounded-2xl">
               Voir l'annuaire complet
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

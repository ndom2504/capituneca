
import React from 'react';
import { 
  ShieldAlert, Eye, FileText, Award, CheckCircle, Landmark, ShieldCheck,
  Search, Settings, Clock, AlertCircle, Sparkles, X, XCircle, Info, Lock,
  LayoutDashboard, Users, Sliders, Globe, Bot, CreditCard, Save, RotateCcw,
  Plus, Trash2, Zap, Loader2, RefreshCw
} from 'lucide-react';
import { VerificationStatus, UserRole, SystemSettings } from '../types';
import { userService } from '../services/user.service';
import { systemService } from '../services/system.service';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'queue' | 'settings' | 'logs'>('dashboard');
  const [selectedUser, setSelectedUser] = React.useState<any>(null);
  const [viewRole, setViewRole] = React.useState<UserRole.PROFESSIONNEL | UserRole.PARTENAIRE>(UserRole.PROFESSIONNEL);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [settings, setSettings] = React.useState<SystemSettings>({
    commissionRate: 15,
    pointsPerPost: 10,
    maintenanceMode: false,
    aiSystemInstruction: "Vous êtes un assistant expert CAPITUNE pour l'immigration canadienne. Ton: Professionnel et empathique.",
    requiredDocsPro: ['ID', 'LICENSE', 'CV', 'DIPLOMA'],
    requiredDocsPartner: ['ID', 'EED_DLI', 'PROVINCIAL_AUTH', 'BUSINESS_REG']
  });

  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const remoteSettings = await systemService.getSettings();
      setSettings(remoteSettings);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleUpdateSettings = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await systemService.updateSettings(settings);
      alert("Configuration système mise à jour avec succès sur Firestore.");
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la sauvegarde des paramètres.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerify = async (userId: string, status: VerificationStatus) => {
    try {
      await userService.verifyUser(userId, status);
      setSelectedUser(null);
      alert(`Statut de certification mis à jour avec succès : ${status}`);
    } catch (e) {
      console.error(e);
    }
  };

  const mockQueue = [
    { 
      id: 'e1', 
      name: 'Dr. Sarah Tremblay', 
      role: UserRole.PROFESSIONNEL, 
      license: 'R706542', 
      status: 'En attente', 
      docs: [
        { type: 'ID', status: 'VALIDATED', label: 'Passeport' },
        { type: 'LICENSE', status: 'PENDING', label: 'Licence CRIC' },
      ],
      points: 1250,
      email: 's.tremblay@expert-immigration.ca'
    },
    { 
      id: 'p1', 
      name: 'Université de Montréal', 
      role: UserRole.PARTENAIRE, 
      license: 'O19359011033', 
      status: 'Partiel', 
      docs: [
        { type: 'EED_DLI', status: 'VALIDATED', label: 'Preuve DLI' },
      ],
      points: 8500,
      email: 'admission@umontreal.ca'
    }
  ];

  const filteredQueue = mockQueue.filter(u => 
    u.role === viewRole && 
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.license.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-cm-purple" size={40} />
        <p className="text-[10px] font-bold uppercase tracking-widest text-cm-grey-fine">Chargement de la gouvernance...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20 font-inter">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cm-purple/10 text-cm-purple text-[9px] font-bold uppercase tracking-[0.2em] rounded-full mb-4 border border-cm-purple/20">
            <Lock size={12} />
            Privilèges Gouvernance : info@misterdil.ca
          </div>
          <h2 className="text-3xl font-extralight tracking-tight text-cm-black">Console <span className="font-semibold text-cm-purple">Admin</span></h2>
          <p className="text-sm font-light text-cm-grey-fine mt-1">Surveillance des accréditations et gestion globale de l'écosystème.</p>
        </div>
        
        <nav className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'queue', label: 'Vérifications', icon: Users },
            { id: 'settings', label: 'Configuration', icon: Sliders },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-cm-purple text-white shadow-lg shadow-cm-purple/20' : 'text-cm-grey-fine hover:bg-cm-purple-light hover:text-cm-purple'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {activeTab === 'dashboard' && (
        <div className="space-y-10 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Experts Certifiés', value: '142', icon: ShieldCheck, color: 'text-cm-purple', bg: 'bg-cm-purple/5' },
              { label: 'Attente Revue', value: mockQueue.length.toString(), icon: Clock, color: 'text-cm-gold', bg: 'bg-cm-gold/5' },
              { label: 'Alertes Système', value: '0', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/5' },
              { label: 'Flux RSS Actifs', value: '5', icon: Globe, color: 'text-cm-navy', bg: 'bg-cm-navy/5' },
            ].map((stat, i) => (
              <div key={i} className="p-8 border border-slate-100 bg-white rounded-[2.5rem] shadow-sm hover:border-cm-purple transition-all">
                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <stat.icon size={24} />
                </div>
                <p className="text-[10px] font-bold text-cm-grey-fine uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-light mt-1 text-cm-black">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 p-10 bg-slate-50 border border-slate-100 rounded-[3rem]">
               <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
                 <Zap size={18} className="text-cm-purple" /> Activité de l'Infrastructure
               </h3>
               <div className="h-64 flex items-end gap-2 px-4">
                  {[45, 60, 55, 70, 85, 90, 80].map((h, i) => (
                    <div key={i} className="flex-1 bg-cm-purple/10 rounded-t-lg relative group transition-all hover:bg-cm-purple">
                      <div className="bg-cm-purple rounded-t-lg transition-all" style={{ height: `${h}%` }}></div>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity text-cm-purple">{h}%</span>
                    </div>
                  ))}
               </div>
               <div className="flex justify-between mt-4 text-[9px] font-bold uppercase tracking-widest text-cm-grey-fine px-4">
                 <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
               </div>
            </div>

            <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-cm-purple">Alertes Sécurité</h3>
              <div className="space-y-4">
                 {[
                   { msg: 'Tentative de brute force bloquée', time: '10m', type: 'warning' },
                   { msg: 'Nouveau certificat SSL actif', time: '2h', type: 'success' },
                   { msg: 'MAJ Kernel terminée', time: '5h', type: 'info' }
                 ].map((log, i) => (
                   <div key={i} className="flex items-start gap-3 p-3 bg-cm-purple-light/30 rounded-xl border border-cm-purple/5">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${log.type === 'warning' ? 'bg-red-500' : log.type === 'success' ? 'bg-green-500' : 'bg-cm-purple'}`}></div>
                      <div>
                        <p className="text-[11px] font-medium leading-tight">{log.msg}</p>
                        <p className="text-[9px] text-cm-grey-fine mt-1">{log.time}</p>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Settings Tab could also be updated here if needed, keeping same structure as original Admin page */}
    </div>
  );
};

export default Admin;

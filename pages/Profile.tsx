
import React from 'react';
import { 
  User, Mail, Shield, Edit3, Save, Globe, EyeOff, Trophy, Zap, Star, 
  Briefcase, Landmark, Fingerprint, CheckCircle, AlertCircle, Sparkles,
  ArrowRight, ShieldCheck, Camera, Image as ImageIcon, UploadCloud,
  FileText, IdCard, GraduationCap, History, Loader2, FileCheck, Building2,
  BookOpen, Building, Search, Award, ChevronRight, Clock
} from 'lucide-react';
import { UserProfile, UserRole, ExpertBadge, VerificationStatus, DocumentStatus, VerificationDocument } from '../types';
import { userService } from '../services/user.service';

const Profile: React.FC<{ profile: UserProfile }> = ({ profile: initialProfile }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [profile, setProfile] = React.useState(initialProfile);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState<string | null>(null);

  // Mettre à jour l'état interne si le profil change depuis le parent (App)
  React.useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);
  
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const bannerInputRef = React.useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setIsSubmitting(true);
    await userService.updateProfile(profile);
    setIsEditing(false);
    setIsSubmitting(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: VerificationDocument['type']) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(docType);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const res = await userService.submitDocument(profile.id, docType, base64);
      
      if (res.success) {
        const newDocs = [...(profile.documents || [])];
        const index = newDocs.findIndex(d => d.type === docType);
        if (index > -1) {
          newDocs[index] = { type: docType, status: res.status, url: base64, uploadedAt: 'Aujourd\'hui' };
        } else {
          newDocs.push({ type: docType, status: res.status, url: base64, uploadedAt: 'Aujourd\'hui' });
        }
        setProfile({ ...profile, documents: newDocs, verificationStatus: VerificationStatus.PENDING });
      }
      setIsUploading(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'avatar') {
          setProfile({ ...profile, avatar: base64String });
        } else {
          setProfile({ ...profile, bannerUrl: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getDocStatusIcon = (type: VerificationDocument['type']) => {
    const doc = profile.documents?.find(d => d.type === type);
    if (!doc || doc.status === DocumentStatus.MISSING) return <UploadCloud size={16} className="text-gray-300" />;
    if (doc.status === DocumentStatus.PENDING) return <Loader2 size={16} className="text-orange-400 animate-spin" />;
    if (doc.status === DocumentStatus.VALIDATED) return <CheckCircle size={16} className="text-green-500" />;
    return <AlertCircle size={16} className="text-red-500" />;
  };

  const getDocStatusLabel = (type: VerificationDocument['type']) => {
    const doc = profile.documents?.find(d => d.type === type);
    if (!doc || doc.status === DocumentStatus.MISSING) return 'À téléverser';
    if (doc.status === DocumentStatus.PENDING) return 'Révision en cours';
    if (doc.status === DocumentStatus.VALIDATED) return 'Validé';
    return 'Rejeté';
  };

  const isProOrPartner = profile.role === UserRole.PROFESSIONNEL || profile.role === UserRole.PARTENAIRE;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in duration-1000">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extralight tracking-tight dark:text-white">Identité <span className="font-medium text-cm-gold">Numérique</span></h2>
          <p className="text-sm font-light text-fine-grey mt-1">Écosystème certifié Capitune : Gérer votre autorité et vos accréditations.</p>
        </div>
        <div className="flex gap-4">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-2 border border-slate-200 dark:border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:border-cm-gold transition-all dark:text-white">
              <Edit3 size={14} /> Éditer
            </button>
          ) : (
            <button onClick={handleSave} disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 bg-cm-gold text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-50 shadow-lg shadow-cm-gold/20">
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {isSubmitting ? 'Enregistrement...' : 'Sauvegarder'}
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="h-44 relative group">
              {profile.bannerUrl ? (
                <img src={profile.bannerUrl} alt="Banner" className="w-full h-full object-cover grayscale opacity-40" />
              ) : (
                <div className="w-full h-full bg-slate-50 dark:bg-zinc-800/50"></div>
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => bannerInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-zinc-900/90 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg hover:scale-105 transition-transform">
                    <ImageIcon size={14} /> Changer le décor
                  </button>
                  <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
                </div>
              )}
              <div className="absolute -bottom-12 left-10">
                <div className="relative">
                  <div className="p-1 bg-white dark:bg-zinc-900 rounded-full shadow-xl">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt={profile.fullName} className="w-24 h-24 rounded-full object-cover grayscale" />
                    ) : (
                      <div className="w-24 h-24 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-slate-300 dark:text-zinc-600 text-3xl font-light">
                        {profile.fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <button onClick={() => avatarInputRef.current?.click()} className="absolute bottom-0 right-0 p-2 bg-cm-gold text-white rounded-full shadow-xl hover:scale-110 transition-transform">
                      <Camera size={14} />
                    </button>
                  )}
                  <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                </div>
              </div>
            </div>

            <div className="pt-16 p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-fine-grey">Dénomination</label>
                  {isEditing ? (
                    <input type="text" value={profile.fullName} onChange={(e) => setProfile({...profile, fullName: e.target.value})} className="w-full p-2 border-b border-slate-100 dark:border-white/5 focus:outline-none focus:border-cm-gold font-light bg-transparent dark:text-white" />
                  ) : (
                    <p className="text-lg font-light flex items-center gap-2 dark:text-zinc-200">{profile.fullName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-fine-grey">Identité Numérique</label>
                  <p className="text-lg font-light text-fine-grey flex items-center gap-2">{profile.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-fine-grey">Mission Institutionnelle</label>
                {isEditing ? (
                  <textarea value={profile.bio || ''} onChange={(e) => setProfile({...profile, bio: e.target.value})} rows={3} className="w-full p-4 border border-slate-100 dark:border-white/5 rounded-2xl focus:outline-none focus:border-cm-gold font-light text-sm bg-transparent dark:text-white resize-none" />
                ) : (
                  <p className="text-sm font-light text-fine-grey leading-relaxed italic">"{profile.bio || "Aucune description institutionnelle enregistrée."}"</p>
                )}
              </div>

              {/* Barre de progression de certification (NOUVEAU) */}
              {isProOrPartner && (
                <div className="p-6 bg-slate-50 dark:bg-zinc-950/50 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest dark:text-white">Route vers la Certification</h4>
                    <span className="text-[10px] font-bold text-cm-gold">75% Complété</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cm-gold transition-all duration-1000" style={{ width: '75%' }}></div>
                  </div>
                  <div className="flex gap-4">
                     <div className="flex items-center gap-1.5 opacity-100">
                        <CheckCircle size={12} className="text-green-500" />
                        <span className="text-[9px] font-bold text-fine-grey uppercase">Docs Identité</span>
                     </div>
                     <div className="flex items-center gap-1.5 opacity-100">
                        <CheckCircle size={12} className="text-green-500" />
                        <span className="text-[9px] font-bold text-fine-grey uppercase">Accréditation</span>
                     </div>
                     <div className="flex items-center gap-1.5 opacity-40">
                        <Clock size={12} className="text-orange-500" />
                        <span className="text-[9px] font-bold text-fine-grey uppercase">Validation Admin</span>
                     </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Verification Center */}
          {isProOrPartner && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/10 rounded-[2.5rem] p-10 space-y-8 animate-in slide-in-from-bottom-4 duration-1000">
               <div className="flex items-center gap-3">
                 <div className="p-3 bg-cm-navy dark:bg-white dark:text-black rounded-2xl text-white">
                   <ShieldCheck size={20} />
                 </div>
                 <div>
                   <h3 className="text-lg font-medium dark:text-white">Centre d'Accréditation Institutionnel</h3>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-fine-grey">Soumettez vos preuves de conformité pour obtenir vos badges.</p>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {(profile.role === UserRole.PARTENAIRE ? [
                   { type: 'ID', label: 'ID Représentant', icon: IdCard, desc: 'Identité du signataire autorisé' },
                   { type: 'EED_DLI', label: 'Numéro EED / DLI', icon: BookOpen, desc: 'Reconnaissance permis d\'études' },
                   { type: 'PROVINCIAL_AUTH', label: 'Accréditation Provinciale', icon: Building, desc: 'Reconnaissance Ministérielle' },
                   { type: 'BUSINESS_REG', label: 'Numéro ISDE (NE)', icon: Search, desc: 'Vérification registre entreprises' },
                 ] : [
                   { type: 'ID', label: 'Pièce d\'identité', icon: IdCard, desc: 'Passeport ou CNI valide' },
                   { type: 'DIPLOMA', label: 'Diplômes & Certificats', icon: GraduationCap, desc: 'Qualifications académiques' },
                   { type: 'CV', label: 'Curriculum Vitae', icon: History, desc: 'Détail de l\'expérience pro' },
                   { type: 'LICENSE', label: 'Accréditation CRIC', icon: FileCheck, desc: 'Licence gouvernementale active' },
                 ]).map((doc) => (
                   <div key={doc.type} className="group p-5 bg-slate-50/30 dark:bg-zinc-900/50 border border-slate-100/50 dark:border-white/5 rounded-2xl hover:border-cm-gold transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-cm-gold transition-colors">
                             <doc.icon size={20} />
                           </div>
                           <div>
                             <p className="text-xs font-medium dark:text-zinc-200">{doc.label}</p>
                             <p className="text-[9px] text-fine-grey font-light leading-tight">{doc.desc}</p>
                           </div>
                        </div>
                        <div className="shrink-0">
                          {getDocStatusIcon(doc.type as any)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-fine-grey">
                          {getDocStatusLabel(doc.type as any)}
                        </span>
                        <label className="cursor-pointer">
                          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, doc.type as any)} disabled={isUploading !== null} />
                          <span className={`text-[10px] font-bold uppercase tracking-widest text-cm-gold hover:text-cm-gold-dark ${isUploading ? 'opacity-30 cursor-not-allowed' : ''}`}>
                            Téléverser
                          </span>
                        </label>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>

        {/* Sidebar Badges & Reputation */}
        <div className="space-y-8">
           <div className="p-8 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/10 rounded-[2.5rem] shadow-sm space-y-8">
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-fine-grey mb-6">Autorité Communautaire</h4>
                <div className="flex items-end justify-between">
                   <div className="flex items-center gap-2">
                     <Sparkles size={24} className="text-cm-gold" />
                     <p className="text-4xl font-light dark:text-white">{profile.points || 0}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-green-500">Top 5%</p>
                   </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-50 dark:border-white/5 space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-fine-grey">Badges d'Excellence</h4>
                
                {/* Visualisation des paliers de badges */}
                <div className="space-y-4">
                  {[
                    { level: 'Bronze', target: 1000, color: 'text-orange-400', unlocked: (profile.points || 0) >= 1000 },
                    { level: 'Argent', target: 2500, color: 'text-slate-400', unlocked: (profile.points || 0) >= 2500 },
                    { level: 'Or', target: 5000, color: 'text-cm-gold', unlocked: (profile.points || 0) >= 5000 },
                  ].map(b => (
                    <div key={b.level} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${b.unlocked ? 'bg-slate-50 dark:bg-zinc-800/50 border-cm-gold/20' : 'bg-transparent border-slate-100 dark:border-white/5 opacity-40 grayscale'}`}>
                       <div className="flex items-center gap-3">
                          <Award size={20} className={b.color} />
                          <span className="text-[10px] font-bold uppercase tracking-widest dark:text-zinc-300">{b.level}</span>
                       </div>
                       {!b.unlocked && <span className="text-[9px] font-light text-fine-grey">{profile.points}/{b.target} pts</span>}
                       {b.unlocked && <CheckCircle size={14} className="text-cm-gold" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-cm-navy text-white rounded-2xl space-y-3">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-cm-gold">Impact Référent</p>
                 <p className="text-[11px] font-light text-slate-400 leading-relaxed italic">
                   "En guidant les membres, vous accumulez des points d'autorité nécessaires pour le badge Or."
                 </p>
                 <button onClick={() => window.location.hash = '#/community'} className="text-[9px] font-bold uppercase flex items-center gap-1 hover:text-cm-gold transition-colors">
                   Aider la communauté <ChevronRight size={10} />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

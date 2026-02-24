
import React from 'react';
import { 
  Star, ShieldCheck, MapPin, Search, Award, Loader2, 
  Sparkles, Filter, X, Calendar, Clock, Video, 
  ChevronRight, MessageCircle, Info, Landmark, Building2,
  GraduationCap, Briefcase, ExternalLink, Globe, School, Building, User
} from 'lucide-react';
import { ExpertBadge, UserProfile, UserRole, VerificationStatus } from '../types';
import { userService } from '../services/user.service';

type DirectoryFilter = 'ALL' | UserRole.PROFESSIONNEL | 'SCHOOL' | 'EMPLOYER';

const Directory: React.FC = () => {
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [lastId, setLastId] = React.useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = React.useState(true);
  
  // États pour le filtrage
  const [searchTerm, setSearchTerm] = React.useState('');
  const [provinceFilter, setProvinceFilter] = React.useState('All');
  const [roleFilter, setRoleFilter] = React.useState<DirectoryFilter>('ALL');

  // États pour les Modals
  const [selectedUser, setSelectedUser] = React.useState<UserProfile | null>(null);
  const [bookingExpert, setBookingExpert] = React.useState<UserProfile | null>(null);
  const [selectedDate, setSelectedDate] = React.useState('');
  const [selectedTime, setSelectedTime] = React.useState('');

  const loadUsers = React.useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const serviceRoleFilter = (roleFilter === 'SCHOOL' || roleFilter === 'EMPLOYER') 
        ? UserRole.PARTENAIRE 
        : (roleFilter === 'ALL' ? 'ALL' : roleFilter as UserRole);

      const result = await userService.getPublicUsersPaginated(
        12, 
        isInitial ? undefined : lastId,
        serviceRoleFilter as any
      );

      let filteredData = result.data;
      if (roleFilter === 'SCHOOL') {
        filteredData = result.data.filter(u => !!u.dliNumber);
      } else if (roleFilter === 'EMPLOYER') {
        filteredData = result.data.filter(u => !!u.businessNumber);
      }

      setUsers(prev => isInitial ? filteredData : [...prev, ...filteredData]);
      setLastId(result.lastId);
      setHasMore(result.hasMore);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastId, roleFilter]);

  React.useEffect(() => {
    loadUsers(true);
  }, [roleFilter]);

  const filteredUsers = React.useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           user.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProvince = provinceFilter === 'All' || user.province === provinceFilter;
      return matchesSearch && matchesProvince;
    });
  }, [users, searchTerm, provinceFilter]);

  const handleBooking = () => {
    setTimeout(() => {
      setBookingExpert(null);
      setSelectedDate('');
      setSelectedTime('');
      alert(`Votre demande a été transmise avec succès au référent Capitune !`);
    }, 1500);
  };

  const getUserTypeInfo = (user: UserProfile) => {
    if (user.role === UserRole.PROFESSIONNEL) {
      return { 
        label: 'Expert CRIC', 
        icon: ShieldCheck, 
        color: 'text-blue-500', 
        bg: 'bg-blue-500/10',
        idLabel: 'Licence',
        idValue: user.licenseNumber 
      };
    }
    if (user.dliNumber) {
      return { 
        label: 'Établissement EED', 
        icon: GraduationCap, 
        color: 'text-cm-gold', 
        bg: 'bg-cm-gold/10',
        idLabel: 'DLI',
        idValue: user.dliNumber 
      };
    }
    return { 
      label: 'Employeur', 
      icon: Briefcase, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10',
      idLabel: 'ISDE',
      idValue: user.businessNumber 
    };
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-1000">
      <header>
        <h2 className="text-3xl font-extralight tracking-tight dark:text-white italic">Annuaire <span className="font-medium not-italic">Capitune</span></h2>
        <p className="text-sm font-light text-fine-grey mt-1">Écosystème certifié : connectez-vous aux institutions et aux experts du Canada.</p>
      </header>

      {/* Barre de recherche et filtres */}
      <div className="space-y-6 sticky top-0 z-20 py-4 bg-cm-grey/95 dark:bg-[#05070A]/95 backdrop-blur-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-zinc-700" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher par nom, spécialité ou institution..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-100 dark:border-white/5 rounded-xl font-light text-sm focus:outline-none focus:border-cm-gold transition-all bg-white dark:bg-zinc-900 dark:text-white shadow-sm"
            />
          </div>
          
          <div className="md:w-56 relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-zinc-700 pointer-events-none" size={16} />
            <select 
              value={provinceFilter}
              onChange={(e) => setProvinceFilter(e.target.value)}
              className="w-full pl-12 pr-10 py-3 border border-slate-100 dark:border-white/5 rounded-xl font-light text-sm focus:outline-none focus:border-cm-gold transition-all bg-white dark:bg-zinc-900 dark:text-white shadow-sm appearance-none cursor-pointer"
            >
              <option value="All">Toutes les provinces</option>
              <option value="Québec">Québec</option>
              <option value="Ontario">Ontario</option>
              <option value="Nouveau-Brunswick">Nouveau-Brunswick</option>
            </select>
          </div>
        </div>

        {/* Sélecteur de Rôle Raffiné */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'ALL', label: 'Tout voir', icon: Globe },
            { id: UserRole.PROFESSIONNEL, label: 'Experts CRIC', icon: ShieldCheck },
            { id: 'SCHOOL', label: 'Écoles & Universités', icon: GraduationCap },
            { id: 'EMPLOYER', label: 'Employeurs', icon: Building2 }
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRoleFilter(r.id as DirectoryFilter)}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                roleFilter === r.id 
                ? 'bg-cm-navy text-white border-cm-navy shadow-lg shadow-cm-navy/20' 
                : 'bg-white dark:bg-zinc-900 text-slate-400 border-slate-100 dark:border-white/5 hover:border-cm-gold hover:text-cm-gold'
              }`}
            >
              <r.icon size={14} />
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 bg-white dark:bg-zinc-900/50 animate-pulse rounded-2xl border border-slate-50 dark:border-white/5" />
          ))}
        </div>
      ) : (
        <>
          {filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => {
                const typeInfo = getUserTypeInfo(user);
                const isInstitution = user.role === UserRole.PARTENAIRE;
                
                return (
                  <div key={user.id} className="p-8 border border-slate-100 dark:border-white/5 rounded-[2rem] hover:border-cm-gold transition-all group relative overflow-hidden bg-white dark:bg-zinc-900/40 flex flex-col h-full shadow-sm hover:shadow-2xl">
                    
                    <div className="absolute top-6 right-6">
                      <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 ${typeInfo.bg} ${typeInfo.color} shadow-sm border border-current/10`}>
                        <typeInfo.icon size={12} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">{typeInfo.label}</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="relative">
                            <img src={user.avatar} alt={user.fullName} className="w-16 h-16 rounded-2xl object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all border border-slate-100 dark:border-white/10" />
                            {user.verificationStatus === VerificationStatus.CERTIFIED && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-cm-gold text-white rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-lg">
                                <Award size={12} />
                              </div>
                            )}
                         </div>
                         <div>
                            <h4 className="text-base font-medium dark:text-white leading-tight">{user.fullName}</h4>
                            <p className="text-[10px] font-bold text-cm-gold uppercase tracking-widest mt-1 line-clamp-1">{user.specialty}</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-[11px] font-light text-fine-grey">
                          <MapPin size={14} className="opacity-40" />
                          {user.province}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-light text-fine-grey">
                          <Info size={14} className="opacity-40" />
                          <span className="font-bold">{typeInfo.idLabel}:</span> {typeInfo.idValue}
                        </div>
                      </div>

                      <p className="text-[11px] text-fine-grey leading-relaxed line-clamp-2 italic">
                         {user.bio || "Partenaire stratégique vérifié sur la plateforme Capitune."}
                      </p>
                    </div>

                    <div className="mt-8 flex gap-3 pt-6 border-t border-slate-50 dark:border-white/5">
                      {isInstitution ? (
                        <>
                          <button 
                            onClick={() => user.websiteUrl ? window.open(user.websiteUrl, '_blank') : setSelectedUser(user)}
                            className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border border-slate-100 dark:border-white/10 rounded-xl hover:bg-cm-navy hover:text-white dark:hover:bg-white dark:hover:text-black transition-all dark:text-zinc-400 flex items-center justify-center gap-2"
                          >
                            <ExternalLink size={12} />
                            Site Officiel
                          </button>
                          <button 
                            onClick={() => setBookingExpert(user)}
                            className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest bg-cm-gold text-white rounded-xl hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2"
                          >
                            <User size={12} />
                            Contacter
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => setSelectedUser(user)}
                            className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border border-slate-100 dark:border-white/10 rounded-xl hover:bg-cm-navy hover:text-white dark:hover:bg-white dark:hover:text-black transition-all dark:text-zinc-400"
                          >
                            Détails
                          </button>
                          <button 
                            onClick={() => setBookingExpert(user)}
                            className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest bg-cm-navy dark:bg-white dark:text-black text-white rounded-xl hover:opacity-90 transition-all shadow-md"
                          >
                            Réserver RDV
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-24 text-center border border-dashed border-slate-200 dark:border-white/5 rounded-[3rem] bg-white dark:bg-zinc-900/10">
              <Search className="mx-auto text-slate-100 dark:text-zinc-800 mb-6" size={64} strokeWidth={1} />
              <p className="text-fine-grey text-lg font-light">Aucun profil ne correspond à vos filtres.</p>
              <button onClick={() => { setRoleFilter('ALL'); setProvinceFilter('All'); setSearchTerm(''); }} className="mt-4 text-xs font-bold text-cm-gold uppercase tracking-widest hover:underline">Réinitialiser</button>
            </div>
          )}
        </>
      )}

      {/* Modal Détails Utilisateur */}
      {selectedUser && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white dark:bg-[#05070A] rounded-[2.5rem] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-white/5">
            <div className="relative h-44 bg-cm-navy overflow-hidden">
               <div className="absolute inset-0 opacity-20 grayscale">
                  <img src={selectedUser.bannerUrl || `https://picsum.photos/seed/${selectedUser.id}/800/400`} alt="" className="w-full h-full object-cover" />
               </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="absolute top-6 right-6 p-2 bg-white/10 text-white rounded-full backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
              >
                <X size={20} />
              </button>
              <div className="absolute -bottom-12 left-10 p-1 bg-white dark:bg-[#05070A] rounded-[2rem] shadow-2xl">
                <img src={selectedUser.avatar} alt="" className="w-24 h-24 rounded-[1.5rem] object-cover" />
              </div>
            </div>
            
            <div className="pt-16 p-10 space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-light dark:text-white">{selectedUser.fullName}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold text-cm-gold uppercase tracking-[0.2em]">{selectedUser.specialty}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="text-[10px] font-bold text-fine-grey uppercase tracking-widest">{selectedUser.province}</span>
                  </div>
                </div>
                <div className="text-right">
                   <div className="flex items-center gap-2 justify-end">
                      <Sparkles size={16} className="text-cm-gold" />
                      <p className="text-2xl font-light text-black dark:text-white">{selectedUser.points || 0}</p>
                   </div>
                   <p className="text-[9px] font-bold uppercase tracking-widest text-fine-grey">Réputation</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-fine-grey">Mission Institutionnelle</h4>
                <p className="text-sm font-light text-fine-grey leading-relaxed italic">
                  "{selectedUser.bio || "Partenaire engagé pour la réussite des candidats à l'immigration canadienne via le réseau Capitune."}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-50 dark:border-white/5">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-fine-grey mb-1">Identifiant Officiel</p>
                  <p className="text-xs font-medium dark:text-zinc-200">
                    {selectedUser.dliNumber ? `EED/DLI : ${selectedUser.dliNumber}` : 
                     selectedUser.businessNumber ? `NE ISDE : ${selectedUser.businessNumber}` : 
                     `Licence CRIC : ${selectedUser.licenseNumber}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-fine-grey mb-1">Status Vérification</p>
                  <p className="text-xs font-bold text-emerald-500 uppercase tracking-tighter flex items-center justify-end gap-1">
                    <ShieldCheck size={12} /> Actif & Vérifié
                  </p>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  onClick={() => {
                    if(selectedUser.role === UserRole.PARTENAIRE && selectedUser.websiteUrl) {
                      window.open(selectedUser.websiteUrl, '_blank');
                    } else {
                      setBookingExpert(selectedUser); setSelectedUser(null);
                    }
                  }}
                  className="flex-1 py-4 bg-cm-navy dark:bg-white dark:text-black text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-cm-navy/10"
                >
                  {selectedUser.role === UserRole.PARTENAIRE ? 'Voir Site Officiel' : 'Réserver Consultation'}
                </button>
                <button 
                  onClick={() => { setBookingExpert(selectedUser); setSelectedUser(null); }}
                  className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-2xl text-fine-grey hover:text-cm-gold transition-colors"
                >
                  <MessageCircle size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Action Rapide (Booking / Contact) */}
      {bookingExpert && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white dark:bg-[#05070A] rounded-[3rem] shadow-3xl overflow-hidden border border-slate-100 dark:border-white/5">
            <div className="p-8 border-b border-slate-50 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-cm-navy rounded-2xl flex items-center justify-center text-white">
                  {bookingExpert.role === UserRole.PROFESSIONNEL ? <Calendar size={18} /> : <MessageCircle size={18} />}
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest dark:text-white">
                    {bookingExpert.role === UserRole.PARTENAIRE ? 'Contact Référent' : 'Formulaire RDV'}
                  </h3>
                  <p className="text-[10px] text-fine-grey font-light truncate max-w-[150px]">{bookingExpert.fullName}</p>
                </div>
              </div>
              <button onClick={() => setBookingExpert(null)} className="text-fine-grey hover:text-black dark:hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-10 space-y-8">
              {bookingExpert.role === UserRole.PROFESSIONNEL ? (
                <>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-fine-grey">Date souhaitée</label>
                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-zinc-900 border-none rounded-2xl text-sm font-light dark:text-white focus:ring-1 focus:ring-cm-gold" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-fine-grey">Créneau horaire (EST)</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['09:00', '11:00', '14:00', '16:00'].map(time => (
                        <button key={time} onClick={() => setSelectedTime(time)} className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${selectedTime === time ? 'bg-cm-navy text-white border-cm-navy shadow-lg' : 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-white/10 hover:border-cm-gold'}`}>{time}</button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                   <div className="p-6 bg-slate-50 dark:bg-zinc-900 rounded-3xl space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center text-cm-gold shadow-sm">
                           <User size={18} />
                         </div>
                         <h4 className="text-xs font-medium dark:text-white">Référent : {bookingExpert.referentName || 'Agent Capitune'}</h4>
                      </div>
                      <p className="text-[11px] text-fine-grey leading-relaxed font-light italic">
                        "En tant que référent certifié de {bookingExpert.fullName} dans la communauté, je suis votre point de contact privilégié pour toute question technique ou d'admission."
                      </p>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-fine-grey">Message au référent</label>
                      <textarea 
                        placeholder="Ex: Bonjour, j'aimerais en savoir plus sur les critères d'admission..."
                        className="w-full p-4 bg-slate-50 dark:bg-zinc-900 border-none rounded-2xl text-sm font-light dark:text-white resize-none h-32"
                      />
                   </div>
                </div >
              )}
              <button 
                onClick={handleBooking}
                className="w-full py-5 bg-cm-gold text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-cm-gold-dark transition-all shadow-xl shadow-cm-gold/20 flex items-center justify-center gap-3"
              >
                {bookingExpert.role === UserRole.PARTENAIRE ? 'Envoyer au Référent' : 'Confirmer RDV'}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {hasMore && !searchTerm && provinceFilter === 'All' && (
        <div className="flex justify-center pt-12">
          <button 
            onClick={() => loadUsers()}
            disabled={loadingMore}
            className="flex items-center gap-3 px-10 py-4 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-white/5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:border-cm-gold transition-all disabled:opacity-50 dark:text-white shadow-sm"
          >
            {loadingMore ? <Loader2 className="animate-spin" size={16} /> : "Afficher plus de résultats"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Directory;

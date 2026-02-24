
import React from 'react';
import { 
  Search, Plus, MoreHorizontal, FileText, User, Loader2, 
  CheckCircle, Clock, AlertTriangle, FileDown, ArrowLeft,
  MessageSquare, Calendar, Send, Video, CreditCard,
  UserPlus, CheckCircle2, XCircle, ArrowRight
} from 'lucide-react';
import { DossierStatus, UserRole, Dossier, DocumentStatus, DossierMessage, Appointment, UserProfile } from '../types';
import { dossierService } from '../services/dossier.service';
import { userService } from '../services/user.service';

const Marketplace: React.FC<{ role: UserRole; profile?: UserProfile }> = ({ role, profile }) => {
  const [dossiers, setDossiers] = React.useState<Dossier[]>([]);
  const [selectedDossier, setSelectedDossier] = React.useState<Dossier | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [lastId, setLastId] = React.useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = React.useState(true);
  const [filter, setFilter] = React.useState<string>('Tous');
  
  // États pour la transmission (Particulier)
  const [isTransmitting, setIsTransmitting] = React.useState(false);
  const [experts, setExperts] = React.useState<UserProfile[]>([]);
  const [selectedExpertId, setSelectedExpertId] = React.useState<string | null>(null);

  // Onglets dans le détail
  const [activeTab, setActiveTab] = React.useState<'docs' | 'messages' | 'rdv'>('docs');
  
  // États pour la messagerie
  const [newMessage, setNewMessage] = React.useState('');
  const [messages, setMessages] = React.useState<DossierMessage[]>([]);
  
  // États pour les RDV
  const [selectedDate, setSelectedDate] = React.useState('');
  const [selectedTime, setSelectedTime] = React.useState('');
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);

  const loadDossiers = React.useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const result = await dossierService.getDossiersPaginated(role, 8, isInitial ? undefined : lastId);
      setDossiers(prev => isInitial ? result.data : [...prev, ...result.data]);
      setLastId(result.lastId);
      setHasMore(result.hasMore);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [role, lastId]);

  React.useEffect(() => {
    loadDossiers(true);
    if (role === UserRole.PARTICULIER) {
      userService.getExpertsPaginated(10).then(res => setExperts(res.data));
    }
  }, [role]);

  React.useEffect(() => {
    if (selectedDossier) {
      setMessages(selectedDossier.messages || []);
      setAppointments(selectedDossier.appointments || []);
    }
  }, [selectedDossier]);

  const handleTransmit = async () => {
    if (!selectedDossier || !selectedExpertId) return;
    setIsTransmitting(true);
    await dossierService.transmitToExpert(selectedDossier.id, selectedExpertId);
    setSelectedDossier(null);
    setIsTransmitting(false);
    setSelectedExpertId(null);
    loadDossiers(true);
  };

  const handleAcceptTransmission = async (dossierId: string) => {
    await dossierService.acceptDossier(dossierId, 'e0'); // ID expert démo
    loadDossiers(true);
  };

  const handleRejectTransmission = async (dossierId: string) => {
    await dossierService.rejectDossier(dossierId);
    loadDossiers(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedDossier) return;
    
    // Utiliser le profil réel s'il est disponible
    const senderName = profile?.fullName || (role === UserRole.PARTICULIER ? 'Candidat' : 'Expert');
    const senderId = profile?.id || (role === UserRole.PARTICULIER ? 'client' : 'expert');

    const sender = { 
      id: senderId, 
      name: senderName
    };
    
    const msg = await dossierService.sendMessage(selectedDossier.id, newMessage, sender);
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  const handleBookRDV = async () => {
    if (!selectedDate || !selectedTime || !selectedDossier) return;
    
    const expert = { id: 'e1', name: 'Dr. Sarah Tremblay' };
    const rdv = await dossierService.bookAppointment(selectedDossier.id, selectedDate, selectedTime, expert);
    setAppointments(prev => [...prev, rdv]);
    setSelectedDate('');
    setSelectedTime('');
    setActiveTab('rdv');
  };

  if (selectedDossier) {
    const isTransmitted = selectedDossier.status === DossierStatus.EN_ATTENTE_EXPERT;
    
    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
        <header className="flex items-center gap-6">
          <button 
            onClick={() => setSelectedDossier(null)}
            className="p-3 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-full hover:scale-110 transition-transform"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-3xl font-medium dark:text-white">{selectedDossier.title}</h2>
            <div className="flex items-center gap-4 mt-1 text-[11px] font-light text-gray-400">
              <span className="uppercase tracking-[0.2em]">{selectedDossier.category}</span>
              <span>•</span>
              <span>ID: #{selectedDossier.id}</span>
            </div>
          </div>
          <button className="ml-auto flex items-center gap-2 px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-xs font-medium hover:opacity-90 transition-all">
            <FileDown size={14} /> Export PDF
          </button>
        </header>

        {/* Transmission Interface (Client Side) */}
        {role === UserRole.PARTICULIER && selectedDossier.status === DossierStatus.OUVERT && (
          <div className="p-8 bg-black dark:bg-white text-white dark:text-black rounded-[2.5rem] shadow-2xl space-y-8 animate-in zoom-in-95">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white/10 dark:bg-black/10 rounded-2xl flex items-center justify-center">
                 <UserPlus size={24} />
               </div>
               <div>
                 <h3 className="text-xl font-light">Transmettre à un <span className="font-bold">Expert Certifié</span></h3>
                 <p className="text-xs opacity-60 font-light">Confiez votre dossier à un professionnel pour maximiser vos chances de succès.</p>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Sélecteur d'expert</label>
                  <select 
                    value={selectedExpertId || ''}
                    onChange={(e) => setSelectedExpertId(e.target.value)}
                    className="w-full p-4 bg-white/5 dark:bg-black/5 border border-white/10 dark:border-black/10 rounded-2xl text-sm font-light focus:outline-none"
                  >
                    <option value="" className="text-black">Choisir un expert...</option>
                    {experts.map(e => (
                      <option key={e.id} value={e.id} className="text-black">{e.fullName} • {e.specialty}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                   <button 
                    disabled={!selectedExpertId || isTransmitting}
                    onClick={handleTransmit}
                    className="w-full py-4 bg-white dark:bg-black text-black dark:text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-20 flex items-center justify-center gap-2"
                   >
                     {isTransmitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                     Lancer la transmission
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* Transmission Notification (Expert Side) */}
        {role === UserRole.PROFESSIONNEL && isTransmitted && (
           <div className="p-8 bg-blue-500 text-white rounded-[2.5rem] shadow-2xl space-y-6 animate-in slide-in-from-top-4">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <AlertTriangle size={24} />
                   <div>
                     <h3 className="text-xl font-light">Nouvelle Demande de <span className="font-bold">Transmission</span></h3>
                     <p className="text-xs opacity-80 font-light">Le client attend votre validation pour commencer l'accompagnement.</p>
                   </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Reçu le</p>
                    <p className="text-sm font-medium">{selectedDossier.transmissionDate}</p>
                 </div>
              </div>
              <div className="flex gap-4 pt-4">
                 <button 
                  onClick={() => handleAcceptTransmission(selectedDossier.id)}
                  className="flex-1 py-4 bg-white text-blue-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                 >
                   <CheckCircle2 size={16} /> Accepter le mandat
                 </button>
                 <button 
                  onClick={() => handleRejectTransmission(selectedDossier.id)}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                 >
                   <XCircle size={16} /> Décliner
                 </button>
              </div>
           </div>
        )}

        {/* Detail Tabs Navigation */}
        <div className="flex gap-8 border-b border-gray-100 dark:border-zinc-800">
          {[
            { id: 'docs', label: 'Documents', icon: FileText },
            { id: 'messages', label: 'Messages', icon: MessageSquare },
            { id: 'rdv', label: 'Rendez-vous', icon: Calendar },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all relative ${
                activeTab === tab.id ? 'text-black dark:text-white' : 'text-gray-300 dark:text-zinc-600'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black dark:bg-white animate-in fade-in"></div>}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 min-h-[500px]">
            {activeTab === 'docs' && (
              <div className="space-y-10 animate-in fade-in duration-300">
                <section className="bg-white dark:bg-zinc-900/30 border border-gray-100 dark:border-zinc-800 p-8 rounded-[2rem] shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-10">Progression du dossier</h3>
                  <div className="relative flex justify-between">
                    <div className="absolute top-4 left-0 w-full h-[1px] bg-gray-100 dark:bg-zinc-800 z-0"></div>
                    {selectedDossier.steps?.map((step, i) => (
                      <div key={step.id} className="relative z-10 flex flex-col items-center text-center max-w-[80px]">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                          step.isCompleted ? 'bg-black border-black text-white' : 
                          step.isCurrent ? 'bg-white border-black text-black animate-pulse' : 
                          'bg-white dark:bg-zinc-900 border-gray-200 text-gray-300'
                        }`}>
                          {step.isCompleted ? <CheckCircle size={16} /> : <span className="text-[10px] font-bold">{i+1}</span>}
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-widest mt-4 ${step.isCurrent ? 'text-black dark:text-white' : 'text-gray-400'}`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400">Checklist Documents</h3>
                  </div>
                  <div className="space-y-3">
                    {selectedDossier.checklist?.map(item => (
                      <div key={item.id} className="p-5 bg-white dark:bg-zinc-900/50 border border-gray-50 dark:border-zinc-800 rounded-2xl flex items-center justify-between group hover:border-black transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${
                            item.status === DocumentStatus.VALIDATED ? 'bg-green-500' :
                            item.status === DocumentStatus.PENDING ? 'bg-orange-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-sm font-light dark:text-zinc-200">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.status}
                          </span>
                          <button className="text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                            <MoreHorizontal size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2rem] overflow-hidden animate-in fade-in duration-300">
                <div className="flex-1 p-8 space-y-6 overflow-y-auto max-h-[500px]">
                  {messages.length > 0 ? messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === (role === UserRole.PARTICULIER ? 'client' : 'expert') ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl ${
                        msg.senderId === (role === UserRole.PARTICULIER ? 'client' : 'expert') 
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg' 
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200'
                      }`}>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">{msg.senderName}</p>
                        <p className="text-sm font-light leading-relaxed">{msg.content}</p>
                        <p className="text-[8px] mt-2 opacity-40 text-right">{msg.timestamp}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300">
                      <MessageSquare size={48} strokeWidth={1} className="mb-4" />
                      <p className="text-xs font-light">Aucun message pour le moment.</p>
                    </div>
                  )}
                </div>
                <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-50 dark:border-zinc-800 flex items-center gap-4 bg-gray-50/50 dark:bg-zinc-900/50">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Écrivez un message..."
                    className="flex-1 bg-transparent text-sm font-light focus:outline-none dark:text-white"
                  />
                  <button type="submit" className="p-3 bg-black dark:bg-white text-white dark:text-black rounded-full hover:scale-105 transition-transform">
                    <Send size={16} />
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'rdv' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <section className="bg-white dark:bg-zinc-900/30 border border-gray-100 dark:border-zinc-800 p-8 rounded-[2rem]">
                  <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-8">Prendre rendez-vous</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Date de consultation</label>
                      <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full p-4 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-light dark:text-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Créneau horaire</label>
                      <select 
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full p-4 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-light dark:text-white focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                      >
                        <option value="">Choisir une heure</option>
                        <option value="09:00">09:00</option>
                        <option value="10:00">10:00</option>
                        <option value="14:00">14:00</option>
                        <option value="16:00">16:00</option>
                      </select>
                    </div>
                  </div>
                  <button 
                    onClick={handleBookRDV}
                    disabled={!selectedDate || !selectedTime}
                    className="mt-8 w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-20"
                  >
                    Confirmer le Rendez-vous
                  </button>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400">Historique des RDV</h3>
                  {appointments.length > 0 ? appointments.map(rdv => (
                    <div key={rdv.id} className="p-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl flex items-center justify-between group hover:border-black transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-gray-400">
                          <Video size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-medium dark:text-white">Consultation Vidéo</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest">{rdv.date} à {rdv.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-green-500">{rdv.status}</span>
                        <button className="p-2 text-gray-300 hover:text-black dark:hover:text-white transition-colors">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </div>
                  )) : (
                    <p className="text-xs font-light text-gray-400 italic">Aucun rendez-vous planifié.</p>
                  )}
                </section>
              </div>
            )}
          </div>

          {/* Sidebar: Status & Info */}
          <div className="space-y-8">
             <div className="p-8 bg-gray-50 dark:bg-zinc-900/50 rounded-[2rem] border border-gray-100 dark:border-zinc-800">
               <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-6">Expert assigné</h3>
               {selectedDossier.expertId ? (
                 <>
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-xl font-bold">
                        {selectedDossier.expertId === 'e0' ? 'S' : 'E'}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium dark:text-white">{selectedDossier.expertId === 'e0' ? 'Dr. Sarah Tremblay' : 'Expert Assigné'}</h4>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Consultant CRIC</p>
                      </div>
                   </div>
                   <div className="mt-8 space-y-3">
                     <button 
                      onClick={() => setActiveTab('messages')}
                      className={`w-full py-3 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-medium transition-all ${
                        activeTab === 'messages' ? 'bg-black text-white dark:bg-white dark:text-black border-none' : 'bg-white dark:bg-zinc-800 hover:border-black'
                      }`}
                    >
                       Envoyer un message
                     </button>
                     <button 
                      onClick={() => setActiveTab('rdv')}
                      className={`w-full py-3 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-medium transition-all ${
                        activeTab === 'rdv' ? 'bg-black text-white dark:bg-white dark:text-black border-none' : 'bg-white dark:bg-zinc-800 hover:border-black'
                      }`}
                    >
                       Prendre RDV
                     </button>
                   </div>
                 </>
               ) : (
                 <div className="text-center py-6">
                    <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-gray-300 mb-4">
                      <User size={20} />
                    </div>
                    <p className="text-xs font-light text-gray-400 italic">Aucun expert assigné.</p>
                    {role === UserRole.PARTICULIER && (
                      <button 
                        onClick={() => setSelectedDossier({...selectedDossier})} // Trigger re-render to show transmission UI if status allows
                        className="mt-4 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white hover:underline"
                      >
                        Trouver un expert
                      </button>
                    )}
                 </div>
               )}
             </div>

             <div className="p-8 border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 rounded-[2rem] space-y-6">
                <div className="flex items-center gap-2 text-gray-400">
                  <CreditCard size={16} />
                  <h4 className="text-[10px] font-bold uppercase tracking-widest">Frais de dossier</h4>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-light dark:text-white">450.00 $</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-green-500">Réglé</span>
                </div>
                <div className="pt-4 border-t border-gray-50 dark:border-zinc-800">
                  <button className="text-[10px] font-bold uppercase tracking-widest text-blue-500 hover:underline">Voir les factures</button>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extralight tracking-tight dark:text-white">
            {role === UserRole.PARTICULIER ? 'Mes ' : 'Gestion des '}
            <span className="font-medium">Dossiers</span>
          </h2>
          <p className="text-sm font-light text-gray-400 dark:text-zinc-500 mt-1">Gérez efficacement vos dossiers avec la pagination fluide.</p>
        </div>
        {role === UserRole.PARTICULIER && (
          <button className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-full text-sm font-light hover:opacity-80 transition-opacity w-fit shadow-lg shadow-black/5">
            <Plus size={18} /> Nouveau dossier
          </button>
        )}
      </header>

      <div className="flex flex-wrap items-center gap-4 text-sm font-light text-gray-400 dark:text-zinc-500 border-b border-gray-100 dark:border-zinc-800 pb-4">
        {['Tous', DossierStatus.OUVERT, DossierStatus.EN_ATTENTE_EXPERT, DossierStatus.EN_COURS, DossierStatus.CLOTURE].map((f) => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`pb-2 border-b-2 transition-all ${filter === f ? 'border-black dark:border-white text-black dark:text-white font-medium' : 'border-transparent hover:text-black dark:hover:text-white'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="h-24 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl animate-pulse" />)
        ) : (
          dossiers.filter(d => filter === 'Tous' || d.status === filter).map((d) => (
            <div 
              key={d.id} 
              onClick={() => setSelectedDossier(d)}
              className={`p-6 border border-gray-100 dark:border-zinc-800 rounded-2xl hover:border-black dark:hover:border-zinc-100 hover:shadow-xl transition-all flex items-center group bg-white dark:bg-zinc-900/30 cursor-pointer ${d.status === DossierStatus.EN_ATTENTE_EXPERT ? 'border-l-4 border-l-blue-500' : ''}`}
            >
              <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-colors">
                <FileText size={20} />
              </div>
              <div className="ml-6 flex-1">
                <h4 className="text-base font-medium dark:text-white">{d.title}</h4>
                <div className="flex items-center gap-4 mt-1 text-[10px] text-gray-400 dark:text-zinc-500 font-light">
                  <span className="uppercase tracking-widest">{d.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><User size={10} /> {d.clientName}</span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-widest border flex items-center gap-2 ${
                d.status === DossierStatus.OUVERT ? 'text-blue-500 border-blue-100' : 
                d.status === DossierStatus.EN_ATTENTE_EXPERT ? 'text-orange-500 border-orange-100 bg-orange-50/10' :
                d.status === DossierStatus.EN_COURS ? 'text-green-500 border-green-100' : 
                'text-gray-400 border-gray-100'
              }`}>
                {d.status === DossierStatus.EN_ATTENTE_EXPERT && <Clock size={10} />}
                {d.status}
              </div>
            </div>
          ))
        )}
      </div>

      {hasMore && !loading && (
        <div className="flex justify-center pt-4">
          <button onClick={() => loadDossiers()} disabled={loadingMore} className="text-xs font-light text-gray-400 hover:text-black dark:hover:text-white flex items-center gap-2">
            {loadingMore ? <Loader2 size={14} className="animate-spin" /> : "Charger plus de dossiers"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Marketplace;

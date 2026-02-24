
import React from 'react';
import { 
  Calendar, Users, PlayCircle, ExternalLink, Plus, X, 
  Video, DollarSign, Info, Clock, CheckCircle2, Layout,
  ChevronRight, Loader2, Image as ImageIcon, UploadCloud,
  CreditCard, ShieldCheck, Zap
} from 'lucide-react';
import { eventService } from '../services/event.service';
import { paymentService } from '../services/payment.service';
import { EventSession, UserRole } from '../types';

const Events: React.FC<{ role: UserRole }> = ({ role }) => {
  const [events, setEvents] = React.useState<EventSession[]>([]);
  const [registeredIds, setRegisteredIds] = React.useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const [paymentModalEvent, setPaymentModalEvent] = React.useState<EventSession | null>(null);
  const [isPaying, setIsPaying] = React.useState(false);

  const [newEvent, setNewEvent] = React.useState<Omit<EventSession, 'id'>>({
    title: '',
    type: 'Webinaire',
    date: '',
    isPaid: false,
    price: 0,
    status: 'Brouillon',
    bannerUrl: '',
    meetingLink: ''
  });

  const bannerInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setEvents(eventService.getEvents());
    setRegisteredIds(eventService.getRegisteredEventIds());
  }, []);

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEvent(prev => ({ ...prev, bannerUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const canCreate = [UserRole.PROFESSIONNEL, UserRole.PARTENAIRE, UserRole.ADMIN].includes(role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await eventService.createEvent(newEvent);
      setEvents(eventService.getEvents());
      setIsModalOpen(false);
      setNewEvent({
        title: '',
        type: 'Webinaire',
        date: '',
        isPaid: false,
        price: 0,
        status: 'Brouillon',
        bannerUrl: '',
        meetingLink: ''
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAction = async (event: EventSession) => {
    const isReg = registeredIds.includes(event.id);
    
    if (event.status === 'En direct' && isReg) {
      window.open(event.meetingLink, '_blank');
      return;
    }

    if (isReg) return;

    if (event.isPaid) {
      setPaymentModalEvent(event);
    } else {
      await eventService.registerForEvent(event.id);
      setRegisteredIds(eventService.getRegisteredEventIds());
    }
  };

  const confirmPayment = async () => {
    if (!paymentModalEvent) return;
    setIsPaying(true);
    try {
      await paymentService.processPayment(paymentModalEvent.price || 0, `Inscription : ${paymentModalEvent.title}`);
      await eventService.registerForEvent(paymentModalEvent.id);
      setRegisteredIds(eventService.getRegisteredEventIds());
      setPaymentModalEvent(null);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extralight tracking-tight dark:text-white">Events & <span className="font-medium text-cm-gold">Promotions</span></h2>
          <p className="text-sm font-light text-slate-400 dark:text-zinc-500 mt-1">Sessions en direct, formations et opportunités de recrutement.</p>
        </div>
        {canCreate && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-cm-navy text-white px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-cm-gold transition-all shadow-xl shadow-black/10 border border-cm-gold/20"
          >
            <Plus size={16} />
            Créer un Live
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => {
          const isReg = registeredIds.includes(event.id);
          const isLive = event.status === 'En direct';
          
          return (
            <div key={event.id} className="border border-slate-100 dark:border-white/10 rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all group flex flex-col bg-white dark:bg-zinc-900/30">
              <div className="relative h-48 bg-slate-50 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                <img 
                  src={event.bannerUrl || `https://picsum.photos/seed/${event.id}/400/300`} 
                  alt={event.title} 
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${isReg ? 'grayscale-0 opacity-100' : 'grayscale opacity-40 group-hover:opacity-100'} group-hover:scale-110`} 
                />
                
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-white shadow-sm
                    ${isLive ? 'bg-red-500 animate-pulse' : 
                      event.status === 'Brouillon' ? 'bg-slate-400' : 'bg-cm-navy'}
                  `}>
                    {event.status}
                  </span>
                  {event.isPaid && !isReg && (
                    <span className="px-3 py-1 bg-white/90 dark:bg-black/80 text-black dark:text-white rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm">
                        {event.price}$
                    </span>
                  )}
                  {isReg && (
                    <span className="px-3 py-1 bg-green-500 text-white rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm flex items-center gap-1">
                        <CheckCircle2 size={10} /> Inscrit
                    </span>
                  )}
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-cm-gold uppercase tracking-[0.2em]">{event.type}</span>
                  {isReg && <Zap size={14} className="text-cm-gold fill-cm-gold" />}
                </div>
                <h4 className="text-xl font-light mt-3 leading-tight dark:text-zinc-100">{event.title}</h4>
                
                <div className="mt-8 flex flex-col gap-3">
                  <div className="flex items-center text-xs font-light text-slate-400 gap-3">
                    <Calendar size={14} strokeWidth={1.5} />
                    {event.date}
                  </div>
                </div>

                <div className="mt-auto pt-8">
                  <button 
                    onClick={() => handleAction(event)}
                    className={`w-full flex items-center justify-center gap-2 py-4 text-[10px] font-bold uppercase tracking-widest rounded-2xl transition-all ${
                      isLive && isReg 
                      ? 'bg-red-500 text-white shadow-lg' 
                      : isReg 
                      ? 'bg-slate-50 dark:bg-zinc-800 text-slate-400 cursor-default'
                      : 'border border-slate-100 dark:border-white/10 hover:border-cm-gold hover:text-cm-gold'
                    }`}
                  >
                    {isLive && isReg ? 'Rejoindre le Live' : isReg ? 'Déjà inscrit' : (event.isPaid ? 'Payer & S\'inscrire' : 'S\'inscrire')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-slate-50 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-cm-navy rounded-2xl flex items-center justify-center text-white">
                  <Video size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest dark:text-white">Planification</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Édition Institutionnelle</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-black dark:hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Affiche de promotion</label>
                <div 
                  onClick={() => bannerInputRef.current?.click()}
                  className="relative h-40 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl overflow-hidden group cursor-pointer hover:border-cm-gold transition-all flex flex-col items-center justify-center"
                >
                  {newEvent.bannerUrl ? (
                    <img src={newEvent.bannerUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <UploadCloud size={20} className="text-slate-300" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Téléverser l'affiche</p>
                    </div>
                  )}
                  <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={handleBannerUpload} />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Titre de l'événement</label>
                <input type="text" required value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-light dark:text-white" />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lien Zoom / Google Meet</label>
                <input type="url" required value={newEvent.meetingLink} onChange={(e) => setNewEvent({...newEvent, meetingLink: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-light dark:text-white" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Type de session</label>
                  <select value={newEvent.type} onChange={(e) => setNewEvent({...newEvent, type: e.target.value as any})} className="w-full p-4 bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-light dark:text-white">
                    <option value="Webinaire">Webinaire</option>
                    <option value="Formation">Formation / Cours</option>
                    <option value="Session Info">Session de Recrutement</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date & Heure</label>
                  <input type="datetime-local" required value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl text-sm font-light dark:text-white" />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-cm-navy text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-cm-gold transition-all flex items-center justify-center gap-3">
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                Publier la session
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;

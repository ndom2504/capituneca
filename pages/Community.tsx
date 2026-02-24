
import React from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  AlertTriangle, 
  Loader2, 
  Sparkles,
  Image as ImageIcon,
  Video as VideoIcon,
  Paperclip,
  Smile,
  X,
  Play,
  Send,
  Flag,
  Trash2,
  FileText,
  File as FileIcon,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Search,
  User as UserIcon,
  Megaphone,
  CalendarDays,
  PlayCircle
} from 'lucide-react';
import { chatService } from '../services/chat.service';
import { rssService } from '../services/rss.service';
import { eventService } from '../services/event.service';
import { CommunityPost, UserRole, EventSession, UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';

const COMMON_EMOJIS = ["🇨🇦", "✈️", "🏢", "🎓", "💼", "🙏", "❤️", "👏", "🎉", "🙌", "✨", "🤔", "💡", "✅", "⚖️", "📢"];

const Community: React.FC<{ role?: UserRole; profile?: UserProfile }> = ({ role, profile }) => {
  const navigate = useNavigate();
  const [userPosts, setUserPosts] = React.useState<CommunityPost[]>([]);
  const [officialPosts, setOfficialPosts] = React.useState<CommunityPost[]>([]);
  const [upcomingEvents, setUpcomingEvents] = React.useState<EventSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isRefreshingRSS, setIsRefreshingRSS] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [lastId, setLastId] = React.useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = React.useState(true);
  const [postContent, setPostContent] = React.useState('');
  const [showRewardToast, setShowRewardToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  
  // États d'interaction
  const [likedPosts, setLikedPosts] = React.useState<Set<string>>(new Set());
  const [activeMenus, setActiveMenus] = React.useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);

  // Médias
  const [attachedMedia, setAttachedMedia] = React.useState<{url: string, type: 'image' | 'video' | 'file', name?: string} | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);
  const docInputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setShowRewardToast(true);
    setTimeout(() => setShowRewardToast(false), 3000);
  };

  const importOfficialNews = React.useCallback(async () => {
    setIsRefreshingRSS(true);
    try {
      const news = await rssService.getLatestOfficialPosts();
      setOfficialPosts(news);
      if (news.length > 0) {
        showToast(`Flux à jour : ${news.length} actualités.`);
      }
    } catch (err) {
      console.error("RSS Import Error:", err);
    } finally {
      setIsRefreshingRSS(false);
    }
  }, []);

  const loadPosts = React.useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const result = await chatService.getCommunityPostsPaginated(8, isInitial ? undefined : lastId);
      const filtered = result.data.filter(p => p.category !== 'Officiel');
      setUserPosts(prev => isInitial ? filtered : [...prev, ...filtered]);
      setLastId(result.lastId);
      setHasMore(result.hasMore);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastId]);

  React.useEffect(() => {
    const init = async () => {
      await loadPosts(true);
      importOfficialNews();
      // Charger les évènements pour la barre latérale
      setUpcomingEvents(eventService.getEvents().slice(0, 3));
    };
    init();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'file') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedMedia({ url: reader.result as string, type, name: file.name });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() && !attachedMedia) return;

    const newPost: CommunityPost = {
      id: `new-${Date.now()}`,
      author: profile?.fullName || 'Utilisateur',
      role: role || UserRole.PARTICULIER,
      content: postContent,
      likes: 0,
      category: 'Communauté',
      timestamp: 'À l\'instant',
      mediaUrl: attachedMedia?.url,
      mediaType: attachedMedia?.type === 'file' ? 'file' : (attachedMedia?.type as any)
    };
    
    setUserPosts(prev => [newPost, ...prev]);
    setPostContent('');
    setAttachedMedia(null);
    showToast("Publication partagée ! +10 points.");
  };

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  return (
    <div className="pb-20 animate-in fade-in duration-700">
      <header className="mb-10">
        <h2 className="text-3xl font-extralight tracking-tight dark:text-white">Espace <span className="font-medium">Communauté</span></h2>
        <p className="text-sm font-light text-gray-400 dark:text-zinc-500 mt-1">Échanges entre membres et veille règlementaire officielle.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* FIL PRINCIPAL (COLONNE GAUCHE) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Post Creator */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[1.5rem] p-6 shadow-sm space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                <UserIcon size={18} className="text-gray-400" />
              </div>
              <textarea
                ref={textareaRef}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Une question ? Un succès à partager ?"
                className="w-full bg-transparent border-none focus:ring-0 text-base font-light placeholder:text-gray-300 dark:placeholder:text-zinc-700 dark:text-white resize-none"
                rows={2}
              />
            </div>

            {attachedMedia && (
              <div className="relative rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-800">
                {attachedMedia.type === 'image' && <img src={attachedMedia.url} alt="" className="w-full h-auto max-h-48 object-cover" />}
                <button onClick={() => setAttachedMedia(null)} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full"><X size={12} /></button>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-zinc-800">
              <div className="flex items-center gap-1">
                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-all"><ImageIcon size={18} /></button>
                <button onClick={() => videoInputRef.current?.click()} className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-all"><VideoIcon size={18} /></button>
                <div className="relative">
                  <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-all"><Smile size={18} /></button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-2 p-2 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl shadow-2xl grid grid-cols-4 gap-1 z-20">
                      {COMMON_EMOJIS.map(e => (
                        <button key={e} onClick={() => { setPostContent(prev => prev + e); setShowEmojiPicker(false); }} className="p-2 hover:bg-gray-50 text-lg">{e}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={handleCreatePost}
                disabled={!postContent.trim() && !attachedMedia}
                className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-[11px] font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-20 transition-all"
              >
                Publier
              </button>
            </div>
          </div>

          {/* User Feed */}
          <div className="space-y-4">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-40 bg-white dark:bg-zinc-900/50 rounded-2xl animate-pulse" />)
            ) : (
              userPosts.map(post => (
                <div key={post.id} className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800 rounded-[1.2rem] p-5 space-y-4 shadow-sm group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 text-xs font-bold">
                        {post.author.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold dark:text-white">{post.author}</h4>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest">{post.timestamp} • {post.role}</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveMenus(activeMenus === post.id ? null : post.id)} className="text-gray-300 hover:text-black transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                  <p className="text-[14px] font-light leading-relaxed dark:text-zinc-200">{post.content}</p>
                  
                  {post.mediaUrl && (
                    <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-800">
                      <img src={post.mediaUrl} alt="" className="w-full h-auto max-h-64 object-cover" />
                    </div>
                  )}

                  <div className="flex items-center gap-6 pt-4 border-t border-gray-50 dark:border-zinc-800">
                    <button 
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${likedPosts.has(post.id) ? 'text-red-500' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
                    >
                      <Heart size={16} className={likedPosts.has(post.id) ? 'fill-current' : ''} />
                      {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                    </button>
                    <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                      <MessageCircle size={16} />
                      Répondre
                    </button>
                    <button className="ml-auto text-gray-300 hover:text-black transition-colors"><Share2 size={16} /></button>
                  </div>
                </div>
              ))
            )}
            
            {hasMore && !loading && (
              <button onClick={() => loadPosts()} disabled={loadingMore} className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                {loadingMore ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Charger plus de discussions"}
              </button>
            )}
          </div>
        </div>

        {/* FLUX DROITE (STICKY) */}
        <div className="lg:col-span-4 space-y-6 sticky top-6">
          
          {/* Section 1: Flux Officiels */}
          <div className="bg-zinc-900 dark:bg-white text-white dark:text-black rounded-[1.5rem] p-6 shadow-2xl overflow-hidden relative group">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/5 dark:bg-black/5 rounded-full blur-2xl"></div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Flux Officiels</h3>
              </div>
              <button 
                onClick={importOfficialNews}
                disabled={isRefreshingRSS}
                className="p-1.5 hover:bg-white/10 dark:hover:bg-black/10 rounded-full transition-colors"
              >
                <RefreshCw size={14} className={isRefreshingRSS ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="space-y-4 relative z-10">
              {isRefreshingRSS && officialPosts.length === 0 ? (
                [1,2,3].map(i => <div key={i} className="h-20 bg-white/5 dark:bg-black/5 rounded-xl animate-pulse" />)
              ) : (
                officialPosts.map(post => (
                  <div key={post.id} className="p-4 bg-white/5 dark:bg-black/5 rounded-xl border border-white/10 dark:border-black/10 hover:border-blue-400/50 transition-all group/item">
                    <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-1">{post.author}</p>
                    <p className="text-[12px] font-light leading-snug line-clamp-3 mb-3 text-zinc-300 dark:text-zinc-600">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] text-zinc-500 uppercase">{post.timestamp}</span>
                      <a 
                        href={post.externalUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[9px] font-bold text-white dark:text-black flex items-center gap-1 hover:underline"
                      >
                        Lire <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 2: Prochains Évènements (NOUVEAU) */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[1.5rem] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                  <CalendarDays size={18} className="text-orange-500" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest dark:text-white">Prochains Lives</h3>
               </div>
               <button 
                 onClick={() => navigate('/events')}
                 className="text-[9px] font-bold uppercase text-gray-400 hover:text-black dark:hover:text-white"
               >
                 Voir tout
               </button>
            </div>

            <div className="space-y-3">
               {upcomingEvents.map(event => (
                 <div key={event.id} className="p-3 border border-gray-50 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer group" onClick={() => navigate('/events')}>
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center text-orange-500 shrink-0">
                          {event.status === 'En direct' ? <PlayCircle size={16} className="animate-pulse" /> : <Play size={16} />}
                       </div>
                       <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-medium dark:text-zinc-100 truncate">{event.title}</p>
                          <p className="text-[9px] text-gray-400 truncate">{event.date} • {event.type}</p>
                       </div>
                    </div>
                 </div>
               ))}
               {upcomingEvents.length === 0 && (
                 <p className="text-[10px] text-gray-400 italic text-center py-4">Aucun évènement programmé.</p>
               )}
            </div>
          </div>

          {/* Bonus / Info Widget */}
          <div className="p-6 border border-gray-100 dark:border-zinc-800 rounded-[1.5rem] bg-white dark:bg-zinc-900/30">
            <div className="flex items-center gap-3 mb-4">
              <Megaphone size={18} className="text-blue-500" />
              <h4 className="text-[10px] font-bold uppercase tracking-widest dark:text-white">Capitune Rewards</h4>
            </div>
            <p className="text-[11px] font-light text-gray-500 dark:text-zinc-400 leading-relaxed">
              Vos contributions (réponses, likes) sont récompensées. Obtenez 10 pts par réponse validée !
            </p>
          </div>
        </div>

      </div>

      {/* Inputs cachés */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'image')} />
      <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={(e) => handleFileSelect(e, 'video')} />
      <input type="file" ref={docInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileSelect(e, 'file')} />

      {/* Toast Notification */}
      {showRewardToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-4 bg-black text-white rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-10 duration-500 z-[100]">
          <div className="p-2 bg-yellow-500 rounded-lg"><Sparkles size={16} className="text-black" /></div>
          <p className="text-xs font-bold uppercase tracking-widest">{toastMessage}</p>
        </div>
      )}
    </div>
  );
};

export default Community;

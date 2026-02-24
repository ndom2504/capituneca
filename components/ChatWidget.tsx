
import React from 'react';
// Import missing Sparkles icon from lucide-react
import { MessageCircle, X, Minimize2, Send, Bot, Sparkles } from 'lucide-react';
import { chatService } from '../services/chat.service';
import { userService } from '../services/user.service';
import { dossierService } from '../services/dossier.service';
import { authService } from '../services/auth.service';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    { role: 'model', content: "Bonjour ! Je suis l'assistant CAPITUNE. Comment puis-je vous aider dans vos démarches d'immigration aujourd'hui ?" }
  ]);
  const [inputValue, setInputValue] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Écouteur pour l'ouverture externe
  React.useEffect(() => {
    const handleOpenChat = (e: any) => {
      setIsOpen(true);
      setIsMinimized(false);
      if (e.detail?.message && messages.length === 1) {
        // Optionnel: On peut pré-remplir ou envoyer un message automatique
      }
    };

    window.addEventListener('open-capitune-chat', handleOpenChat);
    return () => window.removeEventListener('open-capitune-chat', handleOpenChat);
  }, [messages]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsLoading(true);

    // Get Context
    const role = authService.getStoredRole();
    if (!role) return;
    const profile = userService.getCurrentProfile(role);
    const dossiersResult = await dossierService.getDossiersPaginated(role, 5);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    const botResponse = await chatService.getGeminiResponse(
      userText, 
      history, 
      { profile, dossiers: dossiersResult.data }
    );
    
    setMessages(prev => [...prev, { role: 'model', content: botResponse }]);
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-cm-purple text-white rounded-full shadow-glow-purple hover:scale-110 transition-transform z-50 border border-white/20"
      >
        <MessageCircle size={24} />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center text-[10px] text-cm-purple font-bold animate-bounce">1</span>
      </button>
    );
  }

  return (
    <div className={`
      fixed bottom-6 right-6 w-80 sm:w-96 bg-white/95 backdrop-blur-xl border border-slate-100 shadow-[0_20px_50px_rgba(124,58,237,0.15)] rounded-[2rem] flex flex-col z-50 overflow-hidden transition-all duration-300
      ${isMinimized ? 'h-14' : 'h-[550px]'}
    `}>
      <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-cm-purple/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-cm-purple text-white rounded-2xl flex items-center justify-center shadow-glow-purple">
            <Bot size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-cm-black">Assistant CAPITUNE</h3>
            <p className="text-[9px] text-cm-purple font-bold uppercase tracking-widest">Moteur Gemini v3</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 text-slate-400 hover:text-cm-purple transition-colors">
            <Minimize2 size={16} />
          </button>
          <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-cm-error transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                  max-w-[85%] px-5 py-3 rounded-[1.5rem] text-sm font-light leading-relaxed
                  ${msg.role === 'user' 
                    ? 'bg-cm-purple text-white shadow-glow-purple' 
                    : 'bg-white text-slate-700 border border-slate-100 shadow-sm'}
                `}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 px-5 py-3 rounded-[1.5rem] text-xs font-light text-slate-400 animate-pulse flex items-center gap-2">
                  {/* Fixed missing Sparkles icon usage by adding it to imports */}
                  <Sparkles size={12} className="text-cm-purple" />
                  Analyse contextuelle...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-5 border-t border-slate-50 flex items-center gap-3 bg-white">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Question sur vos dossiers..."
              className="flex-1 text-sm font-light focus:outline-none placeholder:text-slate-300 bg-transparent"
            />
            <button 
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-3 bg-cm-purple text-white hover:bg-cm-navy rounded-2xl disabled:opacity-30 transition-all shadow-glow-purple"
            >
              <Send size={18} />
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatWidget;

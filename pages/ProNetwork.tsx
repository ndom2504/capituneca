
import React from 'react';
import { Users, Hash, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react';

const ProNetwork: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black dark:bg-zinc-800 text-white text-[9px] font-bold uppercase tracking-[0.2em] rounded-full mb-4">
          <ShieldCheck size={12} />
          Espace Professionnel
        </div>
        <h2 className="text-3xl font-extralight tracking-tight dark:text-white">Réseau des <span className="font-medium">Experts CRIC</span></h2>
        <p className="text-sm font-light text-gray-400 dark:text-zinc-500 mt-1">Échangez entre pairs et partagez vos meilleures pratiques.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Discussion Groups */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-zinc-600">Canaux de discussion</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Jurisprudence', members: 124, tag: '#juridique' },
              { name: 'Entrée Express', members: 89, tag: '#immigration' },
              { name: 'Études & Permis', members: 56, tag: '#education' },
              { name: 'Installation QC', members: 42, tag: '#regionale' },
            ].map((group, i) => (
              <div key={i} className="p-6 border border-gray-100 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/30 hover:border-black dark:hover:border-white transition-all cursor-pointer group shadow-sm dark:shadow-black/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gray-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-gray-400 dark:text-zinc-600 group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all">
                    <Hash size={18} />
                  </div>
                  <span className="text-[10px] font-light text-gray-400 dark:text-zinc-600">{group.members} membres</span>
                </div>
                <h4 className="text-base font-medium mb-1 dark:text-zinc-100">{group.name}</h4>
                <p className="text-xs font-light text-gray-400 dark:text-zinc-500">{group.tag}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Members/Mentors */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-zinc-600">Experts en ligne</h3>
          <div className="space-y-4 bg-white dark:bg-zinc-900/30 p-6 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-sm dark:shadow-black/20">
            {[
              'Dr. Sarah Tremblay',
              'Marc-André Dubois',
              'Elena Rodriguez'
            ].map((name, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-gray-400 dark:text-zinc-600">
                    {name.charAt(0)}
                  </div>
                  <span className="text-sm font-light text-gray-700 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">{name}</span>
                </div>
                <button className="p-2 text-gray-300 dark:text-zinc-700 hover:text-black dark:hover:text-white transition-colors">
                  <MessageSquare size={14} />
                </button>
              </div>
            ))}
            <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 text-xs font-light text-gray-400 dark:text-zinc-600 hover:text-black dark:hover:text-white border-t border-gray-50 dark:border-zinc-800 pt-4 transition-colors">
              Voir tout l'annuaire Pro
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProNetwork;

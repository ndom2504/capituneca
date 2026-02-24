import React from 'react';

interface PublicLandingProps {
  onOpenLogin: () => void;
}

const PublicLanding: React.FC<PublicLandingProps> = ({ onOpenLogin }) => {
  return (
    <div className="min-h-screen bg-white text-cm-black">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-black tracking-tight">CAPITUNE</div>
          <nav className="hidden md:flex items-center gap-8 text-base">
            <a href="#home" className="text-cm-black border-b-2 border-cm-black pb-1">Accueil</a>
            <a href="#services" className="text-cm-black/80 hover:text-cm-black">Services</a>
            <a href="#tarifs" className="text-cm-black/80 hover:text-cm-black">Tarifs</a>
            <a href="#apropos" className="text-cm-black/80 hover:text-cm-black">À Propos</a>
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-5 py-2.5 bg-cm-black text-white font-semibold hover:opacity-90"
            >
              Connexion
            </button>
          </nav>
          <button
            type="button"
            onClick={onOpenLogin}
            className="md:hidden px-4 py-2 bg-cm-black text-white text-sm font-semibold"
          >
            Connexion
          </button>
        </div>
      </header>

      <main>
        <section id="home" className="relative min-h-[520px] md:min-h-[620px] flex items-center justify-center">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2000&auto=format&fit=crop"
              alt="Ville"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-white/75" />
          </div>

          <div className="relative z-10 max-w-4xl px-6 text-center">
            <h1 className="text-5xl md:text-7xl font-black uppercase leading-[0.95] tracking-tight mb-6">
              Votre projet Canada, structuré et sécurisé de A à Z.
            </h1>
            <p className="text-xl md:text-2xl text-cm-black/60 mb-2">
              CAPITUNE vous accompagne à chaque étape : de la consultation initiale jusqu&apos;à votre intégration réussie au Canada.
            </p>
            <p className="text-lg md:text-xl text-cm-black/50 mb-8">
              Nous transformons votre projet en un plan clair, organisé et conforme.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button className="px-8 py-4 bg-cm-black text-white font-semibold hover:opacity-90">
                Réserver une consultation
              </button>
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-8 py-4 bg-white border border-slate-300 text-cm-black font-semibold hover:bg-slate-50"
              >
                Créer un compte client
              </button>
            </div>
          </div>
        </section>

        <section id="services" className="py-20 bg-white text-center px-6">
          <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tight">Nos services</h2>
          <p className="mt-4 text-cm-black/60 text-2xl max-w-3xl mx-auto">
            Un accompagnement structuré et professionnel pour toutes les étapes de votre projet
          </p>
        </section>

        <section id="tarifs" className="py-6" />
        <section id="apropos" className="py-6" />
      </main>
    </div>
  );
};

export default PublicLanding;

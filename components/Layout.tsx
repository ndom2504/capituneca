
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Search, 
  Users, 
  Video, 
  MessageSquare, 
  UserCircle, 
  ShieldCheck, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
  onLogout: () => void;
  onboardingGuide?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, userRole, onLogout, onboardingGuide }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: [UserRole.PARTICULIER, UserRole.PROFESSIONNEL, UserRole.PARTENAIRE, UserRole.ADMIN] },
    { name: 'Dossiers', path: '/market', icon: FolderKanban, roles: [UserRole.PARTICULIER, UserRole.PROFESSIONNEL, UserRole.PARTENAIRE, UserRole.ADMIN] },
    { name: 'Annuaire', path: '/directory', icon: Search, roles: [UserRole.PARTICULIER, UserRole.PROFESSIONNEL, UserRole.PARTENAIRE, UserRole.ADMIN] },
    { name: 'Réseau Pro', path: '/network', icon: Users, roles: [UserRole.PROFESSIONNEL, UserRole.ADMIN] },
    { name: 'Webinaires', path: '/events', icon: Video, roles: [UserRole.PARTICULIER, UserRole.PROFESSIONNEL, UserRole.PARTENAIRE, UserRole.ADMIN] },
    { name: 'Communauté', path: '/community', icon: MessageSquare, roles: [UserRole.PARTICULIER, UserRole.PROFESSIONNEL, UserRole.PARTENAIRE, UserRole.ADMIN] },
    { name: 'Profil', path: '/profile', icon: UserCircle, roles: [UserRole.PARTICULIER, UserRole.PROFESSIONNEL, UserRole.PARTENAIRE, UserRole.ADMIN] },
    { name: 'Admin', path: '/admin', icon: ShieldCheck, roles: [UserRole.ADMIN] },
  ];

  return (
    <div className="min-h-screen flex bg-transparent transition-colors duration-500 font-inter">
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-6 left-6 z-50 p-2.5 bg-cm-navy text-white rounded-lg shadow-xl"
      >
        {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 glass-card border-r border-slate-100 transform transition-transform duration-500 ease-in-out
        lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 h-full flex flex-col">
          <div className="mb-14 px-4">
            <h1 className="text-xl font-light tracking-tight text-cm-black">
              CAPITUNE <span className="text-cm-purple font-semibold">v3</span>
            </h1>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">
              EXCELLENCE IMMIGRATION
            </p>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.filter(item => item.roles.includes(userRole)).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center px-4 py-3 text-[10px] uppercase tracking-widest transition-all duration-300 rounded-xl
                  ${isActive 
                    ? 'bg-cm-purple text-white font-bold shadow-glow-purple scale-[1.02]' 
                    : 'text-cm-grey-fine font-light hover:text-cm-purple hover:bg-white/50'}
                `}
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={16} strokeWidth={isActive ? 2 : 1.5} className="mr-4" />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="pt-8 border-t border-slate-100/50 space-y-2">
            <button 
              onClick={onLogout}
              className="flex items-center w-full px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-cm-error transition-all group"
            >
              <LogOut size={16} className="mr-4 group-hover:-translate-x-1 transition-transform" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64 p-6 lg:p-16">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
        {onboardingGuide}
      </main>
    </div>
  );
};

export default Layout;

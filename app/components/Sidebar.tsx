'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Wallet, 
  Receipt, 
  FileText, 
  Users, 
  Settings,
  Bell,
  ChevronRight,
  Menu,
  X,
  LogOut
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  active?: boolean;
}

const Sidebar: React.FC = () => {
  const [activeItem, setActiveItem] = useState('etablissements');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Données du menu basées sur l'image
  const mainMenuItems: MenuItem[] = [
    { 
      id: 'etablissements', 
      label: 'Établissements', 
      icon: <Building2 className="w-5 h-5" />, 
    //   badge: '237',
      active: activeItem === 'etablissements'
    },
  ];

  const financeMenuItems: MenuItem[] = [
    { 
      id: 'budget', 
      label: 'Budget', 
      icon: <Wallet className="w-5 h-5" />,
      active: activeItem === 'budget'
    },
    { 
      id: 'depenses', 
      label: 'Dépenses', 
      icon: <Receipt className="w-5 h-5" />,
      active: activeItem === 'depenses'
    },
    { 
      id: 'bilan', 
      label: 'Bilan', 
      icon: <FileText className="w-5 h-5" />,
      active: activeItem === 'bilan'
    },
    { 
      id: 'utilisateurs', 
      label: 'Utilisateurs', 
      icon: <Users className="w-5 h-5" />,
      active: activeItem === 'utilisateurs'
    },
    { 
      id: 'parametres', 
      label: 'Paramètres', 
      icon: <Settings className="w-5 h-5" />,
      active: activeItem === 'parametres'
    },
  ];

  const renderMenuItem = (item: MenuItem) => (
    <button
      key={item.id}
      onClick={() => setActiveItem(item.id)}
      className={`
        w-full flex items-center justify-between px-4 py-3 mb-1 rounded-lg transition-all duration-200 group relative
        ${item.active 
          ? 'bg-white/10 text-white border-l-4 border-yellow-400' 
          : 'text-blue-200 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
        }
        ${isCollapsed ? 'justify-center px-2' : ''}
      `}
      title={isCollapsed ? item.label : undefined}
    >
      <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
        <span className={`${item.active ? 'text-yellow-400' : 'text-blue-300 group-hover:text-white'} transition-colors`}>
          {item.icon}
        </span>
        
        {!isCollapsed && (
          <span className="font-medium text-sm">{item.label}</span>
        )}
      </div>

      {/* Badge */}
      {!isCollapsed && item.badge && (
        <span className="
          bg-yellow-400 text-[#1e3a5f] 
          text-xs font-bold 
          px-2 py-0.5 rounded-full 
          min-w-[24px] text-center
        ">
          {item.badge}
        </span>
      )}

      {/* Tooltip quand collapsed */}
      {isCollapsed && item.badge && (
        <span className="absolute -top-1 -right-1 bg-yellow-400 text-[#1e3a5f] text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
          {item.badge}
        </span>
      )}
    </button>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 h-screen 
        bg-gradient-to-b from-[#1a365d] to-[#234876] 
        text-white flex flex-col shadow-xl z-50
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
        lg:relative lg:translate-x-0
        ${!isCollapsed && 'translate-x-0'}
      `}>
        
        {/* Header - Logo & Titre */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            {/* Blason/Logo placeholder */}
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0 border border-yellow-500/30">
              <img 
                src="/logo-benin.png" 
                alt="Blason" 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  // Fallback si pas d'image
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-yellow-400 font-bold text-lg">🇧🇯</span>';
                }}
              />
            </div>
            
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h1 className="text-[11px] leading-tight font-semibold uppercase tracking-wide text-blue-100">
                  Ministère des Enseignements
                  <br />
                  Secondaire, Technique et de la Formation Professionnelle
                </h1>
                <p className="text-[9px] text-blue-300 mt-1 uppercase tracking-wider">
                  République du Bénin
                </p>
              </div>
            )}
          </div>

          {/* Toggle bouton mobile */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="lg:hidden absolute top-4 right-4 p-1 rounded hover:bg-white/10"
          >
            {isCollapsed ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          {/* Toggle bouton desktop */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-[#234876] rounded-full items-center justify-center border border-white/20 shadow-md hover:bg-[#2d5a8c] transition-colors"
          >
            <ChevronRight size={14} className={`transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation Scrollable */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6 custom-scrollbar">
          
          {/* Section Principale */}
          <div className="space-y-1">
            {mainMenuItems.map(renderMenuItem)}
          </div>

          {/* Section Finances */}
          {!isCollapsed && (
            <div className="pt-4">
              <h3 className="px-4 text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">
                Finances & Gestion
              </h3>
            </div>
          )}
          
          {/* Séparateur visuel si collapsed */}
          {isCollapsed && (
            <div className="w-8 h-px bg-white/20 mx-auto my-4" />
          )}

          <div className="space-y-1">
            {financeMenuItems.map(renderMenuItem)}
          </div>

        </nav>

        {/* Footer - Profil Admin */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className={`
            flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors
            ${isCollapsed ? 'justify-center' : ''}
          `}>
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-sm font-bold border-2 border-blue-400">
                AD
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#1a365d] rounded-full"></div>
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">Admin Ministère</p>
                <p className="text-xs text-blue-300 truncate">Super Administrateur</p>
              </div>
            )}

            {!isCollapsed && (
              <LogOut size={16} className="text-blue-400 opacity-60 hover:opacity-100" />
            )}
          </div>
        </div>

      </aside>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
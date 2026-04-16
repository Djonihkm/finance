"use client"; // <--- TRÈS IMPORTANT : permet d'utiliser le hook usePathname

import React from 'react';
import Link from 'next/link'; // Utiliser Link pour une navigation fluide sans rechargement
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Wallet, 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname(); // Récupère l'URL actuelle (ex: "/bilan")

  // Définition des menus avec leurs chemins (href)
  // Assurez-vous que les href correspondent à vos dossiers dans /app
  const mainMenuItems = [
    { icon: <Home size={18} />, label: 'Établissements', href: '/etablissements' },
  ];

  const financeMenuItems = [
    { icon: <Wallet size={18} />, label: 'Budget', href: '/budget' },
    { icon: <LayoutDashboard size={18} />, label: 'Dépenses', href: '/depenses' },
    { icon: <FileText size={18} />, label: 'Bilan', href: '/bilan' },
    { icon: <Users size={18} />, label: 'Utilisateurs', href: '/utilisateurs' },
    { icon: <Settings size={18} />, label: 'Paramètres', href: '/parametres' },
  ];

  // Fonction pour déterminer la classe CSS selon si le lien est actif
  const getLinkClass = (href: string) => {
    const isActive = pathname === href;
    return `flex items-center gap-3 p-3 rounded-sm transition-all cursor-pointer ${
      isActive 
        ? 'bg-[#1e4a7a] text-white font-semibold shadow-inner' // Style quand ACTIF
        : 'text-gray-400 hover:bg-[#1e4a7a]/50 hover:text-white' // Style quand INACTIF
    }`;
  };

  return (
    <aside className="w-64 h-screen bg-[#11355b] flex flex-col text-white font-sans shrink-0">
      {/* Logo Section */}
      <div className="p-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 rounded flex items-center justify-center">
             {/* Remplacez par votre logo */}
             <span className="text-[10px]">LOGO</span>
          </div>
          <div className="text-[10px] leading-tight font-medium opacity-90 uppercase">
            Ministère des enseignements secondaire, technique et de la formation professionnelle
          </div>
        </div>
      </div>

      {/* Menu Principal (Établissements) */}
      <div className="px-3 mb-6">
        {mainMenuItems.map((item) => (
          <Link key={item.href} href={item.href} className={getLinkClass(item.href)}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Section Finances & Gestion */}
      <div className="flex-1 px-3">
        <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase px-3 mb-4">
          Finances & Gestion
        </p>
        
        <nav className="space-y-1">
          {financeMenuItems.map((item) => (
            <Link key={item.href} href={item.href} className={getLinkClass(item.href)}>
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Footer Profile Section */}
      <div className="p-4 mt-auto border-t border-blue-900/50">
        <div className="bg-[#1e4a7a]/50 p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-900 rounded-md flex items-center justify-center font-bold text-sm">
              AD
            </div>
            <div>
              <p className="text-xs font-bold">Admin Ministère</p>
              <p className="text-[10px] text-gray-400">Super Administrateur</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-white">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
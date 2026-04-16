"use client";

import React, { useState } from "react";
import {
  Building2,
  Wallet,
  Receipt,
  FileText,
  Users,
  Settings,
  ChevronRight,
  LogOut,
} from "lucide-react";
import Image from "next/image";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  active?: boolean;
}

const Sidebar: React.FC = () => {
  const [activeItem, setActiveItem] = useState("etablissements");
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Données du menu basées sur l'image
  const mainMenuItems: MenuItem[] = [
    {
      id: "etablissements",
      label: "Établissements",
      icon: <Building2 className="w-5 h-5" />,
      //   badge: '237',
      active: activeItem === "etablissements",
    },
  ];

  const financeMenuItems: MenuItem[] = [
    {
      id: "budget",
      label: "Budget",
      icon: <Wallet className="w-5 h-5" />,
      active: activeItem === "budget",
    },
    {
      id: "depenses",
      label: "Dépenses",
      icon: <Receipt className="w-5 h-5" />,
      active: activeItem === "depenses",
    },
    {
      id: "bilan",
      label: "Bilan",
      icon: <FileText className="w-5 h-5" />,
      active: activeItem === "bilan",
    },
    {
      id: "utilisateurs",
      label: "Utilisateurs",
      icon: <Users className="w-5 h-5" />,
      active: activeItem === "utilisateurs",
    },
    {
      id: "parametres",
      label: "Paramètres",
      icon: <Settings className="w-5 h-5" />,
      active: activeItem === "parametres",
    },
  ];

  const renderMenuItem = (item: MenuItem) => (
    <button
      key={item.id}
      onClick={() => setActiveItem(item.id)}
      className={`
        w-full flex items-center justify-between px-4 py-3 mb-1 rounded-lg transition-all duration-200 group relative
        ${
          item.active
            ? "bg-white/10 text-white border-l-4 border-yellow-400"
            : "text-blue-200 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
        }
        ${isCollapsed ? "justify-center px-2" : ""}
      `}
      title={isCollapsed ? item.label : undefined}
    >
      <div
        className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}
      >
        <span
          className={`${item.active ? "text-yellow-400" : "text-blue-300 group-hover:text-white"} transition-colors`}
        >
          {item.icon}
        </span>

        {!isCollapsed && (
          <span className="font-medium text-sm">{item.label}</span>
        )}
      </div>

      {/* Badge */}
      {!isCollapsed && item.badge && (
        <span
          className="
          bg-yellow-400 text-[#1e3a5f] 
          text-xs font-bold 
          px-2 py-0.5 rounded-full 
          min-w-[24px] text-center
        "
        >
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
      <aside
        className={`
        fixed top-0 left-0 h-screen 
        bg-gradient-to-b from-[#1a365d] to-[#234876] 
        text-white flex flex-col shadow-xl z-50
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-20" : "w-64"}
        lg:relative lg:translate-x-0
        ${!isCollapsed && "translate-x-0"}
      `}
      >
        {/* Header - Logo */}
        <div className="p-4 border-b border-white/10 relative">
          {/* Ligne mobile: bouton à droite, pas de chevauchement */}
          {/*   <div className="flex justify-end lg:hidden mb-2">
    <button
      onClick={() => setIsCollapsed(!isCollapsed)}
      className="p-1 rounded hover:bg-white/10"
      aria-label={isCollapsed ? 'Ouvrir le menu' : 'Fermer le menu'}
    >
      {isCollapsed ? <X size={20} /> : <Menu size={20} />}
    </button>
  </div> */}

          {/* Logo centré */}
          <div className="flex items-center justify-center">
            <div
              className={`relative transition-all duration-300 ${
                isCollapsed ? "w-8 h-8" : "w-40 h-12"
              }`}
            >
              <Image
                src={isCollapsed ? "/fav.png" : "/logo.svg"}
                alt="Logo du ministère"
                fill
                sizes={isCollapsed ? "32px" : "160px"}
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Toggle (desktop + mobile) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#234876] rounded-full items-center justify-center border border-white/20 shadow-md hover:bg-[#2d5a8c] transition-colors z-50"
            aria-label={
              isCollapsed ? "Déplier la sidebar" : "Replier la sidebar"
            }
          >
            <ChevronRight
              size={14}
              className={`transition-transform ${isCollapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Navigation Scrollable */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6 custom-scrollbar">
          {/* Section Principale */}
          <div className="space-y-1">{mainMenuItems.map(renderMenuItem)}</div>

          {/* Section Finances */}
          {!isCollapsed && (
            <div className="pt-4">
              <h3 className="px-4 text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">
                Finances & Gestion
              </h3>
            </div>
          )}

          {/* Séparateur visuel si collapsed */}
          {isCollapsed && <div className="w-8 h-px bg-white/20 mx-auto my-4" />}

          <div className="space-y-1">
            {financeMenuItems.map(renderMenuItem)}
          </div>
        </nav>

        {/* Footer - Profil Admin */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div
            className={`
            flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors
            ${isCollapsed ? "justify-center" : ""}
          `}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-sm font-bold border-2 border-blue-400">
                AD
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#1a365d] rounded-full"></div>
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  Admin Ministère
                </p>
                <p className="text-xs text-blue-300 truncate">
                  Super Administrateur
                </p>
              </div>
            )}

            {!isCollapsed && (
              <LogOut
                size={16}
                className="text-blue-400 opacity-60 hover:opacity-100"
              />
            )}
          </div>
        </div>
      </aside>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
        }
      `}</style>
    </>
  );
};

export default Sidebar;

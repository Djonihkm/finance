"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
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

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: string | number;
}

const Sidebar: React.FC = () => {
  const pathname = usePathname(); // Récupère l'URL actuelle (logique collègue)
  const [isCollapsed, setIsCollapsed] = useState(false); // Ta logique de réduction

  // Données du menu avec 'href' (logique collègue) mais tes icônes
  const mainMenuItems: MenuItem[] = [
    {
      label: "Établissements",
      icon: <Building2 className="w-5 h-5" />,
      href: "/etablissements",
    },
  ];

  const financeMenuItems: MenuItem[] = [
    {
      label: "Budget",
      icon: <Wallet className="w-5 h-5" />,
      href: "/budget",
    },
    {
      label: "Dépenses",
      icon: <Receipt className="w-5 h-5" />,
      href: "/depenses",
    },
    {
      label: "Bilan",
      icon: <FileText className="w-5 h-5" />,
      href: "/bilan",
    },
    {
      label: "Utilisateurs",
      icon: <Users className="w-5 h-5" />,
      href: "/utilisateurs",
    },
    {
      label: "Paramètres",
      icon: <Settings className="w-5 h-5" />,
      href: "/parametres",
    },
  ];

  // On garde ton rendu visuel, mais on enveloppe dans un Link
  const renderMenuItem = (item: MenuItem) => {
    const isActive = pathname === item.href; // Détection de la page active

    return (
      <Link
        key={item.href}
        href={item.href}
        className={`
          w-full flex items-center justify-between px-4 py-3 mb-1 rounded-lg transition-all duration-200 group relative
          ${
            isActive
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
            className={`${isActive ? "text-yellow-400" : "text-blue-300 group-hover:text-white"} transition-colors`}
          >
            {item.icon}
          </span>

          {!isCollapsed && (
            <span className="font-medium text-sm">{item.label}</span>
          )}
        </div>

        {/* Badge (optionnel, conservé de ta version) */}
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

        {isCollapsed && item.badge && (
          <span className="absolute -top-1 -right-1 bg-yellow-400 text-[#1e3a5f] text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Sidebar Container - Ta structure visuelle */}
      <aside
        className={`
        fixed top-0 left-0 h-screen 
        bg-gradient-to-b from-[#1a365d] to-[#234876] 
        text-white flex flex-col shadow-xl z-50
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-20" : "w-64"}
        lg:relative lg:translate-x-0
      `}
      >
        {/* Header - Logo (Ta version améliorée) */}
        <div className="p-4 border-b border-white/10 relative">
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

          {/* Toggle (Ta version unifiée desktop/mobile) */}
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

        {/* Footer - Profil Admin (Ta version) */}
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
"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Building2,
  Wallet,
  Receipt,
  FileText,
  Users,
  Settings,
  CircleUserRound,
  School,
  X,
  LogOut,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";
import type { UserRole } from "@/lib/types";
import LogoutModal from "./LogoutModal";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface SidebarProps {
  role: UserRole;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onNavigate: (href: string) => void;
}

type ScreenSize = "mobile" | "tablet" | "desktop";

const superAdminMenuItems: MenuItem[] = [
  { label: "Établissements", icon: <Building2 className="w-5 h-5" />, href: "/etablissements" },
  { label: "Utilisateurs", icon: <Users className="w-5 h-5" />, href: "/utilisateurs" },
  { label: "Paramètres", icon: <Settings className="w-5 h-5" />, href: "/parametres" },
];

const ministereMenuItems: MenuItem[] = [
  { label: "Établissements", icon: <Building2 className="w-5 h-5" />, href: "/etablissements" },
  { label: "Budget", icon: <Wallet className="w-5 h-5" />, href: "/budget" },
  { label: "Dépenses", icon: <Receipt className="w-5 h-5" />, href: "/depenses" },
  { label: "Bons de commande", icon: <ClipboardList className="w-5 h-5" />, href: "/bons" },
  { label: "Bilan", icon: <FileText className="w-5 h-5" />, href: "/bilan" },
  { label: "Utilisateurs", icon: <Users className="w-5 h-5" />, href: "/utilisateurs" },
];

const etablissementMenuItems: MenuItem[] = [
  { label: "Mon Établissement", icon: <School className="w-5 h-5" />, href: "/mon-etablissement" },
  { label: "Dépenses", icon: <Receipt className="w-5 h-5" />, href: "/depensesEtablissement" },
  { label: "Profil", icon: <CircleUserRound className="w-5 h-5" />, href: "/profil" },
  { label: "Paramètres", icon: <Settings className="w-5 h-5" />, href: "/parametres" },
];

const roleConfig: Record<UserRole, {
  menuItems: MenuItem[];
  sectionLabel: string;
  userLabel: string;
  userSub: string;
  userInitials: string;
}> = {
  superadmin: {
    menuItems: superAdminMenuItems,
    sectionLabel: "SUPER ADMIN",
    userLabel: "Développeur",
    userSub: "Accès total système",
    userInitials: "SA",
  },
  ministere: {
    menuItems: ministereMenuItems,
    sectionLabel: "MINISTÈRE",
    userLabel: "Ministère",
    userSub: "Administrateur",
    userInitials: "MI",
  },
  etablissement: {
    menuItems: etablissementMenuItems,
    sectionLabel: "ÉTABLISSEMENT",
    userLabel: "Établissement",
    userSub: "Gestionnaire",
    userInitials: "ET",
  },
};

const Sidebar: React.FC<SidebarProps> = ({ role, isMobileOpen, onCloseMobile, onNavigate }) => {
  const pathname = usePathname();
  const [screenSize, setScreenSize] = useState<ScreenSize>("desktop");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const config = roleConfig[role];

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w < 640) setScreenSize("mobile");
      else if (w < 1024) setScreenSize("tablet");
      else setScreenSize("desktop");
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleNav = (href: string) => {
    if (href === pathname) return;
    onNavigate(href);
  };

  const showLabels =
    screenSize === "desktop" || (screenSize === "mobile" && isMobileOpen);

  const renderMenuItem = (item: MenuItem) => {
    const isActive = pathname === item.href;
    return (
      <button
        key={item.href}
        onClick={() => handleNav(item.href)}
        title={!showLabels ? item.label : undefined}
        className={`
          w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-all duration-200 group
          border-l-4 cursor-pointer
          ${isActive
            ? "bg-white/10 text-white border-yellow-400"
            : "text-blue-200 hover:text-white hover:bg-white/5 border-transparent"
          }
          ${!showLabels ? "justify-center px-2" : ""}
        `}
      >
        <span className={`shrink-0 transition-colors ${isActive ? "text-yellow-400" : "text-blue-300 group-hover:text-white"}`}>
          {item.icon}
        </span>
        {showLabels && (
          <span className="flex-1 text-left font-medium text-sm">{item.label}</span>
        )}
      </button>
    );
  };

  return (
    <>
      {screenSize === "mobile" && isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onCloseMobile} />
      )}

      <aside
        className={`
          bg-linear-to-b from-[#1a365d] to-[#234876]
          text-white flex flex-col shadow-xl z-50 transition-all duration-300 ease-in-out
          ${screenSize === "mobile"
            ? `fixed inset-y-0 left-0 w-72 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`
            : `relative self-stretch shrink-0 ${screenSize === "tablet" ? "w-20" : "w-64"}`
          }
        `}
      >
        {/* Logo */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between min-h-16">
          <div className={`relative transition-all duration-300 ${showLabels ? "w-40 h-12" : "w-8 h-8"}`}>
            <Image
              src={showLabels ? "/logo.svg" : "/fav.png"}
              alt="Logo"
              fill
              sizes={showLabels ? "160px" : "32px"}
              className="object-contain"
              priority
            />
          </div>
          {screenSize === "mobile" && isMobileOpen && (
            <button
              onClick={onCloseMobile}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 transition-all shrink-0"
              aria-label="Fermer le menu"
            >
              <X size={14} className="text-white" />
            </button>
          )}
        </div>

        {/* Badge rôle visible uniquement pour superadmin */}
        {role === "superadmin" && showLabels && (
          <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-1.5 rounded-md bg-yellow-400/10 border border-yellow-400/30">
            <ShieldCheck size={13} className="text-yellow-400 shrink-0" />
            <span className="text-xs font-semibold text-yellow-300 uppercase tracking-wider">Super Admin</span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-4 custom-scrollbar">
          {showLabels ? (
            <h3 className="px-4 text-xs font-bold text-blue-400 uppercase tracking-wider pt-2">
              {config.sectionLabel}
            </h3>
          ) : (
            <div className="w-8 h-px bg-white/20 mx-auto my-2" />
          )}
          <div className="space-y-1">{config.menuItems.map(renderMenuItem)}</div>
        </nav>

        {/* Footer utilisateur */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${!showLabels ? "justify-center" : ""}`}>
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-sm font-bold border-2 border-blue-400">
                {config.userInitials}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#1a365d] rounded-full" />
            </div>
            {showLabels && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{config.userLabel}</p>
                  <p className="text-xs text-blue-300 truncate">{config.userSub}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="text-blue-400 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                  aria-label="Se déconnecter"
                  title="Se déconnecter"
                >
                  <LogOut size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {showLogoutModal && (
        <LogoutModal onCancel={() => setShowLogoutModal(false)} />
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }
      `}</style>
    </>
  );
};

export default Sidebar;

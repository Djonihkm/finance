import React from "react";
import { Bell, Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="w-full bg-white flex-shrink-0">
      <div className="flex items-center h-16 px-4 lg:px-8 border-b border-gray-100">

        {/* Bouton hamburger — visible UNIQUEMENT sur mobile (< 640px) */}
        <button
          onClick={onMenuClick}
          className="sm:hidden p-2 rounded-md hover:bg-gray-100 transition-colors mr-2"
          aria-label="Ouvrir le menu"
        >
          <Menu size={20} className="text-gray-600" />
        </button>

        {/* Spacer — pousse notif+profil tout à droite */}
        <div className="flex-1" />

        {/* Notif + Profil — toujours à droite */}
        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-full transition-colors">
            <Bell size={20} className="text-gray-500" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
          </div>

          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 bg-[#f0f4f8] rounded-md flex items-center justify-center border border-gray-200 group-hover:bg-gray-100 transition-colors">
              <span className="text-[#11355b] font-bold text-sm tracking-tighter">AD</span>
            </div>
          </div>
        </div>

      </div>

      {/* Liseré tricolore */}
      <div className="flex h-1 w-full">
        <div className="flex-[0.35] bg-[#008751]" />
        <div className="flex-[0.35] bg-[#fcd116]" />
        <div className="flex-[0.3]  bg-[#e8112d]" />
      </div>
    </header>
  );
};

export default Header;
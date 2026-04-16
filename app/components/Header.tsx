import React from "react";
import { Bell } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full bg-white">
      {/* Contenu du Header */}
      <div className="flex items-center justify-end px-8 py-3 h-16 border-b border-gray-100">
        <div className="flex items-center gap-6">
          {/* Icône Notification */}
          <div className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-full transition-colors">
            <Bell size={20} className="text-gray-500" />
            {/* Point rouge de notification */}
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
          </div>

          {/* Profil / Initiales */}
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 bg-[#f0f4f8] rounded-md flex items-center justify-center border border-gray-200 group-hover:bg-gray-100 transition-colors">
              <span className="text-[#11355b] font-bold text-sm tracking-tighter">
                AD
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Liseré tricolore (Drapeau) */}
      <div className="flex h-1 w-full">
        <div className="flex-[0.35] bg-[#008751]"></div> {/* Vert */}
        <div className="flex-[0.35] bg-[#fcd116]"></div> {/* Jaune */}
        <div className="flex-[0.3] bg-[#e8112d]"></div> {/* Rouge */}
      </div>
    </header>
  );
};

export default Header;

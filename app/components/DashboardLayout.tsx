"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobile = () => setIsMobileOpen(prev => !prev);
  const closeMobile = () => setIsMobileOpen(false);

  return (
<div className="flex h-screen overflow-hidden w-full bg-[#f8f9fa] text-black">
  <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={closeMobile} />

  {/* PAS de classe ml-* ici — flex-1 suffit */}
  <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
    <Header onMenuClick={toggleMobile} />
    <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
      {children}
    </main>
  </div>
</div>
  );
}
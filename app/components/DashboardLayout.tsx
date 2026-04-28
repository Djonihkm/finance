"use client";

import { useState } from "react";
import { NavigationProvider, useNavigation } from "@/lib/navigation-context";
import { useRole } from "@/lib/role-context";
import { Spinner } from "./Spinner";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userNom?: string;
  userPrenom?: string;
  userPrismaRole?: string;
}

function DashboardContent({ children, userNom, userPrenom, userPrismaRole }: DashboardLayoutProps) {
  const role = useRole();
  const { navigate, isPending } = useNavigation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleNav = (href: string) => {
    navigate(href);
    setIsMobileOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden w-full bg-[#f8f9fa] text-black">
      <Sidebar
        role={role}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        onNavigate={handleNav}
        userNom={userNom}
        userPrenom={userPrenom}
        userPrismaRole={userPrismaRole}
      />
      <div className="relative flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onMenuClick={() => setIsMobileOpen((v) => !v)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#11355b]/20 backdrop-blur-[2px]">
            <Spinner size={48} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardLayout(props: DashboardLayoutProps) {
  return (
    <NavigationProvider>
      <DashboardContent {...props} />
    </NavigationProvider>
  );
}

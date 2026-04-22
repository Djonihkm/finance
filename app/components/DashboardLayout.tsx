"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useRole } from "@/lib/role-context";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const role = useRole();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleNav = (href: string) => {
    startTransition(() => router.push(href));
    setIsMobileOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden w-full bg-[#f8f9fa] text-black">
      <Sidebar
        role={role}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        onNavigate={handleNav}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onMenuClick={() => setIsMobileOpen((v) => !v)} />
        <main className="relative flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {isPending && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#f8f9fa]/70 backdrop-blur-[1px]">
              <Loader2 className="w-8 h-8 animate-spin text-[#1a365d]" />
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

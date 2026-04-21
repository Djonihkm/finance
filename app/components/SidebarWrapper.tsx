"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import type { UserRole } from "@/lib/mock-users";

export default function SidebarWrapper({ role }: { role: UserRole }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <Sidebar
      role={role}
      isMobileOpen={isMobileOpen}
      onCloseMobile={() => setIsMobileOpen(false)}
    />
  );
}
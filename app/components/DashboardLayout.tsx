// app/layout.tsx ou components/DashboardLayout.tsx
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // h-screen : force la hauteur à la taille de l'écran
    // overflow-hidden : empêche toute la page de scroller
    <div className="flex h-screen overflow-hidden w-full bg-[#f8f9fa] text-black">
      {/* 1. Sidebar à gauche (fixe) */}
      <Sidebar />

      {/* 2. Conteneur de droite (Header + Contenu) */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Header en haut */}
        <Header />

        {/* Zone de contenu principal (scrollable si besoin) */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

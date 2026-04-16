// app/layout.tsx ou components/DashboardLayout.tsx
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <div className="flex min-h-screen w-full bg-[#f8f9fa]">
          {/* 1. Sidebar à gauche (fixe) */}
          <Sidebar />

          {/* 2. Conteneur de droite (Header + Contenu) */}
          <div className="flex flex-col flex-1">
            {/* Header en haut */}
            <Header />

            {/* Zone de contenu principal (scrollable si besoin) */}
            <main className="flex-1 p-8 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
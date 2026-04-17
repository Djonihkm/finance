import Link from 'next/link';
import { FileSearch } from 'lucide-react';
import BackButton from './components/BackButton';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">

        {/* Illustration */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="w-32 h-32 bg-[#11355b]/5 rounded-full flex items-center justify-center">
            <div className="w-20 h-20 bg-[#11355b]/10 rounded-full flex items-center justify-center">
              <FileSearch size={36} className="text-[#11355b]" />
            </div>
          </div>
          <span className="absolute -top-2 -right-2 text-4xl font-black text-[#11355b]/10 select-none">
            404
          </span>
        </div>

        {/* Texte */}
        <h1 className="text-5xl font-black text-[#11355b] mb-3 tracking-tight">404</h1>
        <p className="text-lg font-semibold text-gray-700 mb-2">Page introuvable</p>
        <p className="text-sm text-gray-400 leading-relaxed mb-8">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.<br />
          Vérifiez l&apos;URL ou retournez à la page précédente.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <BackButton />
          <Link
            href="/etablissements"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#11355b] hover:bg-[#1a4a7a] text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer shadow-sm"
          >
            Accueil
          </Link>
        </div>

        {/* Footer discret */}
        <p className="text-xs text-gray-300 mt-10 uppercase tracking-widest font-bold">
          Ministère des Enseignements — Bénin
        </p>
      </div>
    </div>
  );
}

"use client";

import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
    >
      <ArrowLeft size={16} />
      Retour
    </button>
  );
}

"use client";

import { Copy } from "lucide-react";

export default function CopyButton({ value }: { value: string }) {
  return (
    <button
      type="button"
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#11355b] transition-colors cursor-pointer"
      onClick={() => navigator.clipboard?.writeText(value)}
      aria-label="Copier le code"
    >
      <Copy size={14} />
    </button>
  );
}

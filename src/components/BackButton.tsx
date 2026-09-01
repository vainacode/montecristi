'use client';

import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  children?: ReactNode;
  className?: string;
}

export function BackButton({ children, className }: BackButtonProps) {
  return (
    <button
      onClick={() => window.history.back()}
      className={className || "w-full sm:w-auto flex items-center justify-center gap-3 border-2 border-brand-dark text-brand-dark px-8 py-4 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-zinc-50 transition-all active:scale-95"}
    >
      {children || (
        <>
          <ArrowLeft size={16} /> Regresar
        </>
      )}
    </button>
  );
}

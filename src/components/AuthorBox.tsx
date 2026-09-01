import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@/config/site';

interface AuthorBoxProps {
  authorName?: string;
  authorRole?: string;
  publishedAt?: string; // ISO date string
}

export function AuthorBox({
  authorName = 'Redacción',
  authorRole = 'Equipo Editorial',
  publishedAt,
}: AuthorBoxProps) {
  const initials = authorName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const dateStr = publishedAt
    ? new Date(publishedAt).toLocaleDateString('es-DO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="mt-12 border border-gray-100 rounded-sm overflow-hidden shadow-sm bg-white">
      {/* Header strip */}
      <div className="h-1 w-full bg-gradient-to-r from-brand-dark to-brand-light" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6">
        {/* Avatar: logo.svg de blanco con fondo de la foto rojo */}
        <div className="shrink-0 w-16 h-16 rounded-full bg-[#BF1B23] p-3 flex items-center justify-center shadow-md select-none overflow-hidden ring-2 ring-[#BF1B23]/20">
          <Image
            src="/logo.svg"
            alt="Redacción Montecristi"
            width={40}
            height={40}
            className="w-full h-full object-contain brightness-0 invert"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-brand-dark text-lg leading-tight">{authorName}</h3>
          <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5">
            {authorRole} · {siteConfig.name}
          </p>
        </div>

        {/* Link */}
        <Link
          href="/conocenos"
          className="shrink-0 text-[9px] font-black uppercase tracking-widest text-brand-dark border border-brand-dark px-4 py-2 hover:bg-brand-dark hover:text-white transition-colors rounded-sm"
        >
          Conócenos
        </Link>
      </div>
    </div>
  );
}

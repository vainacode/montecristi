import type { PostSource } from '@/lib/wp-helpers';

interface SourceCreditProps {
  source?: PostSource;
  /** Enlaza al artículo original. No usarlo dentro de otro enlace. */
  linked?: boolean;
  className?: string;
}

/** Crédito visible: de qué medio salió la noticia. */
export function SourceCredit({ source, linked = false, className = '' }: SourceCreditProps) {
  if (!source?.name) return null;

  const href = source.link || source.url;
  const name = <span className="text-gray-800">{source.name}</span>;

  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider text-gray-500 ${className}`}>
      Fuente:{' '}
      {linked && href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="text-gray-800 underline decoration-[#BF1B23]/40 underline-offset-2 hover:text-[#BF1B23]"
        >
          {source.name}
        </a>
      ) : (
        name
      )}
    </span>
  );
}

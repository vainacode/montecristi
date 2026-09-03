'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface ArticleData {
  id: number;
  title: string;
  slug: string;
  category: string;
  categorySlug: string;
  url: string;
  commentLink: string;
  excerpt: string;
  featuredImage: string;
  images: string[];
  topQuote?: string;
}

interface CopyOption {
  id: string;
  name: string;
  text: string;
}

interface RecentPost {
  id: number;
  title: string;
  slug: string;
  category: string;
  categorySlug: string;
  imageUrl: string;
  url: string;
}

const BADGE_PRESETS = [
  'FARÁNDULA',
  'VIRAL',
  'POLÉMICA',
  'EXCLUSIVA',
  'DECLARACIONES',
  'ÚLTIMA HORA',
  'SIN ETIQUETA'
];

function RedaccionFbContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialUrl = searchParams.get('url') || '';

  const [urlInput, setUrlInput] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [copies, setCopies] = useState<CopyOption[]>([]);
  const [activeCopyId, setActiveCopyId] = useState<string>('viral');
  const [customCopyText, setCustomCopyText] = useState('');
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);

  // Configuración de imagen limpia (photo-first)
  const [style, setStyle] = useState<'split' | 'circle' | 'play' | 'single'>('split');
  const [img1, setImg1] = useState<string>('');
  const [img2, setImg2] = useState<string>('');
  const [img3, setImg3] = useState<string>('');
  const [badge, setBadge] = useState<string>('FARÁNDULA');

  // Titular en la imagen (opcional)
  const [enableTextOverlay, setEnableTextOverlay] = useState<boolean>(true);
  const [headline, setHeadline] = useState<string>('');
  const [headlinePos, setHeadlinePos] = useState<'bottom' | 'top' | 'center'>('bottom');
  const [suggestedHeadlines, setSuggestedHeadlines] = useState<{ id: string; name: string; text: string }[]>([]);

  // Contador de versión para refresco instantáneo sin caché
  const [imgVersion, setImgVersion] = useState<number>(1);

  // Estados de copiado y feedback
  const [copiedText, setCopiedText] = useState(false);
  const [copiedCommentLink, setCopiedCommentLink] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [imageToast, setImageToast] = useState<string | null>(null);

  // Cargar posts recientes al inicio
  useEffect(() => {
    fetch('/api/viral-article-info')
      .then((r) => r.json())
      .then((data) => {
        if (data.recentPosts) setRecentPosts(data.recentPosts);
      })
      .catch(() => {});
  }, []);

  const loadArticle = useCallback(async (targetUrl: string) => {
    if (!targetUrl) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/viral-article-info?url=${encodeURIComponent(targetUrl)}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'No se pudo cargar el artículo.');
      }

      const post: ArticleData = data.post;
      setArticle(post);
      setCopies(data.copies || []);
      setActiveCopyId(data.copies?.[0]?.id || 'viral');
      setCustomCopyText((data.copies?.[0]?.text || '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim());

      // Selección inteligente de 3 fotos distintas
      const allImgs = post.images || [];
      const primaryImg = allImgs[0] || post.featuredImage || '';
      const secondaryImg = allImgs.find((img) => img !== primaryImg) || (allImgs.length > 1 ? allImgs[1] : '');
      const tertiaryImg = allImgs.find((img) => img !== primaryImg && img !== secondaryImg) || (allImgs.length > 2 ? allImgs[2] : (allImgs[1] || primaryImg));

      setImg1(primaryImg);
      setImg2(secondaryImg);
      setImg3(tertiaryImg);

      if (secondaryImg && secondaryImg !== primaryImg) {
        setStyle('split');
      } else {
        setStyle('single');
      }

      setBadge(post.category.toUpperCase() || 'FARÁNDULA');

      // Titular generado automáticamente por el algoritmo
      const initialHeadline = data.suggestedHeadline || data.suggestedHeadlines?.[0]?.text || '';
      setSuggestedHeadlines(data.suggestedHeadlines || []);
      setHeadline(initialHeadline);
      setEnableTextOverlay(Boolean(initialHeadline));
      setHeadlinePos('bottom');

      setImgVersion((v) => v + 1);

      router.replace(`/redaccion-fb?url=${encodeURIComponent(targetUrl)}`, { scroll: false });
    } catch (err: any) {
      setError(err.message || 'Error al procesar el artículo.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (initialUrl && !article) {
      loadArticle(initialUrl);
    }
  }, [initialUrl, loadArticle, article]);

  // Actualizar versión de imagen cada vez que cambia un parámetro
  const triggerImageRefresh = () => {
    setImgVersion((v) => v + 1);
  };

  // Construir URL de la imagen generada
  const buildImageUrl = (format: 'png' | 'webp' = 'webp', download = false) => {
    const params = new URLSearchParams();
    if (img1) params.append('url1', img1);
    if (img2 && style !== 'single') params.append('url2', img2);
    if (img3 && style === 'circle') params.append('url3', img3);
    params.append('style', style);
    
    if (enableTextOverlay && headline.trim()) {
      params.append('headline', headline.trim());
      params.append('headlinePos', headlinePos);
    }
    
    if (badge && badge !== 'SIN ETIQUETA') {
      params.append('badge', badge.replace(/^[^\w\s]+/, '').trim());
    }

    params.append('format', format);
    if (download) params.append('download', '1');
    if (article?.slug) params.append('title', `fb-${article.slug}`);
    params.append('_v', imgVersion.toString());

    return `/api/viral-image?${params.toString()}`;
  };

  const currentPreviewUrl = buildImageUrl('webp');

  const handleCopyText = async () => {
    const cleanText = customCopyText.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
    try {
      await navigator.clipboard.writeText(cleanText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 3000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = cleanText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 3000);
    }
  };

  const handleCopyCommentLink = async () => {
    if (!article?.url) return;
    try {
      await navigator.clipboard.writeText(article.url);
      setCopiedCommentLink(true);
      setTimeout(() => setCopiedCommentLink(false), 3000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = article.url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedCommentLink(true);
      setTimeout(() => setCopiedCommentLink(false), 3000);
    }
  };

  const handleCopyImage = async () => {
    setIsCopyingImage(true);
    setImageToast('Generando imagen limpia en alta resolución...');

    try {
      const pngUrl = buildImageUrl('png');
      const res = await fetch(pngUrl);
      if (!res.ok) throw new Error('Error al generar la imagen');

      const blob = await res.blob();

      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          setImageToast('✓ ¡Foto copiada al portapapeles! Lista para pegar en Facebook.');
          setTimeout(() => setImageToast(null), 4000);
          setIsCopyingImage(false);
          return;
        } catch {}
      }

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `portada-fb-${article?.slug || 'post'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      setImageToast('✓ Foto con cintillo descargada en tu computadora.');
      setTimeout(() => setImageToast(null), 4000);
    } catch {
      setImageToast('Error al copiar la imagen. Intenta descargándola.');
      setTimeout(() => setImageToast(null), 4000);
    } finally {
      setIsCopyingImage(false);
    }
  };

  const handleDownloadImage = () => {
    const downloadUrl = buildImageUrl('png', true);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `portada-fb-${article?.slug || 'post'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePasteUrl = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text);
        loadArticle(text);
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white pb-24 font-sans selection:bg-[#BF1B23] selection:text-white">
      {/* ── BARRA PRIVADA DE REDACCIÓN ── */}
      <header className="border-b border-white/10 bg-[#040813]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#042564] border border-blue-500/30 p-1.5 flex items-center justify-center">
                <Image src="/logo.svg" alt="Montecristi.net" width={20} height={20} className="w-full h-full object-contain brightness-125" />
              </div>
              <span className="font-black tracking-tight text-white uppercase text-sm leading-none">
                MONTECRISTI<span className="text-red-500">.NET</span>
              </span>
            </Link>
            <span className="text-gray-500 text-xs">/</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-300 text-[10px] font-black uppercase tracking-wider">
              <span>🔒 Panel Editorial Privado</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-500 hidden sm:inline">Uso exclusivo del administrador</span>
            <Link
              href="/"
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              ← Ir al portal
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO & BUSCADOR DE ENLACE ── */}
      <section className="container mx-auto px-4 pt-8 pb-6 max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
            Creador de Portadas &amp; Posts de <span className="bg-gradient-to-r from-[#FFE600] via-red-500 to-[#FF4500] bg-clip-text text-transparent">Alta Intriga para Facebook</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">
            Fotos limpias y cinematográficas con cintillo oficial + textos de intriga para Facebook que mandan al primer comentario.
          </p>
        </div>

        {/* INPUT DE ENLACE */}
        <div className="bg-[#0e1628] border border-white/15 rounded-2xl p-3 sm:p-4 shadow-2xl relative max-w-3xl mx-auto mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadArticle(urlInput);
            }}
            className="flex flex-col sm:flex-row gap-2.5"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Pega el enlace del artículo (ej: https://montecristi.net/farandula/...)"
                className="w-full bg-[#080d1a] border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
              />
              <button
                type="button"
                onClick={handlePasteUrl}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
                title="Pegar del portapapeles"
              >
                Pegar
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !urlInput.trim()}
              className="bg-gradient-to-r from-red-600 to-[#BF1B23] hover:from-red-500 hover:to-red-600 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Cargando...</span>
                </>
              ) : (
                <>
                  <span>⚡ Cargar Noticia</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <span className="text-red-400 font-bold">Error:</span> {error}
            </div>
          )}
        </div>

        {/* NOTICIAS RECIENTES PARA SELECCIÓN RÁPIDA */}
        {recentPosts.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              <span>O selecciona una noticia reciente:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentPosts.slice(0, 6).map((post) => (
                <button
                  key={post.id}
                  onClick={() => {
                    setUrlInput(post.url);
                    loadArticle(post.url);
                  }}
                  className="text-left text-xs bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/50 rounded-lg px-3 py-1.5 text-gray-300 hover:text-white transition-all max-w-[280px] truncate"
                >
                  <span className="text-red-400 font-bold mr-1.5">[{post.category}]</span>
                  {post.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── RESULTADOS ── */}
      {article && (
        <main className="container mx-auto px-4 max-w-6xl mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* ═════════ COLUMNA IZQUIERDA: FOTO LIMPIA CON CINTILLO ═════════ */}
            <div className="lg:col-span-7 space-y-5">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📸</span>
                  <h2 className="text-base sm:text-lg font-bold text-white">Foto con Cintillo Oficial</h2>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-md border border-green-500/20">
                  ✓ Alta Resolución 16:9
                </span>
              </div>

              {/* SELECTOR DE ESTILO FOTOGRÁFICO */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-gray-400 block mb-2">
                  Composición Visual:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'split', name: '⚡ Split Shock', desc: '50/50 Dos Fotos' },
                    { id: 'circle', name: '🎯 3 Fotos (Círculo)', desc: 'Izq + Der + Círculo' },
                    { id: 'play', name: '▶️ Play Badge', desc: 'Para videos' },
                    { id: 'single', name: '🖼️ Foto Única', desc: '1 foto completa' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setStyle(s.id as any);
                        triggerImageRefresh();
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        style === s.id
                          ? 'bg-red-600/20 border-red-500 text-white shadow-md'
                          : 'bg-[#0d1424] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold text-xs">{s.name}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* SELECTOR DE FOTOS DETECTADAS CON BOTONES CLAROS */}
              {article.images && article.images.length > 0 && (
                <div className="space-y-3 bg-[#0e1628] border border-white/15 rounded-xl p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-300">
                      {article.images.length} Fotos detectadas en este artículo:
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {style === 'circle' ? 'Asigna Foto Izquierda, Derecha y Círculo Central' : 'Asigna Foto Izquierda y Derecha'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-1">
                    {article.images.map((img, idx) => {
                      const isLeft = img1 === img;
                      const isRight = img2 === img && style !== 'single';
                      const isCircle = img3 === img && style === 'circle';
                      return (
                        <div
                          key={idx}
                          className={`relative rounded-xl overflow-hidden border-2 transition-all p-1 bg-[#080d1a] ${
                            isLeft
                              ? 'border-red-500 ring-2 ring-red-500/40 shadow-lg'
                              : isRight
                              ? 'border-yellow-400 ring-2 ring-yellow-400/40 shadow-lg'
                              : isCircle
                              ? 'border-blue-400 ring-2 ring-blue-400/40 shadow-lg'
                              : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-1.5">
                            <Image src={img} alt={`Foto ${idx + 1}`} fill className="object-cover" />
                            <span className="absolute top-1 left-1 text-[9px] font-bold bg-black/80 px-1 rounded text-white">
                              #{idx + 1}
                            </span>
                            {isLeft && (
                              <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded shadow">
                                🔴 Izq
                              </span>
                            )}
                            {isRight && (
                              <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-yellow-500 text-black px-1.5 py-0.5 rounded shadow">
                                🟡 Der
                              </span>
                            )}
                            {isCircle && (
                              <span className="absolute top-1 right-1 text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded shadow">
                                🔵 Círculo
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setImg1(img);
                                triggerImageRefresh();
                              }}
                              className={`flex-1 py-1 text-[9px] font-bold rounded transition-all cursor-pointer ${
                                isLeft ? 'bg-red-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-red-600/30 hover:text-white'
                              }`}
                              title="Poner esta foto a la izquierda"
                            >
                              🔴 Izq
                            </button>
                            {style !== 'single' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setImg2(img);
                                  triggerImageRefresh();
                                }}
                                className={`flex-1 py-1 text-[9px] font-bold rounded transition-all cursor-pointer ${
                                  isRight ? 'bg-yellow-500 text-black' : 'bg-white/10 text-gray-300 hover:bg-yellow-500/30 hover:text-white'
                                }`}
                                title="Poner esta foto a la derecha"
                              >
                                🟡 Der
                              </button>
                            )}
                            {style === 'circle' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setImg3(img);
                                  triggerImageRefresh();
                                }}
                                className={`flex-1 py-1 text-[9px] font-bold rounded transition-all cursor-pointer ${
                                  isCircle ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-blue-600/30 hover:text-white'
                                }`}
                                title="Poner esta foto en el círculo central"
                              >
                                🔵 Círculo
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {style === 'circle' && (
                    <div className="text-[11px] text-blue-300 bg-blue-950/40 border border-blue-500/30 p-2.5 rounded-lg">
                      🎯 <strong>Modo 3 Fotos:</strong> Asigna qué foto va a la <strong>Izquierda (🔴)</strong>, a la <strong>Derecha (🟡)</strong> y en el <strong>Círculo Central (🔵)</strong> haciendo clic en los botones de cada foto.
                    </div>
                  )}

                  {img1 && img2 && img1 === img2 && style !== 'single' && (
                    <div className="text-[11px] text-yellow-400 bg-yellow-950/40 border border-yellow-500/30 p-2 rounded-lg">
                      ⚠️ Has seleccionado la misma foto para la izquierda y la derecha. Elige otra para crear el contraste.
                    </div>
                  )}
                </div>
              )}

              {/* TITULAR EN EL CENTRO & INSIGNIA */}
              <div className="bg-[#0e1628] border border-white/15 rounded-xl p-3.5 space-y-3">
                {/* Switch de Titular en el centro */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enableTextOverlay}
                      onChange={(e) => {
                        setEnableTextOverlay(e.target.checked);
                        triggerImageRefresh();
                      }}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-[#080d1a] border-white/20"
                    />
                    <span className="text-xs font-bold text-yellow-400">
                      Superponer titular (Cubre 100% en fondo amarillo)
                    </span>
                  </label>

                  {enableTextOverlay && (
                    <div className="mt-2.5 space-y-2 animate-in fade-in duration-150">
                      <input
                        type="text"
                        value={headline}
                        onChange={(e) => {
                          setHeadline(e.target.value);
                          triggerImageRefresh();
                        }}
                        className="w-full bg-[#080d1a] border border-yellow-500/40 rounded-lg px-3 py-2 text-xs text-yellow-300 font-bold focus:outline-none focus:border-yellow-400"
                        placeholder="Ejemplo: ¡HABLA CASABLANCA Y NO SE GUARDA NADA!"
                      />

                      {suggestedHeadlines.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 block mb-1">
                            ⚡ Titulares generados por el algoritmo (Haz clic para alternar):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {suggestedHeadlines.map((h) => {
                              const isActive = headline === h.text;
                              return (
                                <button
                                  key={h.id}
                                  type="button"
                                  onClick={() => {
                                    setHeadline(h.text);
                                    triggerImageRefresh();
                                  }}
                                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer text-left ${
                                    isActive
                                      ? 'bg-yellow-400 text-black border-yellow-300 shadow-md'
                                      : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:border-yellow-400/50'
                                  }`}
                                >
                                  <span>{h.name}: </span>
                                  <span className={isActive ? 'font-black text-black' : 'font-semibold text-yellow-300'}>{h.text}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div>
                        <span className="text-[10px] font-bold text-gray-400 block mb-1">
                          Lugar donde colocar el titular:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { id: 'bottom', label: '⬇️ Abajo (Sobre el cintillo - Recomendado)' },
                            { id: 'top', label: '⬆️ Arriba (Cabecera)' },
                            { id: 'center', label: '↔️ Centro' },
                          ].map((pos) => (
                            <button
                              key={pos.id}
                              type="button"
                              onClick={() => {
                                setHeadlinePos(pos.id as any);
                                triggerImageRefresh();
                              }}
                              className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                headlinePos === pos.id
                                  ? 'bg-yellow-500 text-black border-yellow-400 shadow-md'
                                  : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
                              }`}
                            >
                              {pos.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Insignia en esquina superior */}
                <div className="pt-2 border-t border-white/10">
                  <label className="text-[11px] font-bold text-gray-300 block mb-1.5">
                    Etiqueta sutil en la esquina superior (Opcional):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {BADGE_PRESETS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => {
                          setBadge(b);
                          triggerImageRefresh();
                        }}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-md border transition-all ${
                          badge === b ? 'bg-red-600 border-red-400 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* PREVISUALIZACIÓN DE LA FOTO EN VIVO */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black">
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={currentPreviewUrl}
                    alt="Previsualización de foto con cintillo"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>

                {/* Barra de acciones sobre la imagen */}
                <div className="p-3 bg-[#0a101d] border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-gray-300 font-medium">Con Cintillo Oficial Montecristi.net</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyImage}
                      disabled={isCopyingImage}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-[#042564] hover:from-blue-500 hover:to-blue-600 text-white text-xs font-bold shadow-lg active:scale-95 transition-all cursor-pointer"
                    >
                      {isCopyingImage ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          <span>Copiando...</span>
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                          <span>Copiar Foto (PNG)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadImage}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all cursor-pointer"
                      title="Descargar foto en HD"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span>Descargar HD</span>
                    </button>
                  </div>
                </div>

                {imageToast && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/95 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-2xl border border-white/20 backdrop-blur-md">
                    {imageToast}
                  </div>
                )}
              </div>
            </div>

            {/* ═════════ COLUMNA DERECHA: DESCRIPCIÓN DEL POST (MANDA AL 1ER COMENTARIO) ═════════ */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✍️</span>
                  <h2 className="text-base sm:text-lg font-bold text-white">Texto de Publicación (Facebook Copy)</h2>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-md border border-green-500/20">
                  Sin Enlaces Externos
                </span>
              </div>

              {/* PESTAÑAS DE ÁNGULOS DE COPY */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-gray-400 block mb-1.5">
                  Elige el estilo de intriga:
                </label>
                <div className="flex flex-col gap-1.5">
                  {copies.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setActiveCopyId(c.id);
                        setCustomCopyText(c.text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim());
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between ${
                        activeCopyId === c.id
                          ? 'bg-red-600/20 border border-red-500 text-white'
                          : 'bg-[#0e1628] border border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      <span>{c.name}</span>
                      {activeCopyId === c.id && <span className="text-red-400">✓ Activo</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* TEXTAREA EDITABLE COMPACTO SIN SALTOS EXCESIVOS */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <span>Texto del post (Párrafo fluido y continuo):</span>
                  </label>
                  <span className="text-[10px] text-gray-500">
                    {customCopyText.length} caracteres
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={customCopyText}
                  onChange={(e) => setCustomCopyText(e.target.value)}
                  className="w-full bg-[#080d1a] border border-white/20 rounded-xl p-3 text-xs sm:text-sm text-gray-100 focus:outline-none focus:border-blue-400 leading-relaxed resize-y font-sans"
                />
              </div>

              {/* BOTÓN COPIAR TEXTO */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="flex-1 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  {copiedText ? (
                    <>
                      <span>✓ ¡Texto copiado para Facebook!</span>
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      <span>Copiar Texto del Post</span>
                    </>
                  )}
                </button>

                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 text-white font-bold p-3 rounded-xl border border-white/15 transition-all text-xs flex items-center gap-1.5 shrink-0"
                  title="Abrir Facebook para publicar"
                >
                  <span>Abrir FB ↗</span>
                </a>
              </div>

              {/* ENLACE PARA EL PRIMER COMENTARIO (COPIADO RÁPIDO) */}
              <div className="bg-[#0e1628] border border-blue-500/30 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-300 flex items-center gap-1.5">
                    <span>💬 Enlace para pegar en el Primer Comentario:</span>
                  </span>
                  <span className="text-[9px] text-gray-400">1 clic</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={article.url}
                    className="flex-1 bg-[#080d1a] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-gray-300 font-mono select-all truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopyCommentLink}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-all active:scale-95 shrink-0 cursor-pointer"
                  >
                    {copiedCommentLink ? '✓ ¡Copiado!' : '📋 Copiar Link'}
                  </button>
                </div>
              </div>

              {/* MOCKUP REALISTA DE FACEBOOK */}
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 block mb-2">
                  Previsualización en Facebook Feed:
                </span>
                
                <div className="bg-[#242526] border border-white/10 rounded-xl overflow-hidden shadow-2xl text-[#e4e6eb] font-sans">
                  <div className="p-3 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#042564] border border-blue-500/40 p-1.5 flex items-center justify-center shrink-0">
                        <Image src="/logo.svg" alt="Avatar" width={20} height={20} className="w-full h-full object-contain brightness-125" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-white leading-none">
                          <span>Montecristi.net</span>
                          <span className="text-[#1877F2] text-xs">✓</span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 leading-none">
                          <span>Hace un momento</span>
                          <span>·</span>
                          <span>🌐</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-gray-400 text-base">•••</span>
                  </div>

                  <div className="p-3 text-xs sm:text-sm text-gray-100 leading-snug">
                    {customCopyText}
                  </div>

                  <div className="relative aspect-[16/9] w-full bg-black border-y border-white/5">
                    <Image
                      src={currentPreviewUrl}
                      alt="Mockup imagen limpia"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  <div className="px-3 py-1.5 text-[11px] text-gray-400 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-1">
                      <span>👍❤️😲</span>
                      <span className="font-semibold text-gray-300">2.4K</span>
                    </div>
                    <div className="flex gap-3">
                      <span>530 comentarios</span>
                      <span>280 compartidos</span>
                    </div>
                  </div>

                  <div className="px-2 py-1 flex items-center justify-around text-xs font-semibold text-gray-300">
                    <div className="py-1 px-3 rounded-md hover:bg-white/5 cursor-pointer">👍 Me gusta</div>
                    <div className="py-1 px-3 rounded-md hover:bg-white/5 cursor-pointer">💬 Comentar</div>
                    <div className="py-1 px-3 rounded-md hover:bg-white/5 cursor-pointer">↗️ Compartir</div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </main>
      )}
    </div>
  );
}

export default function RedaccionFbPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-white">
        <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full" />
      </div>
    }>
      <RedaccionFbContent />
    </Suspense>
  );
}

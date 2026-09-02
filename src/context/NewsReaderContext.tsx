'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';

export interface ArticleAudioData {
  id: number;
  title: string;
  author?: string;
  date?: string;
  category?: string;
  slug?: string;
  categorySlug?: string;
  imageUrl?: string;
  content: string; // HTML or plain text
}

export type ReaderStatus = 'idle' | 'playing' | 'paused' | 'stopped';

interface NewsReaderContextType {
  status: ReaderStatus;
  currentArticle: ArticleAudioData | null;
  currentChunkIndex: number;
  totalChunks: number;
  progress: number;
  rate: number;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  isMinimized: boolean;
  isVisible: boolean;
  isSupported: boolean;
  errorMessage: string | null;
  playArticle: (article: ArticleAudioData) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  togglePlay: () => void;
  nextChunk: () => void;
  prevChunk: () => void;
  seekToChunk: (index: number) => void;
  setRate: (rate: number) => void;
  setVoice: (voice: SpeechSynthesisVoice) => void;
  toggleMinimize: () => void;
  closePlayer: () => void;
}

const NewsReaderContext = createContext<NewsReaderContextType | undefined>(undefined);

// Reference global para evitar garbage collection en Chromium
let globalUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Normaliza abreviaciones y siglas dominicanas para una pronunciación de reportaje periodístico fluido
 */
function normalizeForBroadcast(text: string): string {
  return text
    .replace(/RD\$\s*([\d,.]+)/gi, '$1 pesos dominicanos')
    .replace(/US\$\s*([\d,.]+)/gi, '$1 dólares')
    .replace(/(\d+)%/g, '$1 por ciento')
    .replace(/\bkm\/h\b/gi, 'kilómetros por hora')
    .replace(/\bPN\b/g, 'Policía Nacional')
    .replace(/\bDIGESETT\b/gi, 'Digeset')
    .replace(/\bCOE\b/g, 'Centro de Operaciones de Emergencias')
    .replace(/\bMINERD\b/g, 'Ministerio de Educación')
    .replace(/\bSNS\b/g, 'Servicio Nacional de Salud')
    .replace(/\bPRM\b/g, 'P. R. M.')
    .replace(/\bPLD\b/g, 'P. L. D.')
    .replace(/\bFP\b/g, 'Fuerza del Pueblo')
    .replace(/\bPRD\b/g, 'P. R. D.')
    .replace(/\bLic\.\s*/gi, 'Licenciado ')
    .replace(/\bIng\.\s*/gi, 'Ingeniero ')
    .replace(/\bDr\.\s*/gi, 'Doctor ')
    .replace(/^(?:Por\s+)?Redacci[oó]n\s+Montecristi\s*[|–-]?\s*/gi, '')
    .replace(/\bRedacci[oó]n\s+Montecristi\s*[|–-]\s*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Limpia y normaliza el HTML de WordPress transformándolo en un guion de reportaje periodístico
 */
function cleanArticleContent(htmlContent: string, title: string, author?: string, date?: string): string[] {
  if (typeof window === 'undefined') return [title];

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent || '', 'text/html');

  // Eliminar elementos no narrables
  const removeSelectors = [
    'script', 'style', 'iframe', 'svg', 'noscript', 'button', 'input',
    'header', 'footer', 'nav', 'form', 'aside', '.not-prose',
    '.wp-caption', 'figcaption', '.sharedaddy', '.jp-relatedposts',
    '.adsbygoogle', '.publicidad', '[data-ad]', '.ad-container',
  ];

  removeSelectors.forEach(sel => {
    doc.querySelectorAll(sel).forEach(el => el.remove());
  });

  const textBlocks: string[] = [];

  // 1. Introducción de Reportaje Periodístico
  const cleanTitleText = normalizeForBroadcast(title.replace(/<[^>]*>/g, ''));
  const introParts: string[] = [];
  introParts.push(`Montecristi punto net presenta.`);
  introParts.push(`Titular: ${cleanTitleText}.`);
  if (date) introParts.push(`Reporte del ${date}.`);
  textBlocks.push(introParts.join(' '));

  // 2. Extracción y Normalización del Cuerpo de la Noticia
  const elements = doc.body.querySelectorAll('p, h2, h3, h4, blockquote, li, div');
  const seenTexts = new Set<string>();

  elements.forEach(el => {
    // Evitar divs que contienen párrafos para no duplicar
    if (el.tagName === 'DIV' && el.querySelector('p, h2, h3, h4')) return;

    const raw = el.textContent?.trim() || '';
    if (raw.length > 20 && !seenTexts.has(raw)) {
      seenTexts.add(raw);
      const broadcastText = normalizeForBroadcast(raw);
      if (broadcastText.length > 10) {
        const normalized = /[.?!]$/.test(broadcastText) ? broadcastText : `${broadcastText}.`;
        textBlocks.push(normalized);
      }
    }
  });

  // Si no se detectaron párrafos con querySelector, usar split de texto plano
  if (textBlocks.length <= 1) {
    const rawAll = doc.body.textContent || '';
    rawAll
      .split(/\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 20)
      .forEach(s => {
        const broadcastText = normalizeForBroadcast(s);
        if (broadcastText.length > 10) {
          textBlocks.push(/[.?!]$/.test(broadcastText) ? broadcastText : `${broadcastText}.`);
        }
      });
  }

  // 3. Cierre / Outro Periodístico
  textBlocks.push(`Informe completo para Montecristi.net. Noticias y actualidad.`);

  // 4. Agrupación en fragmentos de locución fluidos (~600 a 800 caracteres)
  const chunks: string[] = [];
  let currentChunk = '';

  for (const block of textBlocks) {
    if ((currentChunk + ' ' + block).length > 700) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = block;
    } else {
      currentChunk = currentChunk ? `${currentChunk} ${block}` : block;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [cleanTitleText];
}

const STORAGE_VOICE_KEY = 'montecristi_tts_voice_uri';
const STORAGE_RATE_KEY = 'montecristi_tts_rate';

export function NewsReaderProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ReaderStatus>('idle');
  const [currentArticle, setCurrentArticle] = useState<ArticleAudioData | null>(null);
  const [chunks, setChunks] = useState<string[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(0);
  const [rate, setRateState] = useState<number>(1);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const keepAliveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Inicializar Web Speech API y Cargar Voces con prioridad PABLO ───────────
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    synthRef.current = window.speechSynthesis;

    try {
      const savedRate = localStorage.getItem(STORAGE_RATE_KEY);
      if (savedRate) {
        const parsedRate = parseFloat(savedRate);
        if ([0.75, 1, 1.25, 1.5, 2].includes(parsedRate)) {
          setRateState(parsedRate);
        }
      }
    } catch (_) {}

    const loadVoices = () => {
      if (!synthRef.current) return;
      const voices = synthRef.current.getVoices();
      
      const seen = new Set<string>();
      const uniqueVoices = voices.filter(v => {
        const id = `${v.name}|${v.lang}|${v.voiceURI}`;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      const spanishVoices = uniqueVoices.filter(v => v.lang.toLowerCase().startsWith('es'));
      const otherVoices = uniqueVoices.filter(v => !v.lang.toLowerCase().startsWith('es'));

      // Orden de preferencia: PABLO > es-DO > es-US > es-MX > es-419 > es-ES
      const sortedSpanish = [...spanishVoices].sort((a, b) => {
        const isPabloA = /pablo/i.test(a.name) || /pablo/i.test(a.voiceURI);
        const isPabloB = /pablo/i.test(b.name) || /pablo/i.test(b.voiceURI);
        if (isPabloA && !isPabloB) return -1;
        if (!isPabloA && isPabloB) return 1;

        const priority = (lang: string) => {
          const l = lang.toLowerCase();
          if (l.includes('es-do')) return 1;
          if (l.includes('es-us')) return 2;
          if (l.includes('es-mx')) return 3;
          if (l.includes('es-419')) return 4;
          if (l.includes('es-es')) return 5;
          return 6;
        };
        return priority(a.lang) - priority(b.lang);
      });

      const allSorted = [...sortedSpanish, ...otherVoices];
      setAvailableVoices(allSorted);

      // Restaurar voz previamente seleccionada o tomar PABLO por defecto
      try {
        const savedUri = localStorage.getItem(STORAGE_VOICE_KEY);
        if (savedUri) {
          const match = allSorted.find(v => v.voiceURI === savedUri);
          if (match) {
            setSelectedVoice(match);
            return;
          }
        }
      } catch (_) {}

      // Buscar voz "Pablo" por defecto
      const pabloVoice = sortedSpanish.find(v => /pablo/i.test(v.name) || /pablo/i.test(v.voiceURI));
      if (pabloVoice) {
        setSelectedVoice(pabloVoice);
      } else if (sortedSpanish.length > 0) {
        setSelectedVoice(sortedSpanish[0]);
      } else if (allSorted.length > 0) {
        setSelectedVoice(allSorted[0]);
      }
    };

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (keepAliveIntervalRef.current) clearInterval(keepAliveIntervalRef.current);
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // ── Workaround Anti-Pause Bug de Chrome/Android ─────────────────────────────
  useEffect(() => {
    if (status === 'playing') {
      if (!keepAliveIntervalRef.current) {
        keepAliveIntervalRef.current = setInterval(() => {
          if (synthRef.current && synthRef.current.speaking && !synthRef.current.paused) {
            synthRef.current.pause();
            synthRef.current.resume();
          }
        }, 10000);
      }
    } else {
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
        keepAliveIntervalRef.current = null;
      }
    }
  }, [status]);

  // ── Reproducción del fragmento actual (SpeechSynthesisUtterance) ────────────
  const speakChunk = useCallback((
    index: number,
    chunkList: string[],
    currentRate: number,
    voice: SpeechSynthesisVoice | null,
    cancelCurrent: boolean = false
  ) => {
    if (!synthRef.current) return;

    if (index >= chunkList.length) {
      // Fin de la lectura completa
      setStatus('stopped');
      setCurrentChunkIndex(chunkList.length - 1);
      return;
    }

    // Solo cancelar si se inició una nueva canción o búsqueda manual, no en transición continua
    if (cancelCurrent) {
      synthRef.current.cancel();
    }

    const text = chunkList[index];
    if (!text || !text.trim()) {
      // Si el fragmento está vacío, pasar al siguiente
      speakChunk(index + 1, chunkList, currentRate, voice, false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    globalUtterance = utterance;
    if (typeof window !== 'undefined') {
      (window as any).__montecristi_utterance = utterance;
    }

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || 'es-ES';
    } else {
      utterance.lang = 'es-ES';
    }

    utterance.volume = 1.0;
    utterance.rate = currentRate * 0.98;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setStatus('playing');
      setErrorMessage(null);
    };

    utterance.onend = () => {
      if (index + 1 < chunkList.length) {
        setCurrentChunkIndex(index + 1);
        setTimeout(() => {
          speakChunk(index + 1, chunkList, currentRate, voice, false);
        }, 50);
      } else {
        setStatus('stopped');
        setCurrentChunkIndex(chunkList.length - 1);
      }
    };

    utterance.onerror = (e) => {
      // 'canceled' e 'interrupted' son disparados intencionalmente al detener/cambiar
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        if (index + 1 < chunkList.length) {
          setTimeout(() => {
            speakChunk(index + 1, chunkList, currentRate, voice, false);
          }, 80);
        } else {
          setStatus('stopped');
        }
      }
    };

    try {
      synthRef.current.speak(utterance);
    } catch (err) {
      setErrorMessage('No se pudo iniciar la locución en este dispositivo.');
      setStatus('stopped');
    }
  }, []);

  // ── Acciones Públicas ───────────────────────────────────────────────────────
  const playArticle = useCallback((article: ArticleAudioData) => {
    if (!synthRef.current) return;

    const parsedChunks = cleanArticleContent(
      article.content,
      article.title,
      article.author,
      article.date
    );

    setCurrentArticle(article);
    setChunks(parsedChunks);
    setCurrentChunkIndex(0);
    setIsVisible(true);
    setIsMinimized(false);
    setErrorMessage(null);

    speakChunk(0, parsedChunks, rate, selectedVoice, true);
  }, [rate, selectedVoice, speakChunk]);

  const pause = useCallback(() => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setStatus('paused');
  }, []);

  const resume = useCallback(() => {
    if (!synthRef.current || chunks.length === 0) return;
    speakChunk(currentChunkIndex, chunks, rate, selectedVoice, true);
  }, [chunks, currentChunkIndex, rate, selectedVoice, speakChunk]);

  const stop = useCallback(() => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setStatus('stopped');
    setCurrentChunkIndex(0);
  }, []);

  const togglePlay = useCallback(() => {
    if (status === 'playing') {
      pause();
    } else if (status === 'paused' || status === 'stopped') {
      resume();
    }
  }, [status, pause, resume]);

  const nextChunk = useCallback(() => {
    if (currentChunkIndex + 1 < chunks.length) {
      const nextIdx = currentChunkIndex + 1;
      setCurrentChunkIndex(nextIdx);
      if (status === 'playing') {
        speakChunk(nextIdx, chunks, rate, selectedVoice, true);
      }
    }
  }, [currentChunkIndex, chunks, status, rate, selectedVoice, speakChunk]);

  const prevChunk = useCallback(() => {
    if (currentChunkIndex > 0) {
      const prevIdx = currentChunkIndex - 1;
      setCurrentChunkIndex(prevIdx);
      if (status === 'playing') {
        speakChunk(prevIdx, chunks, rate, selectedVoice, true);
      }
    } else {
      // Reiniciar el fragmento actual
      if (status === 'playing') {
        speakChunk(0, chunks, rate, selectedVoice, true);
      }
    }
  }, [currentChunkIndex, chunks, status, rate, selectedVoice, speakChunk]);

  const seekToChunk = useCallback((index: number) => {
    if (index >= 0 && index < chunks.length) {
      setCurrentChunkIndex(index);
      if (status === 'playing') {
        speakChunk(index, chunks, rate, selectedVoice, true);
      }
    }
  }, [chunks, status, rate, selectedVoice, speakChunk]);

  const setRate = useCallback((newRate: number) => {
    setRateState(newRate);
    try {
      localStorage.setItem(STORAGE_RATE_KEY, newRate.toString());
    } catch (_) {}

    // Si está reproduciendo, reiniciar el fragmento actual con la nueva velocidad
    if (status === 'playing' && chunks.length > 0) {
      speakChunk(currentChunkIndex, chunks, newRate, selectedVoice, true);
    }
  }, [status, chunks, currentChunkIndex, selectedVoice, speakChunk]);

  const setVoice = useCallback((newVoice: SpeechSynthesisVoice) => {
    setSelectedVoice(newVoice);
    try {
      localStorage.setItem(STORAGE_VOICE_KEY, newVoice.voiceURI);
    } catch (_) {}

    if (status === 'playing' && chunks.length > 0) {
      speakChunk(currentChunkIndex, chunks, rate, newVoice, true);
    }
  }, [status, chunks, currentChunkIndex, rate, speakChunk]);

  const toggleMinimize = useCallback(() => {
    setIsMinimized(prev => !prev);
  }, []);

  const closePlayer = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setStatus('idle');
    setIsVisible(false);
    setCurrentArticle(null);
    setChunks([]);
    setCurrentChunkIndex(0);
  }, []);

  // Calcular porcentaje de progreso
  const progress = chunks.length > 0
    ? Math.round(((currentChunkIndex + (status === 'stopped' ? 1 : 0)) / chunks.length) * 100)
    : 0;

  return (
    <NewsReaderContext.Provider
      value={{
        status,
        currentArticle,
        currentChunkIndex,
        totalChunks: chunks.length,
        progress: Math.min(100, Math.max(0, progress)),
        rate,
        availableVoices,
        selectedVoice,
        isMinimized,
        isVisible,
        isSupported,
        errorMessage,
        playArticle,
        pause,
        resume,
        stop,
        togglePlay,
        nextChunk,
        prevChunk,
        seekToChunk,
        setRate,
        setVoice,
        toggleMinimize,
        closePlayer,
      }}
    >
      {children}
    </NewsReaderContext.Provider>
  );
}

export function useNewsReader() {
  const context = useContext(NewsReaderContext);
  if (!context) {
    throw new Error('useNewsReader must be used within a NewsReaderProvider');
  }
  return context;
}

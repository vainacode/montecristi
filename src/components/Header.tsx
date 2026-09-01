'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import {
  Bell,
  Menu,
  X,
  Search,
  Radio,
  Newspaper,
  Compass,
  Trophy,
  Sparkles,
  TrendingUp,
  Camera,
  Info,
  Mail,
  ChevronRight,
  ExternalLink,
  FileText,
  Fuel,
  MapPin,
} from 'lucide-react'
import { siteConfig } from '@/config/site'

// ── Iconos Sociales Oficiales ───────────────────────────────────────────────────
const IconFacebook = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
  </svg>
)
const IconTwitter = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
)
const IconYoutube = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

interface NotificationPost {
  id: number
  title: string
  slug: string
  date: string
  categorySlug: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora mismo'
  if (mins < 60) return `hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `hace ${days}d`
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationPost[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingNotifs, setLoadingNotifs] = useState(false)

  const bellRef = useRef<HTMLDivElement>(null)

  // Control de scroll para encoger el header suavemente
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Bloquear scroll al abrir menú
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  // Cerrar notificaciones al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Cargar noticias recientes para el panel de notificaciones
  const loadNotifications = () => {
    if (notifications.length > 0) return
    setLoadingNotifs(true)

    const apiUrl = siteConfig.api.wordpressUrl
    fetch(`${apiUrl}/posts?per_page=8&_embed=wp:term&_fields=id,title,slug,date,categories,_links,_embedded`)
      .then(r => r.json())
      .then(posts => {
        const parsed: NotificationPost[] = (posts as Array<{
          id: number
          title: { rendered: string }
          slug: string
          date: string
          _embedded?: { 'wp:term'?: Array<Array<{ slug: string }>> }
        }>).map(p => ({
          id: p.id,
          title: p.title.rendered.replace(/<[^>]+>/g, ''),
          slug: p.slug,
          date: p.date,
          categorySlug: p._embedded?.['wp:term']?.[0]?.[0]?.slug ?? 'noticias',
        }))

        setNotifications(parsed)

        const lastRead = localStorage.getItem('montecristi_notif_read')
        const lastReadTime = lastRead ? new Date(lastRead) : new Date(0)
        const newCount = parsed.filter(n => new Date(n.date) > lastReadTime).length
        setUnreadCount(newCount)
      })
      .catch(() => { })
      .finally(() => setLoadingNotifs(false))
  }

  const handleBellClick = () => {
    if (!bellOpen) loadNotifications()
    setBellOpen(v => !v)
  }

  const markAllRead = () => {
    localStorage.setItem('montecristi_notif_read', new Date().toISOString())
    setUnreadCount(0)
    setBellOpen(false)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/?s=${encodeURIComponent(searchQuery.trim())}`
      setIsMenuOpen(false)
    }
  }

  return (
    <>
      <header className={`w-full fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-brand-dark/95 backdrop-blur-md h-16 shadow-2xl' : 'bg-brand-dark h-24'
      }`}>
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between relative">

          {/* IZQUIERDA: MENÚ */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label="Abrir Menú Principal"
              className="group flex items-center gap-2.5 bg-white/10 hover:bg-white/20 active:scale-95 px-5 py-2.5 rounded-full transition-all border border-white/20 text-white cursor-pointer shadow-sm"
            >
              <Menu size={18} className="group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] hidden sm:block">MENÚ</span>
            </button>
          </div>

          {/* CENTRO: LOGO & BRAND: Logo a la izquierda, MONTECRISTI.NET en blanco a la derecha */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link
              href="/"
              prefetch={false}
              className="flex items-center gap-2.5 sm:gap-3.5 py-1 group"
              aria-label="Ir a la portada de Montecristi.net"
            >
              <Image
                src="/logo.svg"
                alt="Logo Montecristi"
                width={50}
                height={50}
                className={`transition-all duration-300 ${
                  isScrolled ? 'h-8 w-8 sm:h-9 sm:w-9' : 'h-10 w-10 sm:h-12 sm:w-12'
                } w-auto object-contain drop-shadow-md group-hover:scale-105`}
                priority
              />
              <span
                className={`font-[family-name:var(--font-source-sans)] font-black tracking-tight text-white uppercase transition-all duration-300 leading-none ${
                  isScrolled
                    ? 'text-xl sm:text-2xl lg:text-3xl'
                    : 'text-xl sm:text-3xl lg:text-[36px]'
                }`}
              >
                MONTECRISTI<span className="font-bold text-white/90">.NET</span>
              </span>
            </Link>
          </div>

          {/* DERECHA: Edición Impresa + Bell + Live */}
          <div className="flex items-center gap-3 sm:gap-4 text-white">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* CAMPANITA DE NOTIFICACIONES */}
              <div ref={bellRef} className="relative hidden sm:block">
                <button
                  onClick={handleBellClick}
                  aria-label="Notificaciones"
                  className="relative cursor-pointer hover:opacity-80 transition-all p-1 text-white"
                >
                  <Bell size={20} strokeWidth={2.5} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-[#BF1B23] text-white rounded-full text-[9px] font-black flex items-center justify-center px-0.5 shadow-md ring-2 ring-brand-dark animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  {unreadCount === 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full shadow-sm" />
                  )}
                </button>

                {/* PANEL DE NOTIFICACIONES */}
                {bellOpen && (
                  <div className="absolute right-0 top-full mt-3 w-80 bg-[#042564] border border-white/15 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in-up">
                    {/* Header del panel */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#021437]">
                      <h3 className="text-xs font-black uppercase tracking-widest text-white">
                        Últimas Noticias
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[9px] font-bold uppercase tracking-widest text-[#BF1B23] hover:text-white transition-colors"
                        >
                          Marcar leídas
                        </button>
                      )}
                    </div>

                    {/* Lista de noticias */}
                    <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
                      {loadingNotifs && (
                        <div className="py-10 text-center text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                          Cargando...
                        </div>
                      )}

                      {!loadingNotifs && notifications.length === 0 && (
                        <div className="py-10 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                          Sin noticias disponibles
                        </div>
                      )}

                      {!loadingNotifs &&
                        notifications.map((n) => (
                          <Link
                            key={n.id}
                            href={`/${n.categorySlug}/${n.slug}`}
                            prefetch={false}
                            onClick={() => setBellOpen(false)}
                            className="flex items-start gap-3 px-5 py-4 hover:bg-white/5 transition-colors border-b border-white/5 group text-left"
                          >
                            <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-[#BF1B23]" />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-gray-100 group-hover:text-[#BF1B23] transition-colors line-clamp-2 leading-snug">
                                {n.title}
                              </h4>
                              <span className="text-[9px] text-gray-400 uppercase tracking-widest mt-1 block">
                                {timeAgo(n.date)}
                              </span>
                            </div>
                          </Link>
                        ))}
                    </div>

                    {/* Footer del panel */}
                    <div className="px-5 py-3 bg-[#021437] border-t border-white/10 text-center">
                      <Link
                        href="/"
                        prefetch={false}
                        onClick={() => setBellOpen(false)}
                        className="text-[10px] font-black uppercase tracking-widest text-[#BF1B23] hover:text-white transition-colors flex items-center justify-center gap-1.5"
                      >
                        Ver todas las noticias
                        <ExternalLink size={10} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* EDICIÓN IMPRESA CAPSULE */}
              <Link
                href="/edicion-impresa"
                className="hidden sm:flex items-center gap-2 bg-white/10 border border-white/25 px-3.5 py-2 rounded-full hover:bg-white/20 active:scale-95 transition-all text-white"
              >
                <FileText size={14} className="text-white" />
                <span className="text-[10px] font-black uppercase tracking-[0.15em]">EDICIÓN IMPRESA</span>
              </Link>

              {/* LIVE CAPSULE */}
              <Link
                href="/en-vivo"
                className="hidden md:flex items-center gap-2.5 bg-[#BF1B23] hover:bg-red-700 px-4 py-2 rounded-full active:scale-95 transition-all group text-white shadow-md"
              >
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">EN VIVO</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* OFF-CANVAS SLIDE-IN DRAWER (EL NUEVO MENÚ LATERAL MODERNO) */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop oscuro */}
        <div
          onClick={() => setIsMenuOpen(false)}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm cursor-pointer"
        />

        {/* Panel lateral */}
        <div
          className={`absolute top-0 left-0 bottom-0 w-full max-w-md bg-[#181818] border-r border-white/10 text-white shadow-2xl flex flex-col justify-between overflow-y-auto transform transition-transform duration-300 ease-out z-10 ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Header del Drawer */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#111111]">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.svg"
                alt="Logo Montecristi"
                width={36}
                height={36}
                className="h-8 w-8 object-contain"
              />
              <span className="font-[family-name:var(--font-source-sans)] font-black text-xl tracking-tight text-white uppercase">
                MONTECRISTI<span className="text-[#BF1B23]">.NET</span>
              </span>
            </div>

            <button
              onClick={() => setIsMenuOpen(false)}
              aria-label="Cerrar Menú"
              className="p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>

          {/* Cuerpo del Drawer con Categorías */}
          <div className="p-6 space-y-8 flex-grow">
            
            {/* Buscador dentro del menú */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar noticias..."
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#BF1B23]"
              />
              <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
            </form>

            {/* SECCIONES PRINCIPALES */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#BF1B23] block">
                Secciones Principales
              </span>
              <nav className="grid grid-cols-1 gap-1">
                {[
                  { name: 'Portada Principal', href: '/', icon: Newspaper },
                  { name: 'Edición Impresa (e-Paper)', href: '/edicion-impresa', icon: FileText, highlight: true },
                  { name: 'Combustibles RD (MICM)', href: '/combustibles', icon: Fuel },
                  { name: 'Montecristi y Noroeste', href: '/montecristi', icon: Compass },
                  { name: 'Montecristi por Dentro', href: '/montecristi-por-dentro', icon: MapPin, highlight: true },
                  { name: 'Nacionales / República', href: '/larepublica', icon: TrendingUp },
                  { name: 'Economía y Negocios', href: '/economia', icon: TrendingUp },
                  { name: 'Deportes (LIDOM / MLB)', href: '/deportes', icon: Trophy },
                  { name: 'Entretenimiento y Farándula', href: '/entretenimiento', icon: Sparkles },
                  { name: 'Estilo de Vida', href: '/estilo', icon: Sparkles },
                  { name: 'Galerías Fotográficas', href: '/galerias', icon: Camera },
                  { name: 'Transmisión En Vivo 24/7', href: '/en-vivo', icon: Radio, highlight: true },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      prefetch={false}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all group ${
                        item.highlight
                          ? 'bg-[#BF1B23]/20 border border-[#BF1B23]/40 text-white font-black'
                          : 'hover:bg-white/5 text-gray-200 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className={item.highlight ? 'text-[#BF1B23]' : 'text-gray-400 group-hover:text-white'} />
                        <span className="text-sm font-bold tracking-tight">{item.name}</span>
                      </div>
                      <ChevronRight size={14} className="text-gray-500 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* INSTITUCIONAL Y CONTACTO */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 block">
                Institucional
              </span>
              <nav className="grid grid-cols-2 gap-2 text-xs font-bold text-gray-300">
                <Link
                  href="/conocenos"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Info size={14} /> Conócenos
                </Link>
                <Link
                  href="/contacto"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Mail size={14} /> Contacto
                </Link>
              </nav>
            </div>

            {/* SÍGUENOS */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 block">
                Redes Sociales
              </span>
              <div className="flex items-center gap-3">
                <Link href={siteConfig.social.facebook.url} target="_blank" rel="noopener" className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#1877f2] flex items-center justify-center text-white transition-all"><IconFacebook /></Link>
                <Link href={siteConfig.social.twitter.url} target="_blank" rel="noopener" className="w-10 h-10 rounded-full bg-white/5 hover:bg-black flex items-center justify-center text-white transition-all"><IconTwitter /></Link>
                <Link href={siteConfig.social.instagram.url} target="_blank" rel="noopener" className="w-10 h-10 rounded-full bg-white/5 hover:bg-pink-600 flex items-center justify-center text-white transition-all"><IconInstagram /></Link>
                <Link href={siteConfig.social.youtube.url} target="_blank" rel="noopener" className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#BF1B23] flex items-center justify-center text-white transition-all"><IconYoutube /></Link>
              </div>
            </div>
          </div>

          {/* Footer del Drawer */}
          <div className="p-6 border-t border-white/10 bg-[#111111] text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
              {siteConfig.copyright}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

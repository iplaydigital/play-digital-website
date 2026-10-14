import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type MouseEvent } from 'react';
import { Link, useNavigate, useLocation, type LinkProps } from 'react-router-dom';
import { flushSync } from 'react-dom';
import { ArrowUpRight, X } from 'lucide-react';

export type Language = 'th' | 'en';
const LanguageContext = createContext({ lang: 'th' as Language, setLang: (_: Language) => {}, t: (th: string, _en: string) => th });
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => { try { return localStorage.getItem('play-language') === 'en' ? 'en' : 'th'; } catch { return 'th'; } });
  useEffect(() => { document.documentElement.lang = lang; try { localStorage.setItem('play-language', lang); } catch { /* File previews have an opaque origin. */ } }, [lang]);
  return <LanguageContext.Provider value={{ lang, setLang, t: (th, en) => lang === 'th' ? th : en }}>{children}</LanguageContext.Provider>;
}
export const useI18n = () => useContext(LanguageContext);
export function asset(name: string) { return (window as unknown as { __PLAY_ASSETS__?: Record<string, string> }).__PLAY_ASSETS__?.[name] || `/assets/${name}`; }
export const VIDEO_ID = 'gBPHuwaHQQc';
export const YOUTUBE_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;
export const FACEBOOK_URL = 'https://www.facebook.com/PlayDigitalThailand';
export const navItems = [ ['Home', '/'], ['Services', '/services'], ['Work', '/work'], ['Client', '/clients'], ['About', '/about'], ['Blog', '/blog'], ['Contact', '/contact'] ] as const;

export function SmartLink({ to, onClick, ...props }: LinkProps) {
  const navigate = useNavigate();
  function handle(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || props.target) return;
    const doc = document as unknown as { startViewTransition?: (callback: () => void) => unknown };
    if (!doc.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    e.preventDefault();
    doc.startViewTransition(() => flushSync(() => navigate(to)));
  }
  return <Link to={to} onClick={handle} {...props} />;
}

export function RouteEffects() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const titles: Record<string, string> = { '/': 'Human-led. AI-amplified.', '/services': 'Services', '/work': 'Selected work', '/clients': 'In good company', '/about': 'Meet Play', '/blog': 'Play notes', '/contact': 'Let’s play', '/privacy': 'Privacy' };
    document.title = `Play Digital — ${titles[pathname] || 'A new possibility'}`;
    if (hash) {
      const timer = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
      return () => clearTimeout(timer);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return null;
}

export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.classList.add('revealed'); return; }
    const io = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { el.classList.add('revealed'); io.unobserve(el); } }), { threshold: 0.06 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

export function ArrowLink({ to, children, dark = false, className = '' }: { to: string; children: ReactNode; dark?: boolean; className?: string }) {
  return <SmartLink className={`arrow-link ${dark ? 'on-dark' : ''} ${className}`} to={to}><span>{children}</span><span className="arrow-circle"><ArrowUpRight size={18} strokeWidth={1.6} /></span></SmartLink>;
}
export function ButtonLink({ to, children, light = false }: { to: string; children: ReactNode; light?: boolean }) {
  return <SmartLink className={`button ${light ? 'button-light' : ''}`} to={to}><span>{children}</span><ArrowUpRight size={18} /></SmartLink>;
}
export function SectionLabel({ number, children, light = false }: { number?: string; children: ReactNode; light?: boolean }) {
  return <div className={`section-label ${light ? 'light' : ''}`}><span className="label-tick" />{number && <span className="label-number">{number} /</span>}<span>{children}</span></div>;
}
export function PageIntro({ label, title, accent, description, children }: { label: string; title: string; accent: string; description: string; children?: ReactNode }) {
  return <section className="page-intro container"><Reveal><SectionLabel>{label}</SectionLabel><div className="page-intro-grid"><h1>{title}<br /><span>{accent}</span></h1><div className="intro-aside"><p>{description}</p>{children}</div></div></Reveal></section>;
}
export function Modal({ children, title, onClose, wide = false }: { children: ReactNode; title: string; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current; const previous = document.activeElement as HTMLElement;
    el?.showModal(); const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { el?.close(); document.body.style.overflow = overflow; previous?.focus?.(); };
  }, []);
  return <dialog ref={ref} className={`modal ${wide ? 'modal-wide' : ''}`} aria-label={title} onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><div className="modal-top"><span>{title}</span><button className="icon-button" aria-label="Close dialog / ปิดหน้าต่าง" onClick={onClose}><X size={23} /></button></div><div className="modal-content">{children}</div></dialog>;
}

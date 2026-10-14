import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUpRight, ChevronDown, Menu, X } from 'lucide-react';
import { asset, navItems, SmartLink, useI18n } from '../lib';
import { services } from '../data';

export default function SiteHeader() {
  const { lang, setLang, t } = useI18n(); const { pathname } = useLocation();
  const [mobile, setMobile] = useState(false); const [mega, setMega] = useState(false); const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null); const mobileRef = useRef<HTMLDivElement>(null); const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { setMobile(false); setMega(false); }, [pathname]);
  useEffect(() => {
    function scroll() { setScrolled(window.scrollY > 12); const max = document.documentElement.scrollHeight - window.innerHeight; headerRef.current?.style.setProperty('--progress', `${max > 0 ? window.scrollY / max : 0}`); }
    window.addEventListener('scroll', scroll, { passive: true }); scroll(); return () => window.removeEventListener('scroll', scroll);
  }, [pathname]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMega(false); setMobile(false); triggerRef.current?.focus(); } };
    const outside = (e: PointerEvent) => { if (headerRef.current && !headerRef.current.contains(e.target as Node)) setMega(false); };
    document.addEventListener('keydown', handler); document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('keydown', handler); document.removeEventListener('pointerdown', outside); };
  }, []);
  useEffect(() => {
    if (!mobile) return;
    const old = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const links = mobileRef.current?.querySelectorAll<HTMLElement>('a, button'); links?.[0]?.focus();
    const trap = (e: KeyboardEvent) => { if (e.key !== 'Tab' || !links?.length) return; const first = links[0]; const last = links[links.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } };
    document.addEventListener('keydown', trap);
    return () => { document.body.style.overflow = old; document.removeEventListener('keydown', trap); };
  }, [mobile]);
  return <>
    <a className="skip-link" href="#main" onClick={e => { e.preventDefault(); const main = document.getElementById('main'); main?.focus({ preventScroll: true }); main?.scrollIntoView({ behavior: 'instant' }); }}>{t('ข้ามไปยังเนื้อหา', 'Skip to content')}</a>
    <header ref={headerRef} className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-inner">
        <SmartLink to="/" className="logo-link" aria-label="Play Digital home"><img src={asset('logo.png')} width="200" height="50" alt="Play Digital" /></SmartLink>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.filter(([name]) => name !== 'Blog').map(([name, to]) => <div key={name} className={`nav-item ${name === 'Services' ? 'has-mega' : ''}`} onMouseEnter={() => name === 'Services' && setMega(true)} onMouseLeave={() => name === 'Services' && setMega(false)}>
            <SmartLink to={to} className={`nav-link ${pathname === to ? 'active' : ''}`} aria-current={pathname === to ? 'page' : undefined}>{name}</SmartLink>
            {name === 'Services' && <><button className="mega-toggle" aria-label={t('เปิดเมนูบริการ', 'Open services menu')} aria-expanded={mega} aria-controls="services-menu" onClick={() => setMega(!mega)}><ChevronDown size={12} /></button>
              <div id="services-menu" className={`mega-menu ${mega ? 'open' : ''}`} inert={!mega}>
                <div className="mega-head"><span>{t('ทุกความเป็นไปได้ เริ่มที่นี่', 'One partner. Every possibility.')}</span><span className="tiny-label">WHAT WE DO</span></div>
                <div className="mega-grid">{services.map(s => <SmartLink key={s.id} to={`/services#${s.id}`} onClick={() => setMega(false)}><span className="tiny-label">{s.number}</span><strong>{s.title.replace('\n', ' ')}</strong><ArrowUpRight size={17} /></SmartLink>)}</div>
                <SmartLink to="/services" className="mega-bottom" onClick={() => setMega(false)}>{t('ดูบริการทั้งหมด', 'Explore all services')}<ArrowUpRight size={15} /></SmartLink>
              </div>
            </>}
          </div>)}
        </nav>
        <div className="header-actions"><div className="language-switch" aria-label="Language"><button className={lang === 'th' ? 'selected' : ''} aria-pressed={lang === 'th'} onClick={() => setLang('th')}>TH</button><span>/</span><button className={lang === 'en' ? 'selected' : ''} aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button></div><SmartLink to="/contact" className="header-cta">Let’s talk <ArrowUpRight size={17} /></SmartLink><button ref={triggerRef} className="mobile-trigger icon-button" aria-label={mobile ? 'Close menu' : 'Open menu'} aria-expanded={mobile} onClick={() => setMobile(!mobile)}>{mobile ? <X /> : <Menu />}</button></div>
      </div>
      <div className="scroll-progress" />
    </header>
    {mobile && <div ref={mobileRef} className="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation menu"><div className="mobile-menu-top"><span className="tiny-label">LET’S FIND YOUR NEXT MOVE</span><button className="icon-button" aria-label="Close menu" onClick={() => { setMobile(false); triggerRef.current?.focus(); }}><X /></button></div><nav aria-label="Mobile navigation">{navItems.map(([name, to], i) => <SmartLink key={to} to={to} onClick={() => setMobile(false)} className={pathname === to ? 'active' : ''}><span className="mobile-nav-num">0{i + 1}</span><span>{name}</span><ArrowUpRight size={27} /></SmartLink>)}</nav><div className="mobile-menu-bottom"><span>Human-led. AI-amplified.</span><a href="tel:0988594453">09 8859 4453 ↗</a></div></div>}
  </>;
}

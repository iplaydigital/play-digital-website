import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, Maximize2, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { asset, Modal, SmartLink, useI18n, VIDEO_ID, YOUTUBE_URL } from '../lib';

type Player = { mute: () => void; unMute: () => void; playVideo: () => void; pauseVideo: () => void; seekTo: (seconds: number, allowSeekAhead: boolean) => void; destroy: () => void; getIframe: () => HTMLIFrameElement; setVolume: (volume: number) => void };
type PlayerEvent = { target: Player; data: number };
type YoutubeWindow = Window & { YT?: { Player: new (element: HTMLElement, options: Record<string, unknown>) => Player }; onYouTubeIframeAPIReady?: () => void };
let youtubePromise: Promise<void> | undefined;
function loadYoutube() {
  const w = window as YoutubeWindow;
  if (w.YT?.Player) return Promise.resolve();
  if (youtubePromise) return youtubePromise;
  youtubePromise = new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('YouTube unavailable')), 15000);
    const previous = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => { clearTimeout(timer); previous?.(); resolve(); };
    if (!document.getElementById('youtube-player-api')) {
      const script = document.createElement('script'); script.id = 'youtube-player-api'; script.src = 'https://www.youtube.com/iframe_api'; script.async = true;
      script.onerror = () => { clearTimeout(timer); reject(new Error('YouTube network error')); }; document.head.appendChild(script);
    }
  });
  return youtubePromise;
}

export default function VideoHero() {
  const { t } = useI18n(); const rootRef = useRef<HTMLElement>(null); const hostRef = useRef<HTMLDivElement>(null); const playerRef = useRef<Player | null>(null);
  const pausedRef = useRef(false); const visibleRef = useRef(true); const dialogRef = useRef(false);
  const [ready, setReady] = useState(false); const [status, setStatus] = useState<'loading' | 'playing' | 'unavailable'>('loading');
  const [sound, setSound] = useState(false); const [paused, setPaused] = useState(false); const [showReel, setShowReel] = useState(false);
  useEffect(() => {
    let alive = true; let safetyTimer: ReturnType<typeof setTimeout>;
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) { pausedRef.current = true; setPaused(true); }
    loadYoutube().then(() => {
      if (!alive || !hostRef.current) return;
      const target = document.createElement('div'); hostRef.current.appendChild(target);
      safetyTimer = setTimeout(() => { if (alive) setStatus(s => s === 'playing' ? s : 'unavailable'); }, 18000);
      const player = new (window as YoutubeWindow).YT!.Player(target, {
        videoId: VIDEO_ID,
        playerVars: { autoplay: reduceMotion ? 0 : 1, mute: 1, controls: 0, loop: 1, playlist: VIDEO_ID, playsinline: 1, rel: 0, enablejsapi: 1, origin: window.location.origin === 'null' ? undefined : window.location.origin, iv_load_policy: 3, disablekb: 1, fs: 0 },
        events: {
          onReady: (e: PlayerEvent) => { if (!alive) return; clearTimeout(safetyTimer); playerRef.current = e.target; e.target.mute(); e.target.setVolume(70); const iframe = e.target.getIframe(); iframe.tabIndex = -1; iframe.title = 'Play Digital original showreel'; setReady(true); if (!pausedRef.current && visibleRef.current && !document.hidden) e.target.playVideo(); },
          onStateChange: (e: PlayerEvent) => { if (!alive) return; if (e.data === 1) { setStatus('playing'); clearTimeout(safetyTimer); } if (e.data === 0 && !pausedRef.current && visibleRef.current && !dialogRef.current) { e.target.seekTo(0, true); e.target.playVideo(); } },
          onError: () => { if (alive) { setStatus('unavailable'); setReady(false); } }
        }
      });
      playerRef.current = player;
    }).catch(() => { if (alive) setStatus('unavailable'); });
    const observer = new IntersectionObserver(entries => { visibleRef.current = entries[0].isIntersecting; if (!playerRef.current?.playVideo) return; try { if (visibleRef.current && !pausedRef.current && !dialogRef.current && !document.hidden) playerRef.current.playVideo(); else playerRef.current.pauseVideo(); } catch { /* The iframe may still be initializing. */ } }, { threshold: 0.1 });
    if (rootRef.current) observer.observe(rootRef.current);
    const visibility = () => { try { if (document.hidden) playerRef.current?.pauseVideo?.(); else if (visibleRef.current && !pausedRef.current && !dialogRef.current) playerRef.current?.playVideo?.(); } catch { /* Player not ready. */ } };
    document.addEventListener('visibilitychange', visibility);
    return () => { alive = false; clearTimeout(safetyTimer); observer.disconnect(); document.removeEventListener('visibilitychange', visibility); try { playerRef.current?.destroy(); } catch { /* Player initialization was interrupted by navigation. */ } playerRef.current = null; };
  }, []);
  function toggleSound() { if (!ready || !playerRef.current) return; if (sound) playerRef.current.mute(); else { playerRef.current.unMute(); if (!pausedRef.current) playerRef.current.playVideo(); } setSound(!sound); }
  function togglePause() { if (!ready || !playerRef.current) return; pausedRef.current = !paused; if (!paused) playerRef.current.pauseVideo(); else playerRef.current.playVideo(); setPaused(!paused); }
  function openReel() { dialogRef.current = true; playerRef.current?.pauseVideo?.(); setShowReel(true); }
  function closeReel() { dialogRef.current = false; setShowReel(false); if (!pausedRef.current && visibleRef.current) playerRef.current?.playVideo?.(); }
  return <>
    <section ref={rootRef} className={`hero ${status === 'playing' ? 'has-video' : ''}`} aria-label="Play Digital introduction">
      <div className="hero-media" aria-hidden="true"><img className="hero-poster" src={asset('showreel-poster.webp')} alt="" fetchPriority="high" /><div ref={hostRef} className="youtube-cover" /><div className="hero-shade" /><div className="hero-grain" /></div>
      <div className="hero-content container"><div className="hero-top"><div className="hero-eyebrow"><span className="status-dot" />INDEPENDENT DIGITAL AGENCY · BANGKOK</div><span className="hero-side-note">CREATIVE MINDS.<br />INTELLIGENT TOOLS.</span></div><h1>Human-led.<br /><span>AI-amplified.</span></h1><div className="hero-copy"><p>{t('ความคิดสร้างสรรค์ของคน × ความเป็นไปได้ของ AI', 'Human creativity meets the possibilities of AI.')}<br />{t('สร้างประสบการณ์ดิจิทัลที่พาแบรนด์ไปข้างหน้า', 'Digital experiences that move your brand forward.')}</p><div className="hero-links"><SmartLink to="/work" className="button button-light"><span>{t('สำรวจผลงานของเรา', 'Explore our work')}</span><ArrowUpRight size={18} /></SmartLink><SmartLink to="/services" className="hero-text-link">{t('เราทำอะไรบ้าง', 'What we do')}<ArrowUpRight size={16} /></SmartLink></div></div><button className="showreel-circle" onClick={openReel} aria-label={t('เปิดดู Showreel พร้อมเสียง', 'Watch the full showreel with sound')}><svg viewBox="0 0 150 150" aria-hidden="true"><defs><path id="reel-circle-path" d="M75,75 m-57,0 a57,57 0 1,1 114,0 a57,57 0 1,1 -114,0" /></defs><text><textPath href="#reel-circle-path" textLength="358">PLAY DIGITAL · WATCH SHOWREEL · </textPath></text></svg><span><Play size={27} strokeWidth={1.3} fill="currentColor" /></span></button></div>
      <div className="hero-bottom container"><div className="hero-reel-label"><div className={`equalizer ${!paused && status === 'playing' ? 'running' : ''}`}><i /><i /><i /><i /></div><span>PLAY DIGITAL SHOWREEL</span><span className="loop-label">↻ LOOP</span></div><button className="scroll-cue" onClick={() => document.getElementById('intro')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}>SCROLL TO EXPLORE<ArrowDown size={14} /></button><div className="video-controls">{status === 'unavailable' ? <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className="video-control youtube-fallback">{t('เปิดบน YouTube', 'Open on YouTube')}<ArrowUpRight size={16} /></a> : <><button className="video-control" onClick={toggleSound} disabled={!ready} aria-pressed={sound} title={!ready ? t('กำลังโหลด YouTube', 'Loading YouTube') : undefined}>{sound ? <Volume2 size={17} /> : <VolumeX size={17} />}<span>{sound ? 'SOUND ON' : 'SOUND OFF'}</span></button><button className="video-control control-icon" onClick={togglePause} disabled={!ready} aria-label={paused ? 'Play video' : 'Pause video'}>{paused ? <Play size={15} /> : <Pause size={15} />}</button></>}<button className="video-control control-icon" onClick={openReel} aria-label="Expand showreel"><Maximize2 size={15} /></button></div></div>
    </section>
    {showReel && <Modal title="PLAY DIGITAL — ORIGINAL SHOWREEL" onClose={closeReel} wide><div className="reel-modal-video"><iframe src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&mute=0&loop=1&playlist=${VIDEO_ID}&controls=1&rel=0&playsinline=1`} title="Play Digital Showreel" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div><div className="reel-modal-caption"><p>{t('วิดีโอเดิมจาก Play Digital · หากไม่แสดงผล กรุณาเปิดบน YouTube', 'The original Play Digital showreel · If unavailable here, open it on YouTube.')}</p><a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer">YouTube<ArrowUpRight size={16} /></a></div></Modal>}
  </>;
}

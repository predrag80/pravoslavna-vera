'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useReadingSettings } from '@/lib/hooks';
import s from './PrayerReader.module.css';

interface Item { slug: string; title: string; html: string }

/**
 * Prayer reading mode: large type, night mode, screen stays on.
 * With several prayers (a rule) it guides step by step: one prayer on screen, "Next" and progress dots.
 */
export default function PrayerReader({ items, title, back }: { items: Item[]; title?: string; back: { href: string; text: string } }) {
  const [settings, setSettings] = useReadingSettings();
  const [i, setI] = useState(0);
  const [awake, setAwake] = useState(false);
  const wakeLock = useRef<WakeLockSentinel | null>(null);
  const top = useRef<HTMLDivElement>(null);
  const current = items[i]!;
  const multiple = items.length > 1;
  const last = i === items.length - 1;

  // Dark background for the whole page in night mode.
  useEffect(() => {
    document.body.classList.toggle('dark', settings.night);
    return () => document.body.classList.remove('dark');
  }, [settings.night]);

  // Keep the screen on while praying (Wake Lock, where the browser supports it).
  useEffect(() => () => void wakeLock.current?.release(), []);
  async function toggleWakeLock() {
    if (wakeLock.current) {
      await wakeLock.current.release();
      wakeLock.current = null;
      setAwake(false);
      return;
    }
    try {
      wakeLock.current = await navigator.wakeLock.request('screen');
      wakeLock.current.addEventListener('release', () => setAwake(false));
      setAwake(true);
    } catch {
      setAwake(false);
    }
  }

  function goTo(n: number) {
    setI(n);
    top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className={`${s.reader} ${settings.night ? s.night : ''}`} ref={top}>
      <div className={`container ${s.toolbar}`}>
        <Link href={back.href} className={s.back}>‹ {back.text}</Link>
        <div className={s.buttons} role="group" aria-label="Подешавања читања">
          <button type="button" aria-label="Мања слова" onClick={() => setSettings({ fontSize: settings.fontSize - 2 })}>A−</button>
          <button type="button" aria-label="Већа слова" onClick={() => setSettings({ fontSize: settings.fontSize + 2 })}>A+</button>
          <button type="button" aria-pressed={settings.night} aria-label="Ноћни режим" onClick={() => setSettings({ night: !settings.night })}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></svg>
          </button>
          <button type="button" aria-pressed={awake} aria-label="Екран остаје укључен" title="Екран остаје укључен" onClick={toggleWakeLock}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" /></svg>
          </button>
        </div>
      </div>

      <article className={`container ${s.text}`} style={{ fontSize: settings.fontSize }} aria-live="polite">
        {title && <p className="eyebrow">{title}{multiple ? ` · ${i + 1} од ${items.length}` : ''}</p>}
        <h1 className={s.title}>{current.title}</h1>
        <div className={s.prayer} dangerouslySetInnerHTML={{ __html: current.html }} />
      </article>

      {multiple && (
        <nav className={`container ${s.navigation}`} aria-label="Молитве у правилу">
          <div className={s.dots}>
            {items.map((x, n) => (
              <button key={x.slug} type="button" aria-label={`${n + 1}. ${x.title}`} aria-current={n === i ? 'step' : undefined} className={n <= i ? s.read : undefined} onClick={() => goTo(n)} />
            ))}
          </div>
          <div className={s.next}>
            {i > 0 && <button type="button" className="button button-outline" onClick={() => goTo(i - 1)}>Претходна</button>}
            {last ? (
              <Link className="button" href={back.href}>Амин · крај правила</Link>
            ) : (
              <button type="button" className="button" onClick={() => goTo(i + 1)}>Следећа: {items[i + 1]!.title}</button>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePodesavanjaCitanja } from '@/lib/kuke';
import s from './CitacMolitve.module.css';

interface Stavka { slug: string; naslov: string; html: string }

/**
 * Режим читања молитве: велика слова, ноћни режим, екран се не гаси.
 * Са више молитава (правило) води корак по корак: једна молитва на екрану, „Следећа“ и тачке напретка.
 */
export default function CitacMolitve({ stavke, naslov, nazad }: { stavke: Stavka[]; naslov?: string; nazad: { href: string; tekst: string } }) {
  const [p, promeni] = usePodesavanjaCitanja();
  const [i, setI] = useState(0);
  const [budan, setBudan] = useState(false);
  const zakljucavanje = useRef<WakeLockSentinel | null>(null);
  const vrh = useRef<HTMLDivElement>(null);
  const m = stavke[i]!;
  const vise = stavke.length > 1;
  const kraj = i === stavke.length - 1;

  // Тамна позадина целе стране у ноћном режиму.
  useEffect(() => {
    document.body.classList.toggle('tamno', p.nocni);
    return () => document.body.classList.remove('tamno');
  }, [p.nocni]);

  // Екран не гаси се док траје молитва (Wake Lock, где га прегледач подржава).
  useEffect(() => () => void zakljucavanje.current?.release(), []);
  async function promeniBudnost() {
    if (zakljucavanje.current) {
      await zakljucavanje.current.release();
      zakljucavanje.current = null;
      setBudan(false);
      return;
    }
    try {
      zakljucavanje.current = await navigator.wakeLock.request('screen');
      zakljucavanje.current.addEventListener('release', () => setBudan(false));
      setBudan(true);
    } catch {
      setBudan(false);
    }
  }

  function idi(n: number) {
    setI(n);
    vrh.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className={`${s.citac} ${p.nocni ? s.nocni : ''}`} ref={vrh}>
      <div className={`omot ${s.traka}`}>
        <Link href={nazad.href} className={s.nazad}>‹ {nazad.tekst}</Link>
        <div className={s.dugmad} role="group" aria-label="Подешавања читања">
          <button type="button" aria-label="Мања слова" onClick={() => promeni({ velicina: p.velicina - 2 })}>A−</button>
          <button type="button" aria-label="Већа слова" onClick={() => promeni({ velicina: p.velicina + 2 })}>A+</button>
          <button type="button" aria-pressed={p.nocni} aria-label="Ноћни режим" onClick={() => promeni({ nocni: !p.nocni })}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></svg>
          </button>
          <button type="button" aria-pressed={budan} aria-label="Екран остаје укључен" title="Екран остаје укључен" onClick={promeniBudnost}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" /></svg>
          </button>
        </div>
      </div>

      <article className={`omot ${s.tekst}`} style={{ fontSize: p.velicina }} aria-live="polite">
        {naslov && <p className="natpis">{naslov}{vise ? ` · ${i + 1} од ${stavke.length}` : ''}</p>}
        <h1 className={s.naslov}>{m.naslov}</h1>
        <div className={s.molitva} dangerouslySetInnerHTML={{ __html: m.html }} />
      </article>

      {vise && (
        <nav className={`omot ${s.kretanje}`} aria-label="Молитве у правилу">
          <div className={s.tacke}>
            {stavke.map((x, n) => (
              <button key={x.slug} type="button" aria-label={`${n + 1}. ${x.naslov}`} aria-current={n === i ? 'step' : undefined} className={n <= i ? s.procitano : undefined} onClick={() => idi(n)} />
            ))}
          </div>
          <div className={s.dalje}>
            {i > 0 && <button type="button" className="dugme dugme-obrub" onClick={() => idi(i - 1)}>Претходна</button>}
            {kraj ? (
              <Link className="dugme" href={nazad.href}>Амин · крај правила</Link>
            ) : (
              <button type="button" className="dugme" onClick={() => idi(i + 1)}>Следећа: {stavke[i + 1]!.naslov}</button>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}

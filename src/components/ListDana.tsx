'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { opisDana } from '@/lib/opis-dana';
import type { SadrzajPraznika } from '@/lib/sadrzaj';
import type { Slika } from '@/lib/slike';
import { preuzmiIcs } from '@/lib/ics';
import OznakaPosta from './OznakaPosta';
import SlikaPraznika from './SlikaPraznika';
import s from './ListDana.module.css';

export interface PodaciPraznika { sadrzaj: Record<string, SadrzajPraznika>; slike: Record<string, Slika> }

interface Props {
  datum: Date;
  podaci: PodaciPraznika;
  onZatvori: () => void;
  onPomeri: (dana: number) => void;
}

/** „Лист дана“: излази одоздо када се додирне датум. Превлачење лево/десно мења дан. */
export default function ListDana({ datum, podaci, onZatvori, onPomeri }: Props) {
  const d = opisDana(datum);
  const znacajan = d.praznici.find((p) => podaci.sadrzaj[p.id]);
  const glavni = znacajan ?? d.praznici.find((p) => p.vrsta !== 'post');
  const tekst = znacajan ? podaci.sadrzaj[znacajan.id] : undefined;
  const naslov = glavni?.naziv ?? d.svetitelji[0] ?? '[Светитељ дана]';
  const ostali = glavni ? d.svetitelji : d.svetitelji.slice(1);

  const list = useRef<HTMLDivElement>(null);
  const pocetak = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const prethodni = document.activeElement as HTMLElement | null;
    list.current?.focus();
    const tastatura = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onZatvori();
      if (e.key === 'ArrowLeft') onPomeri(-1);
      if (e.key === 'ArrowRight') onPomeri(1);
    };
    window.addEventListener('keydown', tastatura);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', tastatura);
      document.body.style.overflow = '';
      prethodni?.focus?.();
    };
  }, [onZatvori, onPomeri]);

  return (
    <div className={s.pozadina} onClick={onZatvori}>
      <div
        ref={list}
        className={s.list}
        role="dialog"
        aria-modal="true"
        aria-label={`${d.datum} ${naslov}`}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => (pocetak.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => {
          const p = pocetak.current;
          pocetak.current = null;
          if (!p) return;
          const dx = e.clientX - p.x;
          const dy = e.clientY - p.y;
          if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) onPomeri(dx < 0 ? 1 : -1);
          else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) onZatvori();
        }}
      >
        <span className={s.rucica} aria-hidden="true" />
        <div className={s.zaglavlje}>
          <button type="button" className={s.strelica} aria-label="Претходни дан" onClick={() => onPomeri(-1)}>‹</button>
          <div className={s.datum}>
            <b>{d.datum}</b>
            <span>{d.stari}</span>
          </div>
          <button type="button" className={s.strelica} aria-label="Следећи дан" onClick={() => onPomeri(1)}>›</button>
        </div>

        <div className={s.sadrzaj}>
          {znacajan && <SlikaPraznika slika={podaci.slike[znacajan.id] ?? null} naziv={znacajan.naziv} mala />}
          <div className={s.oznake}>
            <OznakaPosta post={d.post} opis />
            {d.crveno && <span className={s.crveno}>Црвено слово</span>}
          </div>
          <h2 className={d.crveno ? s.crvenNaslov : undefined}>{naslov}</h2>
          {ostali.length > 0 && <p className={s.ostali}>{ostali.join(' · ')}</p>}
          {tekst ? (
            <>
              <p className={s.kratko}>{tekst.kratko}</p>
              <div className={s.tekst} dangerouslySetInnerHTML={{ __html: tekst.html }} />
            </>
          ) : (
            glavni?.opis && <p className={s.kratko}>{glavni.opis}</p>
          )}
          <div className={s.veze}>
            {znacajan && <Link className="dugme" href={`/praznik/${znacajan.id}/`}>Више о празнику</Link>}
            <Link className="dugme dugme-obrub" href="/prolog/">Пролог</Link>
            <button
              type="button"
              className="dugme dugme-obrub"
              onClick={() => preuzmiIcs(`${datum.toISOString().slice(0, 10)}.ics`, [{ uid: `dan-${datum.toISOString().slice(0, 10)}`, naslov, opis: d.stari, datum, podsetnik: 'dan-ranije' }])}
            >
              Додај у календар
            </button>
          </div>
          <p className={s.savet}>О мери поста посаветујте се са својим духовником.</p>
        </div>
        <button type="button" className={s.zatvori} onClick={onZatvori}>Затвори</button>
      </div>
    </div>
  );
}

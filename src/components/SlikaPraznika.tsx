import type { Slika } from '@/lib/slike';
import s from './SlikaPraznika.module.css';

/**
 * Слика значајног дана, са описом, аутором и лиценцом (обавезно за Wikimedia Commons).
 * Док слика није преузета (`npm run slike`), приказује се украсни оквир.
 */
export default function SlikaPraznika({ slika, naziv, mala = false }: { slika: Slika | null; naziv: string; mala?: boolean }) {
  if (!slika) {
    return (
      <div className={`${s.okvir} ${mala ? s.mala : ''}`} role="img" aria-label={`${naziv}: слика ће бити додата`}>
        <svg viewBox="0 0 96 122" width="56" height="72" fill="none" stroke="#c9a24b" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
          <path d="M8 120V48a40 40 0 0 1 80 0v72" />
          <path d="M48 34v62M43 41h10M37 52h22M43 84l10 4" />
        </svg>
      </div>
    );
  }
  return (
    <figure className={`${s.slika} ${mala ? s.mala : ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- статички извоз, слика је већ смањена */}
      <img src={slika.putanja} width={slika.sirina} height={slika.visina} alt={slika.opis} loading="lazy" decoding="async" />
      <figcaption>
        {slika.opis}
        <span>
          {' · '}
          <a href={slika.stranica} target="_blank" rel="noreferrer">{slika.autor}</a>
          {', '}
          {slika.licencaUrl ? <a href={slika.licencaUrl} target="_blank" rel="noreferrer">{slika.licenca}</a> : slika.licenca}
          {', Wikimedia Commons'}
        </span>
      </figcaption>
    </figure>
  );
}

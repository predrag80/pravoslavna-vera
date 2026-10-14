'use client';

import { useState } from 'react';
import podaci from '@/data/oci.json';
import s from './DrvoPredanja.module.css';

interface Otac { id: string; naziv: string; kratko: string; era: string; meta: string; opis: string; oznake: string[]; veze: { id: string; odnos: string }[]; praznik: string | null }
const OCI = podaci.oci as Otac[];
const ERE = ['I–II', 'IV', 'VII', 'XIII–XIV', 'XX'];
const FILTERI = [['sve', 'Сви'], ['istok', 'Исток'], ['srbija', 'Србија'], ['gora', 'Света Гора']] as const;

export default function DrvoPredanja() {
  const [filter, setFilter] = useState<string>('sve');
  const [izabran, setIzabran] = useState('zlatousti');
  const vidljivi = OCI.filter((o) => filter === 'sve' || o.oznake.includes(filter));
  const o = OCI.find((x) => x.id === izabran)!;

  return (
    <>
      <div className="red-cipova" role="group" aria-label="Филтер" style={{ marginTop: 14 }}>
        {FILTERI.map(([id, naziv]) => (
          <button key={id} type="button" className="cip" aria-pressed={filter === id} onClick={() => setFilter(id)}>{naziv}</button>
        ))}
      </div>

      <ol className={s.vreme}>
        {ERE.map((era) => {
          const u = vidljivi.filter((x) => x.era === era);
          if (!u.length) return null;
          return (
            <li key={era}>
              <span className={s.era}>{era}</span>
              <div className={s.oci}>
                {u.map((x) => (
                  <button key={x.id} type="button" className={s.otac} aria-pressed={x.id === izabran} onClick={() => setIzabran(x.id)}>{x.kratko}</button>
                ))}
              </div>
            </li>
          );
        })}
      </ol>

      <section className="kartica-tamna" aria-live="polite">
        <h2>{o.naziv}</h2>
        <p className={s.meta}>{o.meta}</p>
        <p className={s.opis}>{o.opis}</p>
        <div className={s.dno}>
          {o.veze.map((v) => {
            const drugi = OCI.find((x) => x.id === v.id);
            return drugi ? (
              <button key={v.id} type="button" className={s.veza} onClick={() => { setFilter('sve'); setIzabran(v.id); }}>
                {v.odnos}: {drugi.kratko} →
              </button>
            ) : null;
          })}
          {o.praznik && <span className={s.praznik}>Празник: {o.praznik}</span>}
        </div>
      </section>
    </>
  );
}

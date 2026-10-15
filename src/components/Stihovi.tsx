'use client';

import { useState } from 'react';
import { useObelezja, type BojaObelezja } from '@/lib/kuke';
import type { Stih } from '@/lib/biblija';
import s from './Stihovi.module.css';

const BOJE: [BojaObelezja, string][] = [['zlato', 'Златна'], ['ruza', 'Ружичаста'], ['nebo', 'Плава']];
const kljuc = (x: Stih) => `${x.knjiga}:${x.glava}:${x.stih}`;

/** „Лк 7:11-13, 15“ за изабране стихове (по реду), са скраћеним називом књиге. */
export function oznaka(lista: Stih[], kratko: Record<string, string>): string {
  const delovi: string[] = [];
  let i = 0;
  while (i < lista.length) {
    const prvi = lista[i]!;
    let j = i;
    while (j + 1 < lista.length && lista[j + 1]!.knjiga === prvi.knjiga && lista[j + 1]!.glava === prvi.glava && lista[j + 1]!.stih === lista[j]!.stih + 1) j++;
    const opseg = j > i ? `${prvi.stih}-${lista[j]!.stih}` : `${prvi.stih}`;
    const prethodni = delovi.length ? lista[i - 1] : undefined;
    if (prethodni && prethodni.knjiga === prvi.knjiga && prethodni.glava === prvi.glava) delovi[delovi.length - 1] += `, ${opseg}`;
    else if (prethodni && prethodni.knjiga === prvi.knjiga) delovi.push(`${prvi.glava}:${opseg}`);
    else delovi.push(`${kratko[prvi.knjiga] ?? prvi.knjiga} ${prvi.glava}:${opseg}`);
    i = j + 1;
  }
  return delovi.join('; ');
}

/**
 * Текст са бројевима стихова. Додир на стих га бира; трака на дну обележава изабране стихове
 * бојом, уклања обележје или копира текст са референцом. Обележја се чувају на уређају.
 */
export default function Stihovi({ stihovi, kratko, glave = false }: { stihovi: Stih[]; kratko: Record<string, string>; glave?: boolean }) {
  const [obelezja, promeni] = useObelezja();
  const [izabrani, setIzabrani] = useState<Set<string>>(new Set());
  const [kopirano, setKopirano] = useState(false);

  const izabraniStihovi = stihovi.filter((x) => izabrani.has(kljuc(x)));
  const imaObelezje = izabraniStihovi.some((x) => obelezja[kljuc(x)]);

  const prebaci = (x: Stih) => {
    const novo = new Set(izabrani);
    if (novo.has(kljuc(x))) novo.delete(kljuc(x));
    else novo.add(kljuc(x));
    setIzabrani(novo);
    setKopirano(false);
  };
  const oboji = (boja: BojaObelezja | null) => {
    promeni(Object.fromEntries(izabraniStihovi.map((x) => [kljuc(x), boja ? { boja, tekst: x.tekst } : null])));
    setIzabrani(new Set());
  };
  const kopiraj = async () => {
    const tekst = `${izabraniStihovi.map((x) => x.tekst).join(' ')}\n— ${oznaka(izabraniStihovi, kratko)}`;
    try {
      await navigator.clipboard.writeText(tekst);
      setKopirano(true);
    } catch {
      setKopirano(false);
    }
  };

  return (
    <>
      <p className={`tekst-citanja ${s.tekst}`}>
        {stihovi.map((x, i) => {
          const k = kljuc(x);
          const o = obelezja[k];
          const novaGlava = glave && (i === 0 || stihovi[i - 1]!.glava !== x.glava || stihovi[i - 1]!.knjiga !== x.knjiga);
          return (
            <span key={k}>
              {novaGlava && i > 0 && <br />}
              {novaGlava && <span className={s.glava}>{x.glava}</span>}
              <span
                id={glave ? undefined : `s${x.stih}`}
                role="button"
                tabIndex={0}
                aria-pressed={izabrani.has(k)}
                aria-label={`Стих ${x.stih}${o ? ', обележен' : ''}`}
                className={`${s.stih} ${o ? s[o.boja] : ''} ${izabrani.has(k) ? s.izabran : ''}`}
                onClick={() => prebaci(x)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    prebaci(x);
                  }
                }}
              >
                <sup className={s.broj}>{x.stih}</sup>
                {x.tekst}
              </span>{' '}
            </span>
          );
        })}
      </p>

      {izabraniStihovi.length > 0 && <div className={s.razmak} aria-hidden="true" />}
      {izabraniStihovi.length > 0 && (
        <div className={s.traka} role="toolbar" aria-label="Изабрани стихови">
          <span className={s.oznaka}>{oznaka(izabraniStihovi, kratko)}</span>
          <div className={s.dugmad}>
            {BOJE.map(([b, naziv]) => (
              <button key={b} type="button" className={`${s.boja} ${s[b]}`} aria-label={`Обележи: ${naziv}`} onClick={() => oboji(b)} />
            ))}
            {imaObelezje && <button type="button" className={s.tekstDugme} onClick={() => oboji(null)}>Уклони</button>}
            <button type="button" className={s.tekstDugme} onClick={kopiraj}>{kopirano ? 'Копирано ✓' : 'Копирај'}</button>
            <button type="button" className={s.zatvori} aria-label="Поништи избор" onClick={() => setIzabrani(new Set())}>×</button>
          </div>
        </div>
      )}
    </>
  );
}

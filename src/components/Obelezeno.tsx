'use client';

import Link from 'next/link';
import { useObelezja } from '@/lib/kuke';
import s from './Obelezeno.module.css';

interface K { id: string; naziv: string; kratko: string }

/** Списак обележених стихова, по редоследу књига у Библији. */
export default function Obelezeno({ knjige }: { knjige: K[] }) {
  const [obelezja, promeni] = useObelezja();
  const red = new Map(knjige.map((k, i) => [k.id, i]));
  const naziv = new Map(knjige.map((k) => [k.id, k.naziv]));
  const stavke = Object.entries(obelezja)
    .map(([kljuc, o]) => {
      const [knjiga = '', g = '0', st = '0'] = kljuc.split(':');
      return { kljuc, knjiga, glava: Number(g), stih: Number(st), ...o };
    })
    .sort((a, b) => (red.get(a.knjiga) ?? 999) - (red.get(b.knjiga) ?? 999) || a.glava - b.glava || a.stih - b.stih);

  if (!stavke.length) {
    return (
      <p className="kartica prigusen">
        Још нема обележених стихова. У било којој глави или у читањима дана додирните стих, па изаберите боју.
      </p>
    );
  }
  return (
    <ul className={s.lista}>
      {stavke.map((x) => (
        <li key={x.kljuc} className={s[x.boja]}>
          <Link href={`/pismo/${x.knjiga}/${x.glava}/#s${x.stih}`}>
            <span className="natpis">{naziv.get(x.knjiga) ?? x.knjiga} {x.glava}:{x.stih}</span>
            <span className={s.tekst}>{x.tekst}</span>
          </Link>
          <button type="button" aria-label={`Уклони обележје ${x.glava}:${x.stih}`} onClick={() => promeni({ [x.kljuc]: null })}>×</button>
        </li>
      ))}
    </ul>
  );
}

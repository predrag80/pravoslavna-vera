/** Све што се зна о једном дану: датуми, пост, празници, светитељи. Ради и у прегледачу. */
import { poStarom, post, prazniciDana, type PostDana, type Praznik } from './kalendar.ts';
import { MESECI, datumDugi } from './datumi.ts';
import svetitelji from '../data/svetitelji.json' with { type: 'json' };

export interface OpisDana {
  datum: string;
  stari: string;
  kljucStarog: string; // ММ-ДД по старом календару
  post: PostDana;
  praznici: Praznik[];
  svetitelji: string[];
  crveno: boolean;
}

const dani = (svetitelji as { dani: Record<string, { svetitelji: string[] }> }).dani;

export function opisDana(d: Date): OpisDana {
  const s = poStarom(d);
  const kljuc = `${String(s.mesec).padStart(2, '0')}-${String(s.dan).padStart(2, '0')}`;
  const praznici = prazniciDana(d);
  const nazivi = new Set(praznici.map((p) => p.naziv.toLocaleLowerCase('sr')));
  return {
    datum: datumDugi(d),
    stari: `${s.dan}. ${MESECI[s.mesec - 1]} по старом календару`,
    kljucStarog: kljuc,
    post: post(d),
    praznici,
    svetitelji: (dani[kljuc]?.svetitelji ?? []).filter((x) => !nazivi.has(x.toLocaleLowerCase('sr'))),
    crveno: praznici.some((p) => p.vrsta === 'crveno' || p.vrsta === 'vaskrs'),
  };
}

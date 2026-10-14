/** Подаци за екран „Данас“, исти и при прављењу сајта и у прегледачу. */
import { poStarom, prazniciDana, post, narednih, vaskrs, dodajDane, razlikaDana, visednevniPostovi, type PostDana } from './kalendar';
import { MESECI, MESECI_KRATKO, datumDugi, zaDana } from './datumi';
import svetitelji from '../data/svetitelji.json' with { type: 'json' };

export interface PodaciDana {
  datum: string;
  stari: string;
  vreme: string;
  naslov: string;
  podnaslov: string;
  crveno: boolean;
  post: PostDana;
  narednih: { dan: number; mesec: string; naziv: string; crveno: boolean; kad: string }[];
}

function vremeGodine(d: Date): string {
  for (const v of visednevniPostovi(d.getUTCFullYear())) {
    if (d >= v.od && d <= v.do) return v.naziv;
  }
  const p = vaskrs(d.getUTCFullYear());
  const r = razlikaDana(d, p);
  if (r >= 0 && r < 7) return 'Светла седмица';
  if (r >= 0 && r <= 49) return 'Од Васкрса до Духова';
  if (r > 49) return 'Време после Педесетнице';
  return 'Време пред Васкрс';
}

export function podaciDana(d: Date): PodaciDana {
  const s = poStarom(d);
  const kljuc = `${String(s.mesec).padStart(2, '0')}-${String(s.dan).padStart(2, '0')}`;
  const dani = (svetitelji as { dani: Record<string, { svetitelji: string[] }> }).dani;
  const sveti = dani[kljuc]?.svetitelji ?? [];
  const praznik = prazniciDana(d).find((p) => p.vrsta !== 'post');

  const naslov = praznik?.naziv ?? sveti[0] ?? '[Светитељ дана]';
  const ostali = (praznik ? sveti : sveti.slice(1)).filter((x) => x.toLocaleLowerCase('sr') !== naslov.toLocaleLowerCase('sr'));
  const podnaslov = ostali.length ? 'и ' + ostali.map((x) => x.charAt(0).toLowerCase() + x.slice(1)).join(', ') : '';

  return {
    datum: datumDugi(d),
    stari: `${s.dan}. ${MESECI[s.mesec - 1]} по старом календару`,
    vreme: vremeGodine(d),
    naslov,
    podnaslov,
    crveno: praznik?.vrsta === 'crveno' || praznik?.vrsta === 'vaskrs',
    post: post(d),
    narednih: narednih(dodajDane(d, 1), 3, (p) => p.vrsta !== 'post').map((p) => ({
      dan: p.datum.getUTCDate(),
      mesec: MESECI_KRATKO[p.datum.getUTCMonth()]!,
      naziv: p.naziv,
      crveno: p.vrsta === 'crveno' || p.vrsta === 'vaskrs',
      kad: zaDana(razlikaDana(p.datum, d)),
    })),
  };
}

'use client';

import { useMemo, useState } from 'react';
import { useDanas } from '@/lib/kuke';
import { dodajDane, pocetakCrkveneGodine, poStarom, prazniciGodine, razlikaDana, visednevniPostovi, type Praznik } from '@/lib/kalendar';
import { MESECI, MESECI_KRATKO, zaDana } from '@/lib/datumi';
import s from './GodisnjiKrug.module.css';

const C = 170;
const R = 122;
const BOJA: Record<Praznik['vrsta'], string> = { crveno: '#f0675b', praznik: '#f3ebd8', vaskrs: '#e6c77a', post: '#b9aceb' };

/** Црквена година као круг: почиње 14. септембра, Васкрс је сидро, лукови су постови. */
export default function GodisnjiKrug({ onOtvoriDan }: { onOtvoriDan?: (d: Date) => void }) {
  // Дан се одређује у прегледачу, да круг увек показује данашњи дан, а не дан прављења сајта.
  const d0 = useDanas();

  const k = useMemo(() => {
    if (!d0) return null;
    const pocetak = pocetakCrkveneGodine(d0);
    const kraj = dodajDane(pocetak, 364);
    const duzina = razlikaDana(dodajDane(pocetak, 365), pocetak);
    const ugao = (d: Date) => (razlikaDana(d, pocetak) / duzina) * 2 * Math.PI - Math.PI / 2;
    const tacka = (r: number, d: Date) => ({ x: C + r * Math.cos(ugao(d)), y: C + r * Math.sin(ugao(d)) });
    const g = pocetak.getUTCFullYear();

    const lukovi = [...visednevniPostovi(g), ...visednevniPostovi(g + 1)]
      .map((p) => ({ od: p.od < pocetak ? pocetak : p.od, do: p.do > kraj ? kraj : p.do, naziv: p.naziv }))
      .filter((p) => p.od <= p.do)
      .map((p) => {
        const a = tacka(R, p.od);
        const b = tacka(R, dodajDane(p.do, 1));
        const veliki = razlikaDana(p.do, p.od) / duzina > 0.5 ? 1 : 0;
        return { kljuc: p.naziv + p.od.toISOString(), d: `M${a.x} ${a.y} A${R} ${R} 0 ${veliki} 1 ${b.x} ${b.y}` };
      });

    const meseci = Array.from({ length: 12 }, (_, i) => new Date(Date.UTC(g, pocetak.getUTCMonth() + i, 15)))
      .filter((m) => m >= pocetak && m <= kraj)
      .map((m) => ({ ...tacka(156, m), naziv: MESECI_KRATKO[m.getUTCMonth()]!.toUpperCase(), kljuc: m.toISOString() }));

    const praznici = [...prazniciGodine(g), ...prazniciGodine(g + 1)].filter((p) => p.datum >= pocetak && p.datum <= kraj);
    return { tacka, lukovi, meseci, praznici, igla: tacka(96, d0), danas: tacka(R, d0) };
  }, [d0]);

  const [izabran, setIzabran] = useState<string | null>(null);
  const prvi = k && d0 ? (k.praznici.find((p) => p.datum >= d0) ?? k.praznici[0]) : undefined;
  const p = k?.praznici.find((x) => x.id === izabran) ?? prvi;

  if (!k || !d0) return <div className={s.krug} aria-busy="true" />;
  const st = poStarom(d0);
  const pt = p ? k.tacka(R, p.datum) : null;

  return (
    <>
      <div className={s.krug} role="img" aria-label="Црквена година као круг: постови, празници и данашњи дан">
        <svg viewBox="0 0 340 340" aria-hidden="true">
          <circle cx={C} cy={C} r={R} fill="none" stroke="#24365f" strokeWidth="18" />
          {k.lukovi.map((l) => <path key={l.kljuc} d={l.d} fill="none" stroke="#8b79d1" strokeWidth="18" />)}
          <circle cx={C} cy={C} r="96" fill="#1a2a4c" stroke="#34477a" />
          <line x1={C} y1={C} x2={k.igla.x} y2={k.igla.y} stroke="#e6c77a" strokeWidth="2" strokeLinecap="round" />
          {k.meseci.map((m) => (
            <text key={m.kljuc} x={m.x} y={m.y + 4} textAnchor="middle" fill="#9aa5c3" fontSize="10" fontWeight="700" fontFamily="Manrope, sans-serif">{m.naziv}</text>
          ))}
          {k.praznici.map((x) => {
            const t = k.tacka(R, x.datum);
            return <circle key={x.id + x.datum.toISOString()} cx={t.x} cy={t.y} r={x.vrsta === 'vaskrs' ? 8 : 4.5} fill={BOJA[x.vrsta]} />;
          })}
          {pt && <circle cx={pt.x} cy={pt.y} r="14" fill="none" stroke="#f3ebd8" strokeWidth="2" />}
          <rect x={k.danas.x - 6} y={k.danas.y - 6} width="12" height="12" rx="3" fill="#14213d" stroke="#e6c77a" strokeWidth="2" transform={`rotate(45 ${k.danas.x} ${k.danas.y})`} />
        </svg>
        <div className={s.centar}>
          <span className="natpis">Данас</span>
          <span className={s.broj}>{d0.getUTCDate()}</span>
          <span>{MESECI[d0.getUTCMonth()]}</span>
          <span className={s.stari}>{st.dan}. {MESECI_KRATKO[st.mesec - 1]}. по старом</span>
        </div>
      </div>

      <ul className={s.legenda} aria-hidden="true">
        <li><i style={{ background: 'var(--zlato-svetlo)', width: 12, height: 12 }} />Васкрс</li>
        <li><i style={{ background: 'var(--crveno-na-tamnom)' }} />Црвено слово</li>
        <li><i style={{ background: 'var(--slonovaca)' }} />Празник</li>
        <li><i style={{ background: 'var(--post)', width: 16, height: 6, borderRadius: 3 }} />Пост</li>
      </ul>

      <div className="red-cipova" role="group" aria-label="Празници">
        {k.praznici.map((x) => (
          <button key={x.id + x.datum.toISOString()} type="button" className={`cip ${s.cip}`} aria-pressed={x.id === p?.id} onClick={() => setIzabran(x.id)}>
            {x.naziv}
          </button>
        ))}
      </div>

      {p && (
        <section className={s.detalj} aria-live="polite">
          <div className={s.red}>
            <div>
              <h2>{p.naziv}</h2>
              <p className={s.meta}>
                {p.datum.getUTCDate()}. {MESECI[p.datum.getUTCMonth()]} {p.datum.getUTCFullYear()}. ·{' '}
                {p.vrsta === 'vaskrs' ? 'покретни празник, сидро године' : p.vrsta === 'post' ? 'почетак поста' : `${p.vrsta === 'crveno' ? 'црвено слово, ' : ''}${p.pokretni ? 'покретни' : 'непокретни'} празник`}
              </p>
            </div>
            <span className={s.kad}>{razlikaDana(p.datum, d0) < 0 ? 'прошао' : zaDana(razlikaDana(p.datum, d0))}</span>
          </div>
          <p className={s.opis}>{p.opis}</p>
          {onOtvoriDan && (
            <button type="button" className={s.ceoDan} onClick={() => onOtvoriDan(p.datum)}>Цео дан ›</button>
          )}
        </section>
      )}
    </>
  );
}

'use client';

import Link from 'next/link';
import { razlikaDana, utc } from '@/lib/kalendar';
import { useDanas, usePlanovi } from '@/lib/kuke';
import { plan as nadjiPlan } from '@/lib/planovi';
import s from './Planovi.module.css';

function izKljuca(k: string): Date {
  const [g, m, d] = k.split('-').map(Number);
  return utc(g!, m!, d!);
}

/** Један план: данашњи део, сви дани, означавање прочитаног. Без бодова, без „низа дана“. */
export default function PlanCitanja({ id }: { id: string }) {
  const p = nadjiPlan(id)!;
  const danas = useDanas();
  const [napredak, promeni] = usePlanovi();
  const n = napredak[id];
  if (!danas) return null;

  if (!n) {
    return (
      <div className={s.pocni}>
        <p>План има {p.dani.length} дана. Можете читати својим темпом; пропуштени дан не прави проблем.</p>
        <button type="button" className="dugme" onClick={() => promeni(id, { pocetak: danas.toISOString().slice(0, 10), procitano: [] })}>Почни данас</button>
      </div>
    );
  }

  const procitano = new Set(n.procitano);
  const poRasporedu = Math.min(p.dani.length - 1, Math.max(0, razlikaDana(danas, izKljuca(n.pocetak))));
  const sledeci = p.dani.findIndex((_, i) => !procitano.has(i));
  const tekuci = sledeci === -1 ? null : sledeci;
  const zavrsen = tekuci === null;

  const oznaci = (i: number) => {
    const skup = new Set(n.procitano);
    if (skup.has(i)) skup.delete(i);
    else skup.add(i);
    promeni(id, { ...n, procitano: [...skup].sort((a, b) => a - b) });
  };

  return (
    <>
      <section className={s.danas} aria-live="polite">
        {zavrsen ? (
          <>
            <span className="natpis">План је прочитан</span>
            <h2>Слава Богу за све!</h2>
          </>
        ) : (
          <>
            <span className="natpis">Дан {tekuci! + 1} од {p.dani.length}{tekuci! < poRasporedu ? ` · по распореду сте на дану ${poRasporedu + 1}` : ''}</span>
            <div className={s.delovi}>
              {p.dani[tekuci!]!.map((d) => (
                <Link key={`${d.knjiga}-${d.glava}`} href={`/pismo/${d.knjiga}/${d.glava}/`} className={s.deo}>{d.naziv} ›</Link>
              ))}
            </div>
            <button type="button" className="dugme" onClick={() => oznaci(tekuci!)}>Прочитао сам</button>
          </>
        )}
        <div className={s.napredak}>
          <span className={s.traka} aria-hidden="true"><span style={{ width: `${(procitano.size / p.dani.length) * 100}%` }} /></span>
          Прочитано {procitano.size} од {p.dani.length} дана
        </div>
      </section>

      <ol className={s.dani}>
        {p.dani.map((delovi, i) => (
          <li key={i} className={i === tekuci ? s.tekuci : undefined}>
            <label>
              <input type="checkbox" checked={procitano.has(i)} onChange={() => oznaci(i)} />
              <span className={s.broj}>{i + 1}</span>
              <span className={s.sadrzaj}>{delovi.map((d) => d.naziv).join(', ')}</span>
            </label>
          </li>
        ))}
      </ol>
      <button type="button" className="dugme dugme-obrub" style={{ width: '100%', marginBottom: 16 }} onClick={() => promeni(id, null)}>
        Почни план испочетка
      </button>
    </>
  );
}

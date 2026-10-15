import type { Metadata } from 'next';
import Link from 'next/link';
import Zaglavlje from '@/components/Zaglavlje';
import SledeceCitanje from '@/components/SledeceCitanje';
import { citanjaDana, datumiCitanja } from '@/lib/citanja';
import { MESECI } from '@/lib/datumi';
import { prazniciDana, utc } from '@/lib/kalendar';
import s from './citanja.module.css';

export const metadata: Metadata = { title: 'Читања на Литургији' };

export default function Citanja() {
  const poMesecima = new Map<number, string[]>();
  for (const d of datumiCitanja()) {
    const m = Number(d.slice(5, 7));
    poMesecima.set(m, [...(poMesecima.get(m) ?? []), d]);
  }
  return (
    <>
      <Zaglavlje natpis="Свето писмо" naslov="Читања на Литургији" podnaslov="Апостол и Јеванђеље за недеље и велике празнике" />
      <div className="omot" style={{ paddingBottom: 24 }}>
        <SledeceCitanje />
        {[...poMesecima].map(([m, datumi]) => (
          <section key={m} aria-labelledby={`m${m}`}>
            <h2 id={`m${m}`} className={`natpis ${s.mesec}`}>{MESECI[m - 1]} 2026.</h2>
            <ul className={s.lista}>
              {datumi.map((d) => {
                const c = citanjaDana(d)!;
                const [g, mm, dd] = d.split('-').map(Number) as [number, number, number];
                const praznik = prazniciDana(utc(g, mm, dd))[0];
                return (
                  <li key={d}>
                    <Link href={`/citanja/${d}/`}>
                      <span className={s.dan} style={praznik?.vrsta === 'crveno' || praznik?.vrsta === 'vaskrs' ? { color: 'var(--crveno)' } : undefined}>{dd}<small>{MESECI[mm - 1]!.slice(0, 3)}</small></span>
                      <span className={s.reference}>
                        {praznik && <b>{praznik.naziv}</b>}
                        <span>{c.apostol.split(';')[0]} · {c.jevandjelje.split(';')[0]}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        <p className={s.izvor}>
          Недељна читања према црквеном календару (crkvenikalendar.rs), читања великих празника по Типику.
          Читања за радне дане биће додата када буду преузета из провереног извора.
        </p>
      </div>
    </>
  );
}

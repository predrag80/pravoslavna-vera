'use client';

import Link from 'next/link';
import { useState } from 'react';
import { razlikaDana } from '@/lib/kalendar';
import { MESECI, DANI, zaDana } from '@/lib/datumi';
import { useDanas, useSlava } from '@/lib/kuke';
import { narednaSlava, slava as nadjiSlavu, SLAVE } from '@/lib/slava';
import { preuzmiIcs } from '@/lib/ics';
import s from './KrsnaSlava.module.css';

/** Шта се спрема за славу; опште народно-црквени обичаји, текст треба да прегледа свештеник. */
const PRIPREMA = [
  { naziv: 'Славски колач', opis: 'Месе се у кући и носи у храм или се свештеник позива у дом да га пререже и освешта.' },
  { naziv: 'Кољиво (жито)', opis: 'Кувана пшеница у спомен на преминуле претке; освећује се заједно са колачем.' },
  { naziv: 'Славска свећа', opis: 'Пали се на дан славе и гори током славља, као знак молитве светитељу.' },
  { naziv: 'Вино и тамјан', opis: 'Вином се прелива колач, а кућа се кади тамјаном.' },
  { naziv: 'Водица', opis: 'Пред славу свештеник освећује водицу у дому и благосиља укућане.' },
];

export default function KrsnaSlava() {
  const danas = useDanas();
  const [id, postavi] = useSlava();
  const [upit, setUpit] = useState('');
  const [menja, setMenja] = useState(false);
  const izabrana = nadjiSlavu(id);

  if (!danas) return null;

  if (!izabrana || menja) {
    const q = upit.trim().toLocaleLowerCase('sr');
    const lista = SLAVE.filter((x) => !q || `${x.naziv} ${x.svetitelj}`.toLocaleLowerCase('sr').includes(q))
      .map((x) => ({ x, datum: narednaSlava(x, danas) }))
      .sort((a, b) => a.x.naziv.localeCompare(b.x.naziv, 'sr'));
    return (
      <section aria-label="Избор славе">
        <label className={`kartica ${s.pretraga}`}>
          <span className="samo-citac">Тражи славу</span>
          <input type="search" value={upit} onChange={(e) => setUpit(e.target.value)} placeholder="Нпр. Никољдан, Свети Јован, Ђурђевдан" />
        </label>
        <ul className={s.lista}>
          {lista.map(({ x, datum }) => (
            <li key={x.id}>
              <button type="button" aria-pressed={x.id === id} onClick={() => { postavi(x.id); setMenja(false); setUpit(''); }}>
                <span>
                  <b>{x.naziv}</b>
                  <small>{x.svetitelj}</small>
                </span>
                <span className={s.datum}>{datum.getUTCDate()}. {MESECI[datum.getUTCMonth()]}</span>
              </button>
            </li>
          ))}
          {!lista.length && <li className="prigusen" style={{ padding: 16 }}>Нема славе са тим именом. Јавите нам да је додамо.</li>}
        </ul>
        {izabrana && <button type="button" className="dugme dugme-obrub" style={{ width: '100%' }} onClick={() => setMenja(false)}>Откажи</button>}
      </section>
    );
  }

  const datum = narednaSlava(izabrana, danas);
  const dana = razlikaDana(datum, danas);
  return (
    <>
      <section className={s.kartica} aria-live="polite">
        <span className="natpis">Ваша слава</span>
        <h2>{izabrana.naziv}</h2>
        <p className={s.svetitelj}>{izabrana.svetitelj}</p>
        <div className={s.odbrojavanje}>
          <b>{dana === 0 ? 'Данас!' : zaDana(dana)}</b>
          <span>{DANI[datum.getUTCDay()]}, {datum.getUTCDate()}. {MESECI[datum.getUTCMonth()]} {datum.getUTCFullYear()}.{izabrana.odVaskrsa !== undefined ? ' · покретна слава' : ''}</span>
        </div>
        <div className={s.dugmad}>
          <button
            type="button"
            className="dugme"
            onClick={() => {
              const godina = datum.getUTCFullYear();
              const dani = [0, 1, 2].map((n) => narednaSlava(izabrana, new Date(Date.UTC(godina + n, 0, 1))));
              preuzmiIcs(`slava-${izabrana.id}.ics`, dani.map((d) => ({
                uid: `slava-${izabrana.id}-${d.toISOString().slice(0, 10)}`,
                naslov: `Крсна слава: ${izabrana.naziv}`,
                opis: izabrana.svetitelj,
                datum: d,
                podsetnik: 'dan-ranije',
              })));
            }}
          >
            Додај у календар телефона
          </button>
          <button type="button" className="dugme dugme-obrub" onClick={() => setMenja(true)}>Промени славу</button>
        </div>
      </section>

      <section className="kartica" style={{ marginTop: 12 }} aria-labelledby="zitije">
        <h2 id="zitije" style={{ fontSize: 24 }}>Житије и тропар</h2>
        <p className="prigusen" style={{ margin: '6px 0 0', fontSize: 14 }}>[Житије: {izabrana.svetitelj}. Тропар и кондак из провереног извора.]</p>
        {izabrana.praznik && <Link className="dugme dugme-obrub" style={{ marginTop: 10 }} href={`/praznik/${izabrana.praznik}/`}>Више о празнику</Link>}
      </section>

      <section style={{ marginTop: 16 }} aria-labelledby="priprema">
        <h2 id="priprema" style={{ fontSize: 24, marginBottom: 8 }}>Шта се припрема</h2>
        <ul className={s.priprema}>
          {PRIPREMA.map((p) => (
            <li key={p.naziv}>
              <label>
                <input type="checkbox" />
                <span><b>{p.naziv}</b><small>{p.opis}</small></span>
              </label>
            </li>
          ))}
        </ul>
        <p className="prigusen" style={{ fontSize: 12 }}>Обичаји се разликују по крајевима; питајте свог свештеника.</p>
      </section>
    </>
  );
}

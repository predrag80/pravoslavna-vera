'use client';

import Link from 'next/link';
import { useState } from 'react';
import { dodajDane, narednih, visednevniPostovi } from '@/lib/kalendar';
import { useDanas, useSlava } from '@/lib/kuke';
import { narednaSlava, slava as nadjiSlavu } from '@/lib/slava';
import { preuzmiIcs, type Dogadjaj, type Podsetnik } from '@/lib/ics';
import s from './Podsetnici.module.css';

const VELIKI = new Set(['bozic', 'bogojavljenje', 'sretenje', 'blagovesti', 'cveti', 'vaskrs', 'spasovdan', 'duhovi', 'preobrazenje', 'velika-gospojina', 'mala-gospojina', 'krstovdan', 'vavedenje']);

type Izbor = 'slava' | 'veliki' | 'crveno' | 'postovi';

/** Подсетници без сервера: прави се .ics фајл, а телефон сам шаље обавештења из свог календара. */
export default function Podsetnici() {
  const danas = useDanas();
  const [slavaId] = useSlava();
  const izabranaSlava = nadjiSlavu(slavaId);
  const [izbor, setIzbor] = useState<Record<Izbor, boolean>>({ slava: true, veliki: true, crveno: false, postovi: true });
  const [podsetnik, setPodsetnik] = useState<Podsetnik>('dan-ranije');
  const [gotovo, setGotovo] = useState<number | null>(null);

  if (!danas) return null;
  const doDana = dodajDane(danas, 730);

  function dogadjaji(): Dogadjaj[] {
    const lista: Dogadjaj[] = [];
    if (izbor.slava && izabranaSlava) {
      for (let n = 0; n < 2; n++) {
        const d = narednaSlava(izabranaSlava, new Date(Date.UTC(danas!.getUTCFullYear() + n, danas!.getUTCMonth(), danas!.getUTCDate())));
        lista.push({ uid: `slava-${izabranaSlava.id}-${d.toISOString().slice(0, 10)}`, naslov: `Крсна слава: ${izabranaSlava.naziv}`, opis: izabranaSlava.svetitelj, datum: d, podsetnik });
      }
    }
    if (izbor.veliki || izbor.crveno) {
      for (const p of narednih(danas!, 200)) {
        if (p.datum > doDana) break;
        const veliki = VELIKI.has(p.id);
        if ((izbor.veliki && veliki) || (izbor.crveno && (p.vrsta === 'crveno' || p.vrsta === 'vaskrs'))) {
          lista.push({ uid: `${p.id}-${p.datum.toISOString().slice(0, 10)}`, naslov: p.naziv, opis: p.opis, datum: p.datum, podsetnik });
        }
      }
    }
    if (izbor.postovi) {
      for (let g = danas!.getUTCFullYear(); g <= doDana.getUTCFullYear(); g++) {
        for (const v of visednevniPostovi(g)) {
          if (v.od < danas! || v.od > doDana) continue;
          lista.push({ uid: `post-${v.od.toISOString().slice(0, 10)}`, naslov: `Почиње ${v.naziv}`, opis: `Траје до ${v.do.getUTCDate()}. ${v.do.getUTCMonth() + 1}.`, datum: v.od, podsetnik });
        }
      }
    }
    const jedinstveni = new Map(lista.map((d) => [d.uid, d]));
    return [...jedinstveni.values()].sort((a, b) => a.datum.getTime() - b.datum.getTime());
  }

  const stavke: { id: Izbor; naziv: string; opis: string; nedostupno?: boolean }[] = [
    { id: 'slava', naziv: 'Моја крсна слава', opis: izabranaSlava ? izabranaSlava.naziv : 'Прво изаберите славу', nedostupno: !izabranaSlava },
    { id: 'veliki', naziv: 'Велики празници', opis: 'Божић, Богојављење, Васкрс, Духови и остали Дванаестоднебни празници' },
    { id: 'crveno', naziv: 'Сва црвена слова', opis: 'Сви празници означени црвеним у календару' },
    { id: 'postovi', naziv: 'Почетак постова', opis: 'Велики, Петровски, Госпојински и Божићни пост' },
  ];

  return (
    <>
      <fieldset className={s.grupa}>
        <legend>Шта да вас подсећа</legend>
        {stavke.map((x) => (
          <label key={x.id} className={x.nedostupno ? s.nedostupno : undefined}>
            <input type="checkbox" checked={izbor[x.id] && !x.nedostupno} disabled={x.nedostupno} onChange={(e) => setIzbor({ ...izbor, [x.id]: e.target.checked })} />
            <span><b>{x.naziv}</b><small>{x.opis}</small></span>
          </label>
        ))}
        {!izabranaSlava && <Link href="/slava/" className={s.veza}>Изаберите своју славу ›</Link>}
      </fieldset>

      <fieldset className={s.grupa}>
        <legend>Када</legend>
        {([['dan-ranije', 'Дан раније у 19:00'], ['ujutru', 'Истог дана у 7:00'], ['bez', 'Без обавештења, само у календару']] as const).map(([v, t]) => (
          <label key={v}>
            <input type="radio" name="podsetnik" checked={podsetnik === v} onChange={() => setPodsetnik(v)} />
            <span><b>{t}</b></span>
          </label>
        ))}
      </fieldset>

      <button
        type="button"
        className="dugme"
        style={{ width: '100%', marginTop: 14 }}
        onClick={() => {
          const d = dogadjaji();
          preuzmiIcs('pravoslavlje-podsetnici.ics', d);
          setGotovo(d.length);
        }}
      >
        Додај у календар телефона
      </button>
      <p className="prigusen" style={{ fontSize: 13 }} aria-live="polite">
        {gotovo !== null
          ? `Припремљено ${gotovo} догађаја за наредне две године. Отворите преузети фајл и потврдите додавање у календар.`
          : 'Важи за наредне две године. Телефон шаље обавештења из свог календара, и када апликација није отворена.'}
      </p>
    </>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { podaciDana, type PodaciDana } from '@/lib/dan';
import { useDanas, usePut, useSlava } from '@/lib/kuke';
import { narednaSlava, slava as nadjiSlavu } from '@/lib/slava';
import { razlikaDana } from '@/lib/kalendar';
import { zaDana } from '@/lib/datumi';
import type { Put } from '@/lib/put';
import IzborPisma from './IzborPisma';
import OznakaPosta from './OznakaPosta';
import AktivniPlan from './AktivniPlan';
import s from './Danas.module.css';

const PLOCICE = [
  { href: '/prolog/', naziv: 'Пролог', opis: 'житије дана', ikona: <><path d="M8 4h10a2 2 0 0 1 0 4H8" /><path d="M8 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8" /><path d="M10 12h6M10 15h4" /></> },
  { href: '/psaltir/', naziv: 'Псалтир', opis: 'катизме', ikona: <><path d="M7 4c-2 5-2 11 0 16h10c2-5 2-11 0-16" /><path d="M6 4h12" /><path d="M10 6v12M12 6v12M14 6v12" /></> },
  { href: '/molitve/', naziv: 'Молитве', opis: 'јутарње, вечерње', ikona: <><path d="M12 3c1.6 2 1.6 3.6 0 5.2-1.6-1.6-1.6-3.2 0-5.2z" /><path d="M10 10.5h4V21h-4z" /></> },
  { href: '/kalendar/', naziv: 'Календар', opis: 'месец и круг', ikona: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="2.5" /><path d="M12 4v3M20 12h-3M12 20v-3M4 12h3" /></> },
  { href: '/slava/', naziv: 'Слава', opis: 'крсна слава', ikona: <><path d="M12 3c1.6 2 1.6 3.6 0 5.2-1.6-1.6-1.6-3.2 0-5.2z" /><path d="M10 10.5h4V21h-4z" /><path d="M6 21h12" /></> },
  { href: '/podsetnici/', naziv: 'Подсетници', opis: 'у календар', ikona: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10 20a2 2 0 0 0 4 0" /></> },
];

/** Почетни екран. Сервер приказује податке из дана прављења сајта, а прегледач их одмах освежава за данас. */
export default function Danas({ pocetno }: { pocetno: PodaciDana }) {
  const dan = useDanas();
  const put = usePut();
  const [slavaId] = useSlava();
  const mojaSlava = nadjiSlavu(slavaId);
  const doSlave = mojaSlava && dan ? razlikaDana(narednaSlava(mojaSlava, dan), dan) : null;
  const router = useRouter();
  // Резерва за навигацију унутар апликације, када се скрипта из page.tsx не извршава.
  useEffect(() => {
    if (put === null) router.replace('/dobrodosli/');
  }, [put, router]);
  const p = useMemo(() => (dan ? podaciDana(dan) : pocetno), [dan, pocetno]);
  const sledeci = p.narednih[0];

  return (
    <>
      <header className={`${s.nebo} na-tamnom`}>
        <div className="omot">
          <div className="gornji-red">
            <Link href="/kalendar/" className={s.datum} aria-label={`${p.datum} Отвори годишњи круг`}>
              <span className={s.d}>{p.datum}</span>
              <span className={s.s}>{p.stari}</span>
            </Link>
            <div style={{ display: 'flex', gap: 6 }}>
              <IzborPisma />
              <Link href="/pretraga/" className={s.trazi} aria-label="Претрага">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
              </Link>
            </div>
          </div>
          <p className={s.vreme}>
            <span aria-hidden="true" />
            {p.vreme}
          </p>
          <h1 className={p.crveno ? `${s.naslov} ${s.crveno}` : s.naslov}>{p.naslov}</h1>
          {p.podnaslov && <p className={s.podnaslov}>{p.podnaslov}</p>}
          <div className={s.oznake}>
            <OznakaPosta post={p.post} tamno />
            {mojaSlava && doSlave !== null && doSlave <= 60 && (
              <Link className={s.oznaka} href="/slava/">{doSlave === 0 ? `Данас је ваша слава: ${mojaSlava.naziv}` : `${mojaSlava.naziv} ${zaDana(doSlave)}`}</Link>
            )}
            {sledeci && (
              <Link className={s.oznaka} href="/kalendar/">
                Следећи: {sledeci.naziv}, {sledeci.dan}. {sledeci.mesec}
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className={`omot ${s.sadrzaj}`}>
        {put && put !== 'zivot' && <ZaVas put={put} />}
        <section aria-labelledby="svaki-dan">
          <h2 id="svaki-dan" className={`natpis ${s.natpis}`}>Свакога дана</h2>
          <div className={`mreza mreza-3 ${s.plocice}`}>
            {PLOCICE.map((x) => (
              <Link key={x.href} href={x.href}>
                <span className={s.ikona}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {x.ikona}
                  </svg>
                </span>
                <b>{x.naziv}</b>
                <small>{x.opis}</small>
              </Link>
            ))}
          </div>
        </section>

        <AktivniPlan />

        {put === 'zivot' && <ZaVas put={put} />}

        <section className="kartica" aria-labelledby="naredni">
          <div className={s.red}>
            <h2 id="naredni" className="natpis">Наредни празници</h2>
            <Link href="/kalendar/">Годишњи круг</Link>
          </div>
          <ul className={s.praznici}>
            {p.narednih.map((n) => (
              <li key={n.naziv + n.dan}>
                <span className={n.crveno ? `${s.dan} ${s.crvenDan}` : s.dan}>
                  {n.dan}
                  <small>{n.mesec}</small>
                </span>
                <span className={s.ime}>{n.naziv}</span>
                <span className={s.kad}>{n.kad}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

const PREPORUKE: Record<Put, { naslov: string; stavke: { href: string; naziv: string; opis: string }[] }> = {
  pocetnik: {
    naslov: 'Почните овде',
    stavke: [
      { href: '/hram/', naziv: 'Уђи у храм', opis: 'Шта значи иконостас, кандило, свећа' },
      { href: '/ucenje/ko-je-bog/', naziv: 'Прва лекција: Ко је Бог', opis: '5 минута' },
    ],
  },
  ucenje: {
    naslov: 'Наставите учење',
    stavke: [
      { href: '/ucenje/', naziv: 'Лествица', opis: 'Следећи степеник' },
      { href: '/oci/', naziv: 'Свети оци', opis: 'Дрво Предања кроз векове' },
    ],
  },
  zivot: {
    naslov: 'За данашњи дан',
    stavke: [
      { href: '/pismo/', naziv: 'Свето писмо', opis: 'Наставите читање' },
      { href: '/mapa/', naziv: 'Храмови и манастири', opis: 'Светиње у близини' },
    ],
  },
};

/** Предлози према путу изабраном на екрану добродошлице. */
function ZaVas({ put }: { put: Put }) {
  const p = PREPORUKE[put];
  return (
    <section aria-labelledby="za-vas">
      <div className={s.red}>
        <h2 id="za-vas" className={`natpis ${s.natpis}`}>{p.naslov}</h2>
        <Link href="/dobrodosli/" className={s.promeni}>Иди на главни мени</Link>
      </div>
      <div className={s.preporuke}>
        {p.stavke.map((x) => (
          <Link key={x.href} href={x.href} className={s.preporuka}>
            <span>
              <b>{x.naziv}</b>
              <small>{x.opis}</small>
            </span>
            <span aria-hidden="true">›</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

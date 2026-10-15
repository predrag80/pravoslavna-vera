'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { todayData, type TodayData } from '@/lib/today';
import { useToday, useJourney, useSlava } from '@/lib/hooks';
import { nextSlava, findSlava } from '@/lib/slava';
import { daysBetween } from '@/lib/calendar';
import { inDays } from '@/lib/dates';
import type { Journey } from '@/lib/journey';
import Logo from './Logo';
import ScriptToggle from './ScriptToggle';
import FastBadge from './FastBadge';
import ActivePlan from './ActivePlan';
import NextReading from './NextReading';
import s from './Today.module.css';

const TILES = [
  { href: '/prolog/', name: 'Пролог', description: 'житије дана', icon: <><path d="M8 4h10a2 2 0 0 1 0 4H8" /><path d="M8 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8" /><path d="M10 12h6M10 15h4" /></> },
  { href: '/psaltir/', name: 'Псалтир', description: 'катизме', icon: <><path d="M7 4c-2 5-2 11 0 16h10c2-5 2-11 0-16" /><path d="M6 4h12" /><path d="M10 6v12M12 6v12M14 6v12" /></> },
  { href: '/molitve/', name: 'Молитве', description: 'јутарње, вечерње', icon: <><path d="M12 3c1.6 2 1.6 3.6 0 5.2-1.6-1.6-1.6-3.2 0-5.2z" /><path d="M10 10.5h4V21h-4z" /></> },
  { href: '/kalendar/', name: 'Календар', description: 'месец и круг', icon: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="2.5" /><path d="M12 4v3M20 12h-3M12 20v-3M4 12h3" /></> },
  { href: '/slava/', name: 'Слава', description: 'крсна слава', icon: <><path d="M12 3c1.6 2 1.6 3.6 0 5.2-1.6-1.6-1.6-3.2 0-5.2z" /><path d="M10 10.5h4V21h-4z" /><path d="M6 21h12" /></> },
  { href: '/podsetnici/', name: 'Подсетници', description: 'у календар', icon: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10 20a2 2 0 0 0 4 0" /></> },
];

/** Home screen. The server renders data from the build date; the browser refreshes it for today right away. */
export default function Today({ initial }: { initial: TodayData }) {
  const today = useToday();
  const journey = useJourney();
  const [slavaId] = useSlava();
  const mySlava = findSlava(slavaId);
  const daysToSlava = mySlava && today ? daysBetween(nextSlava(mySlava, today), today) : null;
  const router = useRouter();
  // Fallback for in-app navigation, when the script from page.tsx does not run.
  useEffect(() => {
    if (journey === null) router.replace('/dobrodosli/');
  }, [journey, router]);
  const p = useMemo(() => (today ? todayData(today) : initial), [today, initial]);
  const next = p.upcoming[0];

  return (
    <>
      <header className={`${s.sky} on-dark`}>
        <div className="container">
          <div className="top-row">
            <Logo size={38} stroke={1.7} link={false} className={s.brand} />
            <div style={{ display: 'flex', gap: 6 }}>
              <ScriptToggle />
              <Link href="/pretraga/" className={s.search} aria-label="Претрага">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
              </Link>
            </div>
          </div>
          <Link href="/kalendar/" className={s.date} aria-label={`${p.date} Отвори годишњи круг`}>
            <span className={s.dateText}>{p.date}</span>
            <span className={s.oldStyle}>{p.oldStyle}</span>
          </Link>
          <p className={s.season}>
            <span aria-hidden="true" />
            {p.season}
          </p>
          <h1 className={p.redLetter ? `${s.title} ${s.redLetter}` : s.title}>{p.title}</h1>
          {p.subtitle && <p className={s.subtitle}>{p.subtitle}</p>}
          <div className={s.badges}>
            <FastBadge fast={p.fast} dark />
            {mySlava && daysToSlava !== null && daysToSlava <= 60 && (
              <Link className={s.badge} href="/slava/">{daysToSlava === 0 ? `Данас је ваша слава: ${mySlava.name}` : `${mySlava.name} ${inDays(daysToSlava)}`}</Link>
            )}
            {next && (
              <Link className={s.badge} href="/kalendar/">
                Следећи: {next.name}, {next.day}. {next.month}
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className={`container ${s.content}`}>
        {journey && journey !== 'practice' && <ForYou journey={journey} />}
        <section aria-labelledby="every-day">
          <h2 id="every-day" className={`eyebrow ${s.eyebrow}`}>Свакога дана</h2>
          <div className={`grid grid-3 ${s.tiles}`}>
            {TILES.map((x) => (
              <Link key={x.href} href={x.href}>
                <span className={s.icon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {x.icon}
                  </svg>
                </span>
                <b>{x.name}</b>
                <small>{x.description}</small>
              </Link>
            ))}
          </div>
        </section>

        <NextReading />
        <ActivePlan />

        {journey === 'practice' && <ForYou journey={journey} />}

        <section className="card" aria-labelledby="upcoming">
          <div className={s.row}>
            <h2 id="upcoming" className="eyebrow">Наредни празници</h2>
            <Link href="/kalendar/">Годишњи круг</Link>
          </div>
          <ul className={s.feasts}>
            {p.upcoming.map((n) => (
              <li key={n.name + n.day}>
                <span className={n.redLetter ? `${s.day} ${s.redDay}` : s.day}>
                  {n.day}
                  <small>{n.month}</small>
                </span>
                <span className={s.name}>{n.name}</span>
                <span className={s.when}>{n.when}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

const SUGGESTIONS: Record<Journey, { title: string; items: { href: string; name: string; description: string }[] }> = {
  beginner: {
    title: 'Почните овде',
    items: [
      { href: '/hram/', name: 'Уђи у храм', description: 'Шта значи иконостас, кандило, свећа' },
      { href: '/ucenje/ko-je-bog/', name: 'Прва лекција: Ко је Бог', description: '5 минута' },
    ],
  },
  learning: {
    title: 'Наставите учење',
    items: [
      { href: '/ucenje/', name: 'Лествица', description: 'Следећи степеник' },
      { href: '/oci/', name: 'Свети оци', description: 'Дрво Предања кроз векове' },
    ],
  },
  practice: {
    title: 'За данашњи дан',
    items: [
      { href: '/pismo/', name: 'Свето писмо', description: 'Наставите читање' },
      { href: '/mapa/', name: 'Храмови и манастири', description: 'Светиње у близини' },
    ],
  },
};

/** Suggestions based on the journey chosen on the welcome screen. */
function ForYou({ journey }: { journey: Journey }) {
  const p = SUGGESTIONS[journey];
  return (
    <section aria-labelledby="for-you">
      <div className={s.row}>
        <h2 id="for-you" className={`eyebrow ${s.eyebrow}`}>{p.title}</h2>
        <Link href="/dobrodosli/" className={s.change}>Иди на главни мени</Link>
      </div>
      <div className={s.suggestions}>
        {p.items.map((x) => (
          <Link key={x.href} href={x.href} className={s.suggestion}>
            <span>
              <b>{x.name}</b>
              <small>{x.description}</small>
            </span>
            <span aria-hidden="true">›</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

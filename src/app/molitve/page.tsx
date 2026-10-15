import type { Metadata } from 'next';
import Link from 'next/link';
import TroparionOfDay from '@/components/TroparionOfDay';
import PageHeader from '@/components/PageHeader';
import { prayers, prayersOfRule, PRAYER_RULES, type PrayerGroup, type PrayerRuleId } from '@/lib/content';
import s from './prayers.module.css';

export const metadata: Metadata = { title: 'Молитвеник' };

const GROUPS: { id: PrayerGroup; name: string }[] = [
  { id: 'svakodnevne', name: 'Свакодневне молитве' },
  { id: 'akatisti', name: 'Акатисти' },
  { id: 'kanoni', name: 'Канони' },
  { id: 'ostale', name: 'Остале молитве' },
];

export default function PrayerBookPage() {
  const all = prayers();
  return (
    <>
      <PageHeader title="Молитвеник" subtitle="Молитвена правила, свакодневне молитве, акатисти и канони" />
      <div className="container">
        <div className={s.rules}>
          {(Object.keys(PRAYER_RULES) as PrayerRuleId[]).map((id) => (
            <Link key={id} href={`/molitve/pravilo/${id}/`} className={id === 'vecernje' ? `${s.rule} ${s.evening}` : s.rule}>
              <b>{PRAYER_RULES[id].name}</b>
              <span>{PRAYER_RULES[id].description} · {prayersOfRule(id).length} молитава</span>
              <small>Корак по корак ›</small>
            </Link>
          ))}
        </div>

        <TroparionOfDay />

        {GROUPS.map((g) => {
          const list = all.filter((m) => m.group === g.id);
          if (!list.length) return null;
          return (
            <section key={g.id} className={s.group} aria-labelledby={`g-${g.id}`}>
              <h2 id={`g-${g.id}`}>{g.name}</h2>
              <ul>
                {list.map((m) => (
                  <li key={m.slug}>
                    <Link href={`/molitve/${m.slug}/`}>{m.title}<span aria-hidden="true">›</span></Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}

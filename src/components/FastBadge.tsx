import { FAST_LEVELS, type DayFast } from '@/lib/calendar';
import s from './FastBadge.module.css';

const ICONS: Record<DayFast['level'], React.ReactNode> = {
  none: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /></>,
  dairy: <><path d="M8 3h8l-1 4v12a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V7z" /><path d="M9 11h6" /></>,
  fish: <><path d="M3 12c3-4 8-5 12-3l4-3v12l-4-3c-4 2-9 1-12-3z" /><circle cx="8" cy="11" r="0.8" /></>,
  oil: <><path d="M12 3c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10z" /><path d="M10 14a2 2 0 0 0 2 2" /></>,
  water: <><path d="M12 3c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10z" /></>,
  abstain: <><circle cx="12" cy="12" r="8" /><path d="M6 18L18 6" /></>,
};

/** Fast badge: the level (water, oil, fish…) and the reason (Nativity Fast, Wednesday…). */
export default function FastBadge({ fast, dark = false, showDescription = false }: { fast: DayFast; dark?: boolean; showDescription?: boolean }) {
  const lvl = FAST_LEVELS[fast.level];
  return (
    <span className={`${s.badge} ${s[fast.level]} ${dark ? s.dark : ''}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {ICONS[fast.level]}
      </svg>
      <span>
        <b>{lvl.name}</b>
        {fast.level !== 'none' || fast.label !== 'Мрсни дан' ? ` · ${fast.label}` : ''}
        {showDescription && <small className={s.description}>{lvl.description}</small>}
      </span>
    </span>
  );
}

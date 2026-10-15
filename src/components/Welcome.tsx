'use client';

import { useRouter } from 'next/navigation';
import { useJourney } from '@/lib/hooks';
import { saveJourney, type Journey } from '@/lib/journey';
import BackButton from './BackButton';
import ScriptToggle from './ScriptToggle';
import DarkTheme from './DarkTheme';
import s from './Welcome.module.css';

const JOURNEYS: { id: Journey; number: string; title: string; description: string }[] = [
  { id: 'beginner', number: 'I', title: 'Тек упознајем веру', description: 'Кренимо од почетка: храм, молитва, основни појмови.' },
  { id: 'learning', number: 'II', title: 'Желим да научим више', description: 'Лекције, Свети оци и читање Светог писма.' },
  { id: 'practice', number: 'III', title: 'Живим црквеним животом', description: 'Празник, пост, читања и молитве за сваки дан.' },
];

// Stars on the vault: [x %, y px, size].
const STARS = [[7, 40, 3], [18, 120, 2], [85, 64, 3], [91, 150, 2], [77, 210, 2], [10, 230, 2], [25, 300, 2], [90, 330, 3], [6, 420, 2], [94, 470, 2], [15, 560, 2], [87, 600, 2], [46, 26, 2], [64, 110, 2]];

export default function Welcome() {
  const router = useRouter();
  const selected = useJourney();

  function choose(journey: Journey) {
    saveJourney(journey);
    router.replace('/');
  }

  return (
    <div className={s.screen}>
      <DarkTheme />
      {STARS.map(([x, y, v], i) => (
        <span key={i} aria-hidden="true" className={s.star} style={{ left: `${x}%`, top: y, width: v, height: v }} />
      ))}
      {selected && (
        <div className={s.top}>
          <BackButton text="Данас" className={s.back} />
        </div>
      )}
      <div className={s.content}>
        <svg width="96" height="122" viewBox="0 0 96 122" fill="none" stroke="#c9a24b" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
          <path d="M8 120V48a40 40 0 0 1 80 0v72" />
          <path d="M18 120V50a30 30 0 0 1 60 0v70" />
          <path d="M48 34v62M43 41h10M37 52h22M43 84l10 4" />
          <path d="M2 120h92" />
        </svg>
        <h1 className={s.title}>Добро дошли</h1>
        <p className={s.subtitle}>Упознавање, учење и живот у православној вери на једном месту.</p>

        <div className={s.script}>
          <ScriptToggle wide />
        </div>

        <h2 className={s.question}>Где се налазите на путу?</h2>
        <div className={s.journeys}>
          {JOURNEYS.map((p) => (
            <button key={p.id} type="button" className={s.journey} aria-pressed={selected === p.id} onClick={() => choose(p.id)}>
              <span className={s.number} aria-hidden="true">{p.number}</span>
              <span className={s.text}>
                <b>{p.title}</b>
                <small>{p.description}</small>
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a24b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          ))}
        </div>

        <p className={s.note}>Избор можете променити у сваком тренутку.</p>
      </div>
    </div>
  );
}

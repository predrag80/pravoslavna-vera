'use client';

import Link from 'next/link';
import { useState } from 'react';
import s from './ChurchGuide.module.css';

const PARTS = [
  { id: 'dome', name: 'Купола', x: 50, y: 10.6, text: 'Представља небо. У њеном врху најчешће је насликан Христос Сведржитељ, који с висине благосиља све сабране у храму.' },
  { id: 'iconostasis', name: 'Иконостас', x: 17.3, y: 60.6, text: 'Зид са иконама који одваја олтар од средњег дела храма. Десно од средњих врата увек је икона Христа, лево икона Богородице.' },
  { id: 'royal-doors', name: 'Царске двери', x: 50, y: 65.3, text: 'Средња врата иконостаса. Кроз њих свештеник износи Јеванђеље и Свете Дарове; на њима је обично икона Благовести.' },
  { id: 'lamp', name: 'Кандило', x: 68.2, y: 74.7, text: 'Мала уљана светиљка пред иконом. Њена тиха светлост подсећа на Христа, Светлост света, и на молитву која не престаје.' },
  { id: 'candle-stand', name: 'Свећњак', x: 19.6, y: 85.3, text: 'Овде верни пале свеће: на вишем свећњаку за живе, на нижем за упокојене. Свећа је мала жртва и знак молитве.' },
  { id: 'narthex', name: 'Припрата', x: 50, y: 92.4, text: 'Улазни део храма. У древној Цркви ту су стајали оглашени, који су се припремали за крштење. Одавде почиње упознавање.' },
];

export default function ChurchGuide() {
  const [selected, setSelected] = useState('iconostasis');
  const [seen, setSeen] = useState<Set<string>>(new Set(['iconostasis']));
  const part = PARTS.find((x) => x.id === selected)!;
  const ordinal = PARTS.indexOf(part) + 1;

  return (
    <>
      <div className={s.scene}>
        {/* The illustration is drawn on a 358×340 grid; spots are in percent so they follow the screen width. */}
        <svg viewBox="0 0 358 340" aria-hidden="true" className={s.drawing}>
          <path d="M99 100a80 80 0 0 1 160 0z" fill="#1e2f55" stroke="#c9a24b" strokeWidth="2" />
          <circle cx="179" cy="76" r="18" fill="#c9a24b" />
          <rect x="30" y="112" width="298" height="166" rx="6" fill="#6e5323" />
          <rect x="30" y="112" width="298" height="4" fill="#c9a24b" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={40 + i * 35.7} y="124" width="28" height="22" fill="#e6c77a" stroke="#8a6a2f" />)}
          {[40, 92, 222, 274].map((x, i) => (
            <g key={x}>
              <rect x={x} y="178" width="44" height="100" fill="#e6c77a" stroke="#8a6a2f" strokeWidth="2" />
              <circle cx={x + 22} cy="198" r="10" fill="#c9a24b" stroke="#8a6a2f" />
              <rect x={x + 10} y="212" width="24" height="50" rx="8" fill={['#2f4a3a', '#24365f', '#7a2620', '#6e5323'][i]} />
            </g>
          ))}
          <path d="M144 278V200a34 34 0 0 1 34-34V278z" fill="#c9a24b" stroke="#8a6a2f" strokeWidth="2" />
          <path d="M180 278V166a34 34 0 0 1 34 34V278z" fill="#c9a24b" stroke="#8a6a2f" strokeWidth="2" />
          <line x1="244" y1="0" x2="244" y2="232" stroke="#c9a24b" />
          <ellipse cx="244" cy="227" rx="3" ry="4.5" fill="#f2c14e" />
          <path d="M236 231h16a8 8 0 0 1-16 0z" fill="#b23a2e" />
          <rect x="0" y="278" width="358" height="62" fill="#0e1830" />
          <path d="M151 340v-20a28 28 0 0 1 56 0v20" fill="none" stroke="#c9a24b" strokeWidth="2" />
          <rect x="34" y="294" width="72" height="6" rx="3" fill="#c9a24b" />
          <rect x="68" y="300" width="4" height="28" fill="#c9a24b" />
          {[[46, 22], [68, 28], [90, 18]].map(([x, h]) => (
            <g key={x}>
              <rect x={x} y={294 - h!} width="4" height={h} fill="#f3ebd8" />
              <ellipse cx={x! + 2} cy={289 - h!} rx="3" ry="4.5" fill="#f2c14e" />
            </g>
          ))}
        </svg>
        {PARTS.map((x, i) => (
          <button
            key={x.id}
            type="button"
            className={s.spot}
            style={{ left: `${x.x}%`, top: `${x.y}%` }}
            aria-label={x.name}
            aria-pressed={x.id === selected}
            data-seen={seen.has(x.id) || undefined}
            onClick={() => {
              setSelected(x.id);
              setSeen(new Set(seen).add(x.id));
            }}
          >
            <span>{i + 1}</span>
          </button>
        ))}
      </div>

      <section className="card" aria-live="polite" style={{ marginTop: 14 }}>
        <span className="eyebrow">{ordinal} · Део храма</span>
        <h2 style={{ fontSize: 30, marginTop: 4 }}>{part.name}</h2>
        <p style={{ margin: '8px 0 0' }}>{part.text}</p>
        <div className={s.footer}>
          <span className="muted">Истражено {seen.size} од {PARTS.length}</span>
          <Link href="/ucenje/">Лествица ›</Link>
        </div>
      </section>
    </>
  );
}

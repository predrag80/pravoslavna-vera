'use client';

import { useState } from 'react';
import type { QuizQuestion } from '@/lib/content';

/** Optional knowledge check: the user opens it only if they want to. No points, no competition. */
export default function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  if (!open) {
    return (
      <button type="button" className="button button-dashed" onClick={() => setOpen(true)}>
        Провери знање · по жељи
      </button>
    );
  }
  return (
    <section className="card" aria-label="Провера знања">
      {questions.map((q, i) => (
        <fieldset key={i} style={{ border: 'none', margin: '0 0 12px', padding: 0 }}>
          <legend style={{ fontWeight: 700, marginBottom: 6 }}>{q.question}</legend>
          {q.answers.map((a, j) => {
            const selected = answers[i] === j;
            return (
              <label key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 44 }}>
                <input type="radio" name={`q${i}`} checked={selected} onChange={() => setAnswers({ ...answers, [i]: j })} />
                {a}
                {selected && <span style={{ color: j === q.correct ? '#2f6b3a' : 'var(--red)', fontWeight: 700 }}>{j === q.correct ? '— тачно' : '— покушајте поново'}</span>}
              </label>
            );
          })}
        </fieldset>
      ))}
    </section>
  );
}

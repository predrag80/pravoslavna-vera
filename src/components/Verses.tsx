'use client';

import { useState } from 'react';
import { useHighlights, type HighlightColor } from '@/lib/hooks';
import type { Verse } from '@/lib/bible';
import s from './Verses.module.css';

const COLORS: [HighlightColor, string][] = [['gold', 'Златна'], ['rose', 'Ружичаста'], ['blue', 'Плава']];
const verseKey = (x: Verse) => `${x.book}:${x.chapter}:${x.verse}`;

/** "Лк 7:11-13, 15" for the selected verses (in order), with the short book name. */
export function formatReference(list: Verse[], short: Record<string, string>): string {
  const parts: string[] = [];
  let i = 0;
  while (i < list.length) {
    const first = list[i]!;
    let j = i;
    while (j + 1 < list.length && list[j + 1]!.book === first.book && list[j + 1]!.chapter === first.chapter && list[j + 1]!.verse === list[j]!.verse + 1) j++;
    const range = j > i ? `${first.verse}-${list[j]!.verse}` : `${first.verse}`;
    const previous = parts.length ? list[i - 1] : undefined;
    if (previous && previous.book === first.book && previous.chapter === first.chapter) parts[parts.length - 1] += `, ${range}`;
    else if (previous && previous.book === first.book) parts.push(`${first.chapter}:${range}`);
    else parts.push(`${short[first.book] ?? first.book} ${first.chapter}:${range}`);
    i = j + 1;
  }
  return parts.join('; ');
}

/**
 * Text with verse numbers. Tapping a verse selects it; the bottom toolbar highlights the selected verses
 * with a color, removes the highlight or copies the text with its reference. Highlights are stored on the device.
 */
export default function Verses({ verses, short, showChapters = false }: { verses: Verse[]; short: Record<string, string>; showChapters?: boolean }) {
  const [highlights, setHighlights] = useHighlights();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const selectedVerses = verses.filter((x) => selected.has(verseKey(x)));
  const hasHighlight = selectedVerses.some((x) => highlights[verseKey(x)]);

  const toggle = (x: Verse) => {
    const next = new Set(selected);
    if (next.has(verseKey(x))) next.delete(verseKey(x));
    else next.add(verseKey(x));
    setSelected(next);
    setCopied(false);
  };
  const paint = (color: HighlightColor | null) => {
    setHighlights(Object.fromEntries(selectedVerses.map((x) => [verseKey(x), color ? { color, text: x.text } : null])));
    setSelected(new Set());
  };
  const copy = async () => {
    const text = `${selectedVerses.map((x) => x.text).join(' ')}\n— ${formatReference(selectedVerses, short)}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <p className={`reading-text ${s.text}`}>
        {verses.map((x, i) => {
          const k = verseKey(x);
          const h = highlights[k];
          const newChapter = showChapters && (i === 0 || verses[i - 1]!.chapter !== x.chapter || verses[i - 1]!.book !== x.book);
          return (
            <span key={k}>
              {newChapter && i > 0 && <br />}
              {newChapter && <span className={s.chapter}>{x.chapter}</span>}
              <span
                id={showChapters ? undefined : `s${x.verse}`}
                role="button"
                tabIndex={0}
                aria-pressed={selected.has(k)}
                aria-label={`Стих ${x.verse}${h ? ', обележен' : ''}`}
                className={`${s.verse} ${h ? s[h.color] : ''} ${selected.has(k) ? s.selected : ''}`}
                onClick={() => toggle(x)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle(x);
                  }
                }}
              >
                <sup className={s.number}>{x.verse}</sup>
                {x.text}
              </span>{' '}
            </span>
          );
        })}
      </p>

      {selectedVerses.length > 0 && <div className={s.spacer} aria-hidden="true" />}
      {selectedVerses.length > 0 && (
        <div className={s.toolbar} role="toolbar" aria-label="Изабрани стихови">
          <span className={s.reference}>{formatReference(selectedVerses, short)}</span>
          <div className={s.buttons}>
            {COLORS.map(([c, name]) => (
              <button key={c} type="button" className={`${s.swatch} ${s[c]}`} aria-label={`Обележи: ${name}`} onClick={() => paint(c)} />
            ))}
            {hasHighlight && <button type="button" className={s.textButton} onClick={() => paint(null)}>Уклони</button>}
            <button type="button" className={s.textButton} onClick={copy}>{copied ? 'Копирано ✓' : 'Копирај'}</button>
            <button type="button" className={s.close} aria-label="Поништи избор" onClick={() => setSelected(new Set())}>×</button>
          </div>
        </div>
      )}
    </>
  );
}

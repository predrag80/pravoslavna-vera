'use client';

import { useScript } from '@/lib/hooks';
import { setScript } from '@/lib/script-client';

/** Script toggle. `wide` shows full names (welcome screen). */
export default function ScriptToggle({ wide = false }: { wide?: boolean }) {
  const script = useScript();

  return (
    <div className={wide ? 'script-toggle wide' : 'script-toggle'} role="group" aria-label="Писмо" data-no-transliterate>
      <button type="button" aria-pressed={script === 'cyrillic'} aria-label="Ћирилица" onClick={() => setScript('cyrillic')}>
        {wide ? 'Ћирилица' : 'Ћ'}
      </button>
      <button type="button" aria-pressed={script === 'latin'} aria-label="Latinica" onClick={() => setScript('latin')}>
        {wide ? 'Latinica' : 'L'}
      </button>
    </div>
  );
}

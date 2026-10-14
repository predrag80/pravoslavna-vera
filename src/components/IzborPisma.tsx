'use client';

import { usePismo } from '@/lib/kuke';
import { promeniPismo } from '@/lib/pismo-klijent';

/** Избор писма. `siroko` приказује пуне називе (екран добродошлице). */
export default function IzborPisma({ siroko = false }: { siroko?: boolean }) {
  const pismo = usePismo();

  return (
    <div className={siroko ? 'izbor-pisma siroko' : 'izbor-pisma'} role="group" aria-label="Писмо" data-bez-preslovljavanja>
      <button type="button" aria-pressed={pismo === 'cir'} aria-label="Ћирилица" onClick={() => promeniPismo('cir')}>
        {siroko ? 'Ћирилица' : 'Ћ'}
      </button>
      <button type="button" aria-pressed={pismo === 'lat'} aria-label="Latinica" onClick={() => promeniPismo('lat')}>
        {siroko ? 'Latinica' : 'L'}
      </button>
    </div>
  );
}

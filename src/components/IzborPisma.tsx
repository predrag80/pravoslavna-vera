'use client';

import { usePismo } from '@/lib/kuke';
import { promeniPismo } from '@/lib/pismo-klijent';

export default function IzborPisma() {
  const pismo = usePismo();

  return (
    <div className="izbor-pisma" role="group" aria-label="Писмо" data-bez-preslovljavanja>
      <button type="button" aria-pressed={pismo === 'cir'} aria-label="Ћирилица" onClick={() => promeniPismo('cir')}>
        Ћ
      </button>
      <button type="button" aria-pressed={pismo === 'lat'} aria-label="Latinica" onClick={() => promeniPismo('lat')}>
        L
      </button>
    </div>
  );
}

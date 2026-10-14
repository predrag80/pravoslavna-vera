'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { danas, utc } from './kalendar';
import { sacuvanoPismo, type Pismo } from './pismo-klijent';

const bezPromena = () => () => {};

/**
 * Данашњи дан, познат тек у прегледачу (сајт се прави унапред).
 * На серверу враћа `null`, па компонента прво приказује податке из дана прављења сајта.
 */
export function useDanas(): Date | null {
  const kljuc = useSyncExternalStore(bezPromena, () => danas().toISOString().slice(0, 10), () => null);
  return useMemo(() => {
    if (!kljuc) return null;
    const [g, m, d] = kljuc.split('-').map(Number);
    return utc(g!, m!, d!);
  }, [kljuc]);
}

function pretplataNaPismo(obavesti: () => void) {
  window.addEventListener('pismo', obavesti);
  window.addEventListener('storage', obavesti);
  return () => {
    window.removeEventListener('pismo', obavesti);
    window.removeEventListener('storage', obavesti);
  };
}

export function usePismo(): Pismo {
  return useSyncExternalStore(pretplataNaPismo, sacuvanoPismo, () => 'cir');
}

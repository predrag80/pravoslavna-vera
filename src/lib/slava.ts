/** Крсна слава: датум у години и наредни дан славе. */
import podaci from '../data/slave.json' with { type: 'json' };
import { dodajDane, utc, vaskrs } from './kalendar.ts';

export interface Slava { id: string; naziv: string; svetitelj: string; stari?: number[]; odVaskrsa?: number; praznik: string | null }

export const SLAVE = podaci.slave as Slava[];

export function slava(id: string | null | undefined): Slava | null {
  return SLAVE.find((s) => s.id === id) ?? null;
}

/** Датум славе у датој грегоријанској години (непокретна слава по старом календару увек пада у исту годину, осим крајем децембра). */
export function datumSlave(s: Slava, godina: number): Date {
  if (s.odVaskrsa !== undefined) return dodajDane(vaskrs(godina), s.odVaskrsa);
  const [m, d] = s.stari as [number, number];
  // Стари датум + 13 дана; слава по старом 19–31. децембра пада у јануар следеће године.
  const uIstojGodini = dodajDane(utc(godina, m, d), 13);
  return uIstojGodini.getUTCFullYear() === godina ? uIstojGodini : dodajDane(utc(godina - 1, m, d), 13);
}

/** Наредни дан славе од датог дана (укључујући и тај дан). */
export function narednaSlava(s: Slava, od: Date): Date {
  const ove = datumSlave(s, od.getUTCFullYear());
  return ove.getTime() >= od.getTime() ? ove : datumSlave(s, od.getUTCFullYear() + 1);
}

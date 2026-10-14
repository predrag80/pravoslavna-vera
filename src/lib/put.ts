/** Пут који је корисник изабрао на екрану добродошлице. Чува се само на уређају. */
export type Put = 'pocetnik' | 'ucenje' | 'zivot';

const KLJUC = 'put';
const PUTEVI: Put[] = ['pocetnik', 'ucenje', 'zivot'];

export function sacuvaniPut(): Put | null {
  try {
    const v = localStorage.getItem(KLJUC);
    return PUTEVI.includes(v as Put) ? (v as Put) : null;
  } catch {
    return null;
  }
}

export function sacuvajPut(put: Put) {
  try {
    localStorage.setItem(KLJUC, put);
  } catch {
    /* приватни режим: избор важи до затварања */
  }
  window.dispatchEvent(new Event('put'));
}

/**
 * Скрипта која се извршава док се HTML учитава, пре приказа: ако пут није изабран,
 * прво отварање одмах води на екран добродошлице, без трептања почетне стране.
 */
export const PREUSMERI_AKO_NEMA_PUTA = `try{if(!localStorage.getItem('${KLJUC}'))location.replace('/dobrodosli/')}catch(e){}`;

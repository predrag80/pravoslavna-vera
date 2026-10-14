/** Рачун за мапу светиња: удаљеност, векови и редослед ходочашћа. */

export interface Tacka { lat: number; lon: number }

/** Удаљеност ваздушном линијом у километрима (хаверсинус). */
export function udaljenost(a: Tacka, b: Tacka): number {
  const r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r;
  const dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export function km(a: Tacka, b: Tacka): number {
  return Math.round(udaljenost(a, b));
}

const RIMSKI: Record<string, number> = { I: 1, V: 5, X: 10, L: 50 };

/** Први век из записа као „XII век“ или „XIV–XV век“ → 12, 14. */
export function vekBroj(vek: string): number | null {
  const m = /^[IVXL]+/.exec(vek.trim());
  if (!m) return null;
  const s = m[0];
  let zbir = 0;
  for (let i = 0; i < s.length; i++) {
    const v = RIMSKI[s[i]!]!;
    const sledeci = RIMSKI[s[i + 1] ?? ''] ?? 0;
    zbir += v < sledeci ? -v : v;
  }
  return zbir;
}

export function rimski(n: number): string {
  const parovi: [number, string][] = [[50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let s = '';
  for (const [v, z] of parovi) while (n >= v) { s += z; n -= v; }
  return s;
}

/** Укупна дужина путање кроз тачке редом (ваздушном линијом). */
export function ukupnoKm(tacke: Tacka[]): number {
  let zbir = 0;
  for (let i = 1; i < tacke.length; i++) zbir += udaljenost(tacke[i - 1]!, tacke[i]!);
  return Math.round(zbir);
}

/**
 * Краћи редослед обиласка: прва светиња остаје полазна, затим се увек иде до најближе
 * необиђене, па се укрштања уклањају заменом делова путање (2-opt). За неколико десетина
 * светиња то је довољно добро и тренутно.
 */
export function kraciRedosled<T extends Tacka>(lista: T[]): T[] {
  if (lista.length < 3) return [...lista];
  const ostale = lista.slice(1);
  const put: T[] = [lista[0]!];
  while (ostale.length) {
    const poslednja = put[put.length - 1]!;
    let najbliza = 0;
    for (let i = 1; i < ostale.length; i++) if (udaljenost(poslednja, ostale[i]!) < udaljenost(poslednja, ostale[najbliza]!)) najbliza = i;
    put.push(ostale.splice(najbliza, 1)[0]!);
  }
  let bolje = true;
  while (bolje) {
    bolje = false;
    for (let i = 1; i < put.length - 1; i++) {
      for (let j = i + 1; j < put.length; j++) {
        const a = put[i - 1]!, b = put[i]!, c = put[j]!, d = put[j + 1];
        const pre = udaljenost(a, b) + (d ? udaljenost(c, d) : 0);
        const posle = udaljenost(a, c) + (d ? udaljenost(b, d) : 0);
        if (posle + 1e-9 < pre) {
          put.splice(i, j - i + 1, ...put.slice(i, j + 1).reverse());
          bolje = true;
        }
      }
    }
  }
  return put;
}

/** Веза ка навигацији са свим станицама редом (Google мапе примају више станица без кључа). */
export function vezaZaPutanju(tacke: Tacka[], polazak?: Tacka | null): string {
  const sve = polazak ? [polazak, ...tacke] : tacke;
  return 'https://www.google.com/maps/dir/' + sve.map((t) => `${t.lat},${t.lon}`).join('/') + '/';
}

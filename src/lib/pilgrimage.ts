/** Calculations for the shrine map: distance, centuries and pilgrimage order. */

export interface Point { lat: number; lon: number }

/** Great-circle distance in kilometres (haversine). */
export function distance(a: Point, b: Point): number {
  const r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r;
  const dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export function km(a: Point, b: Point): number {
  return Math.round(distance(a, b));
}

const ROMAN: Record<string, number> = { I: 1, V: 5, X: 10, L: 50 };

/** The first century from a notation like „XII век“ or „XIV–XV век“ → 12, 14. */
export function centuryNumber(century: string): number | null {
  const m = /^[IVXL]+/.exec(century.trim());
  if (!m) return null;
  const s = m[0];
  let sum = 0;
  for (let i = 0; i < s.length; i++) {
    const v = ROMAN[s[i]!]!;
    const next = ROMAN[s[i + 1] ?? ''] ?? 0;
    sum += v < next ? -v : v;
  }
  return sum;
}

export function toRoman(n: number): string {
  const pairs: [number, string][] = [[50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let s = '';
  for (const [v, sym] of pairs) while (n >= v) { s += sym; n -= v; }
  return s;
}

/** Total length of a route through the points in order (great-circle). */
export function totalKm(points: Point[]): number {
  let sum = 0;
  for (let i = 1; i < points.length; i++) sum += distance(points[i - 1]!, points[i]!);
  return Math.round(sum);
}

/**
 * A shorter visiting order: the first shrine stays the starting point, then it always goes to the nearest
 * unvisited one, and crossings are removed by reversing route segments (2-opt). For a few dozen
 * shrines this is good enough and instant.
 */
export function shorterOrder<T extends Point>(list: T[]): T[] {
  if (list.length < 3) return [...list];
  const remaining = list.slice(1);
  const route: T[] = [list[0]!];
  while (remaining.length) {
    const last = route[route.length - 1]!;
    let nearest = 0;
    for (let i = 1; i < remaining.length; i++) if (distance(last, remaining[i]!) < distance(last, remaining[nearest]!)) nearest = i;
    route.push(remaining.splice(nearest, 1)[0]!);
  }
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < route.length - 1; i++) {
      for (let j = i + 1; j < route.length; j++) {
        const a = route[i - 1]!, b = route[i]!, c = route[j]!, d = route[j + 1];
        const before = distance(a, b) + (d ? distance(c, d) : 0);
        const after = distance(a, c) + (d ? distance(b, d) : 0);
        if (after + 1e-9 < before) {
          route.splice(i, j - i + 1, ...route.slice(i, j + 1).reverse());
          improved = true;
        }
      }
    }
  }
  return route;
}

/** Navigation link with all stops in order (Google Maps accepts multiple stops without an API key). */
export function directionsUrl(points: Point[], origin?: Point | null): string {
  const all = origin ? [origin, ...points] : points;
  return 'https://www.google.com/maps/dir/' + all.map((t) => `${t.lat},${t.lon}`).join('/') + '/';
}

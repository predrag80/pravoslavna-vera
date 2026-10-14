/**
 * Календар у формату iCalendar (.ics): догађаји преко целог дана са подсетником.
 * Фајл се прави у прегледачу; телефон га отвара у својој апликацији за календар,
 * а подсетнике после шаље сам телефон, па није потребан никакав сервер.
 */
export type Podsetnik = 'dan-ranije' | 'ujutru' | 'bez';

export interface Dogadjaj {
  uid: string;
  naslov: string;
  opis?: string;
  datum: Date; // UTC поноћ
  podsetnik: Podsetnik;
}

function datumIcs(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

function escape(t: string): string {
  return t.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Ред дужи од 75 бајтова се прелама, како стандард захтева (без цепања UTF-8 знакова). */
function prelomi(red: string): string {
  const enc = new TextEncoder();
  if (enc.encode(red).length <= 75) return red;
  const delovi: string[] = [];
  let trenutni = '';
  for (const z of red) {
    const granica = delovi.length === 0 ? 75 : 74;
    if (enc.encode(trenutni + z).length > granica) {
      delovi.push(trenutni);
      trenutni = z;
    } else trenutni += z;
  }
  delovi.push(trenutni);
  return delovi.join('\r\n ');
}

const OKIDAC: Record<Exclude<Podsetnik, 'bez'>, string> = {
  'dan-ranije': '-PT5H', // дан раније у 19:00
  ujutru: 'PT7H', // истог дана у 7:00
};

export function napraviIcs(dogadjaji: Dogadjaj[], sada = new Date()): string {
  const stamp = sada.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const redovi = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Pravoslavlje//SR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Православље'];
  for (const d of dogadjaji) {
    const sutra = new Date(d.datum.getTime() + 86_400_000);
    redovi.push('BEGIN:VEVENT', `UID:${d.uid}@pravoslavlje`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${datumIcs(d.datum)}`, `DTEND;VALUE=DATE:${datumIcs(sutra)}`, `SUMMARY:${escape(d.naslov)}`, 'TRANSP:TRANSPARENT');
    if (d.opis) redovi.push(`DESCRIPTION:${escape(d.opis)}`);
    if (d.podsetnik !== 'bez') redovi.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escape(d.naslov)}`, `TRIGGER:${OKIDAC[d.podsetnik]}`, 'END:VALARM');
    redovi.push('END:VEVENT');
  }
  redovi.push('END:VCALENDAR');
  return redovi.map(prelomi).join('\r\n') + '\r\n';
}

/** Преузимање .ics фајла у прегледачу. */
export function preuzmiIcs(ime: string, dogadjaji: Dogadjaj[]) {
  const blob = new Blob([napraviIcs(dogadjaji)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = ime;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

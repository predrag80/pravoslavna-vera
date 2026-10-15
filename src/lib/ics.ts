/**
 * Calendar in iCalendar (.ics) format: all-day events with a reminder.
 * The file is built in the browser; the phone opens it in its calendar app,
 * and the phone itself delivers the reminders afterwards, so no server is needed.
 */
export type Reminder = 'day-before' | 'morning' | 'none';

export interface CalendarEvent {
  uid: string;
  title: string;
  description?: string;
  date: Date; // UTC midnight
  reminder: Reminder;
}

function icsDate(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

function escape(t: string): string {
  return t.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** A line longer than 75 bytes is folded, as the standard requires (without splitting UTF-8 characters). */
function fold(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let current = '';
  for (const ch of line) {
    const limit = parts.length === 0 ? 75 : 74;
    if (enc.encode(current + ch).length > limit) {
      parts.push(current);
      current = ch;
    } else current += ch;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

const TRIGGER: Record<Exclude<Reminder, 'none'>, string> = {
  'day-before': '-PT5H', // the day before at 19:00
  morning: 'PT7H', // the same day at 7:00
};

export function buildIcs(events: CalendarEvent[], now = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Pravoslavlje//SR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Православље'];
  for (const e of events) {
    const nextDay = new Date(e.date.getTime() + 86_400_000);
    lines.push('BEGIN:VEVENT', `UID:${e.uid}@pravoslavlje`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${icsDate(e.date)}`, `DTEND;VALUE=DATE:${icsDate(nextDay)}`, `SUMMARY:${escape(e.title)}`, 'TRANSP:TRANSPARENT');
    if (e.description) lines.push(`DESCRIPTION:${escape(e.description)}`);
    if (e.reminder !== 'none') lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escape(e.title)}`, `TRIGGER:${TRIGGER[e.reminder]}`, 'END:VALARM');
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}

/** Downloads an .ics file in the browser. */
export function downloadIcs(fileName: string, events: CalendarEvent[]) {
  const blob = new Blob([buildIcs(events)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildIcs } from '../src/lib/ics.ts';
import { utc } from '../src/lib/calendar.ts';

test('iCalendar file', () => {
  const ics = buildIcs([{ uid: 'bozic-2027', title: 'Божић, Рођење Христово', description: 'Црвено слово', date: utc(2027, 1, 7), reminder: 'day-before' }], new Date('2026-10-14T12:00:00Z'));
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n'));
  assert.ok(ics.includes('DTSTART;VALUE=DATE:20270107'));
  assert.ok(ics.includes('DTEND;VALUE=DATE:20270108'));
  assert.ok(ics.includes('SUMMARY:Божић\\, Рођење Христово'));
  assert.ok(ics.includes('TRIGGER:-PT5H'));
  // No line is longer than 75 bytes.
  for (const line of ics.split('\r\n')) assert.ok(new TextEncoder().encode(line).length <= 75, line);
});

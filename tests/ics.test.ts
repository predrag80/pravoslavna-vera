import { test } from 'node:test';
import assert from 'node:assert/strict';
import { napraviIcs } from '../src/lib/ics.ts';
import { utc } from '../src/lib/kalendar.ts';

test('iCalendar фајл', () => {
  const ics = napraviIcs([{ uid: 'bozic-2027', naslov: 'Божић, Рођење Христово', opis: 'Црвено слово', datum: utc(2027, 1, 7), podsetnik: 'dan-ranije' }], new Date('2026-10-14T12:00:00Z'));
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n'));
  assert.ok(ics.includes('DTSTART;VALUE=DATE:20270107'));
  assert.ok(ics.includes('DTEND;VALUE=DATE:20270108'));
  assert.ok(ics.includes('SUMMARY:Божић\\, Рођење Христово'));
  assert.ok(ics.includes('TRIGGER:-PT5H'));
  // Ниједан ред није дужи од 75 бајтова.
  for (const red of ics.split('\r\n')) assert.ok(new TextEncoder().encode(red).length <= 75, red);
});

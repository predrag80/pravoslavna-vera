#!/usr/bin/env node
/**
 * Увоз текста Светог писма (Даничић–Караџић) из USFM фајлова.
 *
 * 1. Са https://ebible.org/find/show.php?id=srp1865 преузмите USFM архиву (у делу „Show formats for developers“).
 * 2. Распакујте је у фасциклу `uvoz/usfm/` у корену пројекта.
 * 3. Покрените: npm run uvoz:biblija
 *
 * Резултат: src/data/biblija/<књига>.json, облика { "1": ["стих 1", "стих 2", …], "2": [...] }.
 * Текст на eBible.org је на латиници, па се при увозу пресловљава на ћирилицу.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const koren = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ulaz = path.resolve(process.argv[2] ?? path.join(koren, 'uvoz', 'usfm'));
const izlaz = path.join(koren, 'src', 'data', 'biblija');
const knjige = JSON.parse(fs.readFileSync(path.join(koren, 'src', 'data', 'knjige.json'), 'utf8'));
const poKodu = new Map([...knjige.stariZavet, ...knjige.noviZavet].flatMap((g) => g.knjige).map((k) => [k.usfm, k]));

// Исто пресловљавање као у src/lib/preslovljavanje.ts (uCirilicu).
const PAROVI = [['Lj','Љ'],['LJ','Љ'],['lj','љ'],['Nj','Њ'],['NJ','Њ'],['nj','њ'],['Dž','Џ'],['DŽ','Џ'],['dž','џ']];
const SLOVA = Object.fromEntries('A А B Б V В G Г D Д Đ Ђ E Е Ž Ж Z З I И J Ј K К L Л M М N Н O О P П R Р S С T Т Ć Ћ U У F Ф H Х C Ц Č Ч Š Ш a а b б v в g г d д đ ђ e е ž ж z з i и j ј k к l л m м n н o о p п r р s с t т ć ћ u у f ф h х c ц č ч š ш'.split(' ').reduce((a, x, i, n) => (i % 2 ? a : [...a, [x, n[i + 1]]]), []));
function uCirilicu(t) {
  let r = '';
  for (let i = 0; i < t.length; ) {
    const par = PAROVI.find(([l]) => t.startsWith(l, i));
    if (par) { r += par[1]; i += 2; } else { r += SLOVA[t[i]] ?? t[i]; i += 1; }
  }
  return r;
}

/** Уклања USFM ознаке које нису текст стиха (фусноте, унакрсне референце, форматирање). */
function ocisti(t) {
  return t
    .replace(/\\f .*?\\f\*/g, '')
    .replace(/\\x .*?\\x\*/g, '')
    .replace(/\\w ([^|\\]*)(\|[^\\]*)?\\w\*/g, '$1')
    .replace(/\\\+?[a-z]+\d?\*?/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function procitajUsfm(tekst) {
  const id = tekst.match(/^\\id\s+(\S+)/m)?.[1];
  const glave = {};
  let glava = null;
  let stih = null;
  for (const red of tekst.split(/\r?\n/)) {
    const c = red.match(/^\\c\s+(\d+)/);
    if (c) { glava = c[1]; glave[glava] = []; stih = null; continue; }
    if (!glava) continue;
    const v = red.match(/^\\v\s+(\d+)\S*\s*(.*)$/);
    if (v) { stih = Number(v[1]); glave[glava][stih - 1] = v[2]; continue; }
    // Наставак стиха у следећем реду (\p, \q1 …).
    if (stih && !/^\\(s\d?|ms|mr|r|d|cl|h|toc|mt)\b/.test(red)) {
      const nastavak = red.replace(/^\\[a-z]+\d?\s*/, '');
      if (nastavak) glave[glava][stih - 1] = `${glave[glava][stih - 1] ?? ''} ${nastavak}`;
    }
  }
  for (const g of Object.keys(glave)) glave[g] = Array.from(glave[g], (s) => uCirilicu(ocisti(s ?? '')));
  return { id, glave };
}

function main() {
  if (!fs.existsSync(ulaz)) {
    console.error(`Нема фасцикле ${ulaz}. Упутство је на врху овог фајла.`);
    process.exit(1);
  }
  fs.mkdirSync(izlaz, { recursive: true });
  let broj = 0;
  for (const f of fs.readdirSync(ulaz).filter((x) => /\.(usfm|sfm)$/i.test(x))) {
    const { id, glave } = procitajUsfm(fs.readFileSync(path.join(ulaz, f), 'utf8'));
    const k = id && poKodu.get(id);
    if (!k) continue;
    fs.writeFileSync(path.join(izlaz, `${k.id}.json`), JSON.stringify(glave));
    broj += 1;
    console.log(`✓ ${k.naziv}: ${Object.keys(glave).length} глава`);
  }
  console.log(`Увезено књига: ${broj} од ${poKodu.size}.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();

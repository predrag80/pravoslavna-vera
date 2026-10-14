#!/usr/bin/env node
/**
 * Слике за значајне празнике са Wikimedia Commons.
 *
 *   npm run slike                 — преузима слике које још немамо
 *   npm run slike -- --ponovo vaskrs bozic   — поново бира и преузима наведене
 *
 * За сваки празник (scripts/slike-izbor.json) скрипта проба тачне називе фајлова, па претрагу.
 * Прихвата само слободне лиценце (јавно добро, CC0, CC BY, CC BY-SA), бира слику ширине бар 800 px,
 * преузима умањену верзију (1280 px) у public/slike/praznici/ и уписује аутора и лиценцу у src/data/slike.json.
 * Потребан је интернет; покреће се на рачунару, не на серверу.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://commons.wikimedia.org/w/api.php';
const SIRINA = 1280;
// Wikimedia тражи да аутоматизовани захтеви имају препознатљив User-Agent.
const ZAGLAVLJA = { 'User-Agent': 'PravoslavljeApp/0.1 (https://github.com/; slike za praznike)' };

const koren = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fajlIzbora = path.join(koren, 'scripts', 'slike-izbor.json');
const fajlSlika = path.join(koren, 'src', 'data', 'slike.json');
const folderSlika = path.join(koren, 'public', 'slike', 'praznici');

/** Да ли лиценца дозвољава употребу у апликацији (без „некомерцијално“ и „без измена“). */
export function dozvoljenaLicenca(kratko = '', uslovi = '') {
  const t = `${kratko} ${uslovi}`.toLowerCase();
  if (/\bnc\b|non-?commercial|\bnd\b|no-?deriv|fair use/.test(t)) return false;
  return /public domain|\bpd\b|pd-|cc0|cc[- ]by(-sa)?[- ]\d/.test(t);
}

export function ocistiHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/** Из одговора API-ја (imageinfo) прави запис за slike.json или враћа null ако слика не одговара. */
export function zapisIzInfo(stranica, opis) {
  const info = stranica?.imageinfo?.[0];
  if (!info || stranica.missing !== undefined) return null;
  const m = info.extmetadata ?? {};
  const licenca = ocistiHtml(m.LicenseShortName?.value);
  if (!dozvoljenaLicenca(licenca, ocistiHtml(m.UsageTerms?.value))) return null;
  if ((info.width ?? 0) < 800 || !/^image\/(jpeg|png|webp)$/.test(info.mime ?? '')) return null;
  const autor = ocistiHtml(m.Artist?.value) || 'непознат аутор';
  return {
    izvorniUrl: info.thumburl ?? info.url,
    sirina: info.thumbwidth ?? info.width,
    visina: info.thumbheight ?? info.height,
    opis,
    autor: autor.length > 80 ? `${autor.slice(0, 77)}…` : autor,
    licenca,
    licencaUrl: m.LicenseUrl?.value || undefined,
    stranica: info.descriptionurl,
  };
}

async function api(parametri) {
  const url = `${API}?${new URLSearchParams({ format: 'json', formatversion: '2', ...parametri })}`;
  const r = await fetch(url, { headers: ZAGLAVLJA });
  if (!r.ok) throw new Error(`Commons API: ${r.status}`);
  return r.json();
}

async function informacije(naslovi) {
  if (!naslovi.length) return [];
  const odgovor = await api({
    action: 'query', prop: 'imageinfo', titles: naslovi.join('|'),
    iiprop: 'url|size|mime|extmetadata', iiurlwidth: String(SIRINA), iiextmetadatafilter: 'LicenseShortName|UsageTerms|LicenseUrl|Artist',
  });
  const stranice = odgovor.query?.pages ?? [];
  // Задржи редослед из захтева.
  return naslovi.map((n) => stranice.find((p) => p.title === n || p.title === n.replace(/_/g, ' '))).filter(Boolean);
}

async function pretrazi(upit) {
  const odgovor = await api({ action: 'query', list: 'search', srsearch: `${upit} filetype:bitmap`, srnamespace: '6', srlimit: '15' });
  return (odgovor.query?.search ?? []).map((x) => x.title);
}

async function izaberi(id, izbor) {
  const kandidati = izbor.kandidati.map((f) => `File:${f}`);
  for (const p of await informacije(kandidati)) {
    const z = zapisIzInfo(p, izbor.opis);
    if (z) return z;
  }
  for (const upit of izbor.pretrage) {
    const naslovi = await pretrazi(upit);
    for (const p of await informacije(naslovi)) {
      const z = zapisIzInfo(p, izbor.opis);
      if (z) return z;
    }
  }
  return null;
}

async function main() {
  const argumenti = process.argv.slice(2);
  const ponovo = argumenti.includes('--ponovo') ? argumenti.filter((a) => !a.startsWith('--')) : [];
  const izbor = JSON.parse(fs.readFileSync(fajlIzbora, 'utf8')).praznici;
  const podaci = JSON.parse(fs.readFileSync(fajlSlika, 'utf8'));
  fs.mkdirSync(folderSlika, { recursive: true });

  for (const [id, stavka] of Object.entries(izbor)) {
    const postoji = podaci.slike[id] && fs.existsSync(path.join(koren, 'public', podaci.slike[id].putanja));
    if (postoji && !ponovo.includes(id)) continue;
    try {
      const z = await izaberi(id, stavka);
      if (!z) {
        console.log(`✗ ${id}: нема одговарајуће слике са слободном лиценцом`);
        continue;
      }
      const odgovor = await fetch(z.izvorniUrl, { headers: ZAGLAVLJA });
      if (!odgovor.ok) throw new Error(`преузимање: ${odgovor.status}`);
      const nastavak = path.extname(new URL(z.izvorniUrl).pathname).toLowerCase() || '.jpg';
      const ime = `${id}${nastavak === '.jpeg' ? '.jpg' : nastavak}`;
      fs.writeFileSync(path.join(folderSlika, ime), Buffer.from(await odgovor.arrayBuffer()));
      const { izvorniUrl: _, ...zapis } = z;
      podaci.slike[id] = { putanja: `/slike/praznici/${ime}`, ...zapis };
      console.log(`✓ ${id}: ${zapis.stranica}  (${zapis.licenca}, ${zapis.autor})`);
      await new Promise((r) => setTimeout(r, 300)); // учтиво према серверу
    } catch (e) {
      console.log(`✗ ${id}: ${e.message}`);
    }
  }
  fs.writeFileSync(fajlSlika, JSON.stringify(podaci, null, 2) + '\n');
  console.log('\nПрегледајте слике у public/slike/praznici/ и њихове изворе у src/data/slike.json.');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

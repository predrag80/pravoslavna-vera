#!/usr/bin/env node
/**
 * Images for major feasts from Wikimedia Commons.
 *
 *   npm run images                          — downloads images we do not have yet
 *   npm run images -- --redo vaskrs bozic   — picks and downloads the listed ones again
 *
 * For each feast (scripts/image-sources.json) the script tries the exact file names first, then a search.
 * It accepts only free licenses (public domain, CC0, CC BY, CC BY-SA), picks an image at least 800 px wide,
 * downloads a scaled-down version (1280 px) into public/slike/praznici/ and writes the author and license to src/data/images.json.
 * Needs internet access; run it on your computer, not on the server.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://commons.wikimedia.org/w/api.php';
const WIDTH = 1280;
// Wikimedia asks automated requests to send a recognisable User-Agent.
const HEADERS = { 'User-Agent': 'PravoslavljeApp/0.1 (https://github.com/; feast images)' };

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcesFile = path.join(root, 'scripts', 'image-sources.json');
const imagesFile = path.join(root, 'src', 'data', 'images.json');
const imagesFolder = path.join(root, 'public', 'slike', 'praznici');

/** Whether the license allows use in the app (no "non-commercial" or "no derivatives"). */
export function isAllowedLicense(short = '', terms = '') {
  const t = `${short} ${terms}`.toLowerCase();
  if (/\bnc\b|non-?commercial|\bnd\b|no-?deriv|fair use/.test(t)) return false;
  return /public domain|\bpd\b|pd-|cc0|cc[- ]by(-sa)?[- ]\d/.test(t);
}

export function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/** Builds an images.json entry from an API response (imageinfo), or returns null if the image is not suitable. */
export function entryFromInfo(page, description) {
  const info = page?.imageinfo?.[0];
  if (!info || page.missing !== undefined) return null;
  const m = info.extmetadata ?? {};
  const license = stripHtml(m.LicenseShortName?.value);
  if (!isAllowedLicense(license, stripHtml(m.UsageTerms?.value))) return null;
  if ((info.width ?? 0) < 800 || !/^image\/(jpeg|png|webp)$/.test(info.mime ?? '')) return null;
  const author = stripHtml(m.Artist?.value) || 'непознат аутор';
  return {
    sourceUrl: info.thumburl ?? info.url,
    width: info.thumbwidth ?? info.width,
    height: info.thumbheight ?? info.height,
    description,
    author: author.length > 80 ? `${author.slice(0, 77)}…` : author,
    license,
    licenseUrl: m.LicenseUrl?.value || undefined,
    page: info.descriptionurl,
  };
}

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: 'json', formatversion: '2', ...params })}`;
  const r = await fetch(url, { headers: HEADERS });
  if (!r.ok) throw new Error(`Commons API: ${r.status}`);
  return r.json();
}

async function fileInfo(titles) {
  if (!titles.length) return [];
  const response = await api({
    action: 'query', prop: 'imageinfo', titles: titles.join('|'),
    iiprop: 'url|size|mime|extmetadata', iiurlwidth: String(WIDTH), iiextmetadatafilter: 'LicenseShortName|UsageTerms|LicenseUrl|Artist',
  });
  const pages = response.query?.pages ?? [];
  // Keep the order of the request.
  return titles.map((n) => pages.find((p) => p.title === n || p.title === n.replace(/_/g, ' '))).filter(Boolean);
}

async function search(query) {
  const response = await api({ action: 'query', list: 'search', srsearch: `${query} filetype:bitmap`, srnamespace: '6', srlimit: '15' });
  return (response.query?.search ?? []).map((x) => x.title);
}

async function pick(id, source) {
  const candidates = source.candidates.map((f) => `File:${f}`);
  for (const p of await fileInfo(candidates)) {
    const e = entryFromInfo(p, source.description);
    if (e) return e;
  }
  for (const query of source.searches) {
    const titles = await search(query);
    for (const p of await fileInfo(titles)) {
      const e = entryFromInfo(p, source.description);
      if (e) return e;
    }
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const redo = args.includes('--redo') ? args.filter((a) => !a.startsWith('--')) : [];
  const sources = JSON.parse(fs.readFileSync(sourcesFile, 'utf8')).feasts;
  const data = JSON.parse(fs.readFileSync(imagesFile, 'utf8'));
  fs.mkdirSync(imagesFolder, { recursive: true });

  for (const [id, source] of Object.entries(sources)) {
    const exists = data.images[id] && fs.existsSync(path.join(root, 'public', data.images[id].path));
    if (exists && !redo.includes(id)) continue;
    try {
      const e = await pick(id, source);
      if (!e) {
        console.log(`✗ ${id}: no suitable image with a free license`);
        continue;
      }
      const response = await fetch(e.sourceUrl, { headers: HEADERS });
      if (!response.ok) throw new Error(`download: ${response.status}`);
      const extension = path.extname(new URL(e.sourceUrl).pathname).toLowerCase() || '.jpg';
      const fileName = `${id}${extension === '.jpeg' ? '.jpg' : extension}`;
      fs.writeFileSync(path.join(imagesFolder, fileName), Buffer.from(await response.arrayBuffer()));
      const { sourceUrl: _, ...entry } = e;
      data.images[id] = { path: `/slike/praznici/${fileName}`, ...entry };
      console.log(`✓ ${id}: ${entry.page}  (${entry.license}, ${entry.author})`);
      await new Promise((r) => setTimeout(r, 300)); // be polite to the server
    } catch (err) {
      console.log(`✗ ${id}: ${err.message}`);
    }
  }
  fs.writeFileSync(imagesFile, JSON.stringify(data, null, 2) + '\n');
  console.log('\nReview the images in public/slike/praznici/ and their sources in src/data/images.json.');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

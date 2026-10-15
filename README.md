# Pravoslavlje (Православље)

A web app about the Orthodox faith: a calendar with feasts and fasts, the Holy Scripture, the Psalter,
the Ohrid Prologue, the Holy Fathers, step-by-step learning (Lestvica, "The Ladder") and an interactive map of churches and monasteries in Serbia.

## Getting started

```bash
npm install
npm run dev        # development: http://localhost:3000
npm run build      # static site in out/ + search index (Pagefind)
npm run start      # preview the built site
npm test           # tests for the calendar, fasting, transliteration, psalms and readings
npm run lint && npm run typecheck
```

Node.js 20.9 or newer is required.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`: checks (lint, typecheck, tests), build, and
upload of the `out/` folder to hosting (https://pravoslavna-vera.prowebsystems.rs). Credentials are set in
GitHub → Settings → Secrets and variables → Actions:

- FTP (cPanel): `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_DIR` (the subdomain folder on the server, ending with `/`);
- or SSH: `SSH_HOST`, `SSH_USER`, `SSH_KEY`, `SSH_DIR`, optionally `SSH_PORT`.
- Password protection while the app is in preparation: `HTTP_AUTH_USER` and `HTTP_AUTH_PASS`. Once the secrets are deleted, the next deployment removes the protection.

`public/.htaccess` configures Apache (HTTPS, 404 page, caching). The site is static: no Node is needed on the server.

## Stack

| Part | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript | Static export (`output: 'export'`); when an API or database is needed, remove that line and add API routes. |
| Content | JSON (`src/data/`) and Markdown (`content/`) | No database and no external API; changes go through Git and can be reviewed. |
| Calendar | `src/lib/calendar.ts` | The paschalion, the old calendar, movable feasts and fasts are all computed locally. |
| Map | MapLibre GL + OpenFreeMap | Open source, no API key; clustering of nearby shrines is built in. |
| Search | Pagefind | Static full-site search that also works with Cyrillic. |
| Script | Cyrillic in the source text, Latin by transliteration | `src/lib/transliteration.ts`, `src/lib/script-client.ts` |
| Offline | `public/sw.js` | Pages are cached on the device. |
| Fonts | Cormorant Garamond, PT Serif, Manrope (`@fontsource`) | Bundled with the project, with Cyrillic glyphs. |

## Structure

```
content/            Lestvica lessons, prayers and feast texts (Markdown)
public/             icon, manifest, service worker
scripts/            feast images, copying the MapLibre worker
src/app/            pages (Today, calendar, Scripture, Psalter, Prologue, Fathers, Learning, Church, map, search)
src/components/     components and their styles (CSS modules)
src/data/           feasts, books, shrines, Holy Fathers, saints
src/lib/            calendar, dates, transliteration, Bible, content
tests/              tests (node --test)
```

## Text of the Holy Scripture

The text is not in the repository. Data is taken exclusively from Orthodox sources: the text will be added from
the edition used by the Serbian Orthodox Church (e.g. the Synodal translation of the New Testament), with the publisher's permission.
The format is `src/data/bible/<book>.json`, shaped `{ "1": ["verse 1", "verse 2", …], "2": […] }` (book id from `src/data/books.json`);
as soon as the file exists, the chapter pages, the daily readings and verse highlighting display it with no other changes.

## Daily readings and highlighted verses

- `src/data/readings/2026.json`: the Epistle and Gospel at the Liturgy, by date. Sundays are taken from crkvenikalendar.rs,
  and the great feasts use the customary readings per the Typikon; weekday readings have not been entered yet.
  Reference notation: `Мк 8:34-9:1; Лк 5:1-11` (parsed by `src/lib/readings.ts`, tests in `tests/readings.test.ts`).
- The pages `/citanja/` and `/citanja/<date>/` show the text from the imported Bible; a card with the next readings is also on the Today screen.
- In every chapter and in the readings a verse is selected by tapping, then highlighted in one of three colours or copied with its reference.
  Highlighted verses are at `/pismo/obelezeno/` and are stored on the device.

## Calendar and feast images

- The calendar has a month view and the Year Wheel; tapping a date opens the "day sheet" (swiping left/right changes the day).
- Texts of major feasts are in `content/feasts/<id>.md` (id from `src/data/feasts.json`); each also has its own page `/praznik/<id>/`.
- Images are downloaded from Wikimedia Commons:

```bash
npm run images                         # downloads images that are still missing
npm run images -- --redo vaskrs        # picks the image again for the listed feasts
```

The script accepts only free licenses (public domain, CC0, CC BY, CC BY-SA), saves the images to `public/slike/praznici/`
and writes the author and license to `src/data/images.json`; the app shows this information under every image, as the licenses require.
What to look for per feast is configured in `scripts/image-sources.json` (an exact file name as the first candidate takes precedence).

## Map

The default base map is OpenFreeMap (free, no key). A different base map is set in `.env.local`:

```
NEXT_PUBLIC_MAP_STYLE=https://…/style.json
```

For offline use the next step is a PMTiles extract of Serbia (Protomaps) served from `public/`.
The map has filters (kind, eparchy, century, features), "Nearby" (a list sorted by distance from the user) and a pilgrimage planner:
shrines are added in order, the route length is calculated, "Shorter order" arranges the visit (`src/lib/pilgrimage.ts`), and navigation
opens in Google Maps with all the stops. The pilgrimage is stored on the device.

The initial set of shrines is in `src/data/shrines.json` (eparchies in `src/data/eparchies.json`); the coordinates need checking, and the full database should be completed
from the data of the SOC eparchies and OpenStreetMap.

## What a priest or theologian must review

- fasting: for 2026 the fasting level per day is taken from the church calendar (crkvenikalendar.rs) in `src/data/fasting/2026.json`;
  for other years it is computed by the rules (`fastByRules` in `src/lib/calendar.ts`), which match the calendar day by day for 2026.
  For a new year, add `src/data/fasting/<year>.json` and register it in `FAST_CALENDARS`. The list of feasts with a relaxation (`OIL_RELAXATION`) should be checked by a priest;
- the prayer texts in `content/prayers/` (short prayers are in, longer ones await text from a verified prayer book) and the order of the morning and evening rules (`rules` in the file's front matter);
- the list and dates of family slavas in `src/data/slavas.json` and the description of customs in `src/components/SlavaPicker.tsx`;

- `src/data/feasts.json`: the list and red-letter markings;
- the lessons in `content/lessons/`, the descriptions in `src/data/fathers.json` and `src/data/shrines.json`;
- `src/data/saints.json` is only a sample; a full menologion from a verified source is needed.

## Copyright

- Daničić–Karadžić: public domain.
- Ohrid Prologue (St Nikolaj of Serbia): the text is published only with the rights holder's permission; until then `[…]` placeholders are shown.
- Synodal translation of the New Testament: only with the permission of the SOC.

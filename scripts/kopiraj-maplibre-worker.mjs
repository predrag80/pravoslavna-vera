// MapLibre 6 учитава свој worker као посебан фајл; копирамо га у public/ да би га Next.js послужио.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const izvor = path.join(path.dirname(require.resolve('maplibre-gl/package.json')), 'dist', 'maplibre-gl-worker.mjs');
const cilj = path.join(process.cwd(), 'public', 'maplibre', 'maplibre-gl-worker.mjs');
fs.mkdirSync(path.dirname(cilj), { recursive: true });
fs.copyFileSync(izvor, cilj);

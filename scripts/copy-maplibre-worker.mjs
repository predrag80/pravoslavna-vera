// MapLibre 6 loads its worker as a separate file; we copy it into public/ so Next.js serves it.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const source = path.join(path.dirname(require.resolve('maplibre-gl/package.json')), 'dist', 'maplibre-gl-worker.mjs');
const target = path.join(process.cwd(), 'public', 'maplibre', 'maplibre-gl-worker.mjs');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.copyFileSync(source, target);

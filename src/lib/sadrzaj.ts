/** Читање Markdown садржаја (лекције, молитве) при прављењу сајта. */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

export interface Pitanje { pitanje: string; odgovori: string[]; tacan: number }
export interface Lekcija { slug: string; redniBroj: number; naslov: string; podnaslov: string; trajanje: number; pitanja: Pitanje[]; html: string }
export type GrupaMolitve = 'svakodnevne' | 'akatisti' | 'kanoni' | 'ostale';
export interface Molitva { slug: string; naslov: string; red: number; grupa: GrupaMolitve; pravila: Record<string, number>; html: string }

/** Молитвена правила: молитве које се читају редом, једна за другом. */
export const PRAVILA = {
  jutarnje: { naziv: 'Јутарње правило', opis: 'Молитве по устајању' },
  vecernje: { naziv: 'Вечерње правило', opis: 'Молитве пред спавање' },
} as const;
export type IdPravila = keyof typeof PRAVILA;

function citaj<T>(folder: string, pretvori: (slug: string, podaci: Record<string, unknown>, html: string) => T): T[] {
  const dir = path.join(process.cwd(), 'content', folder);
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), 'utf8'));
      return pretvori(f.replace(/^\d+-/, '').replace(/\.md$/, ''), data, marked.parse(content, { async: false }));
    });
}

export function lekcije(): Lekcija[] {
  return citaj('lekcije', (slug, d, html) => ({
    slug,
    redniBroj: Number(d.redniBroj),
    naslov: String(d.naslov),
    podnaslov: String(d.podnaslov ?? ''),
    trajanje: Number(d.trajanje ?? 5),
    pitanja: (d.pitanja as Pitanje[] | undefined) ?? [],
    html,
  })).sort((a, b) => a.redniBroj - b.redniBroj);
}

export function molitve(): Molitva[] {
  return citaj('molitve', (slug, d, html) => ({
    slug,
    naslov: String(d.naslov),
    red: Number(d.red ?? 99),
    grupa: (String(d.grupa ?? 'ostale') as GrupaMolitve),
    pravila: (d.pravila as Record<string, number> | undefined) ?? {},
    html,
  })).sort((a, b) => a.red - b.red);
}

export function molitvePravila(id: IdPravila): Molitva[] {
  return molitve()
    .filter((m) => m.pravila[id] !== undefined)
    .sort((a, b) => a.pravila[id]! - b.pravila[id]!);
}

export interface SadrzajPraznika { id: string; kratko: string; html: string }

/** Текстови значајних празника (content/praznici/<id>.md), кључ је id из praznici.json. */
export function sadrzajPraznika(): Record<string, SadrzajPraznika> {
  const dir = path.join(process.cwd(), 'content', 'praznici');
  return Object.fromEntries(
    fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => {
        const id = f.replace(/\.md$/, '');
        const { data, content } = matter(fs.readFileSync(path.join(dir, f), 'utf8'));
        return [id, { id, kratko: String(data.kratko ?? ''), html: marked.parse(content, { async: false }) }];
      }),
  );
}

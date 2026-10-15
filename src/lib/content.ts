/** Reads Markdown content (lessons, prayers) at build time. */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

export interface QuizQuestion { question: string; answers: string[]; correct: number }
export interface Lesson { slug: string; order: number; title: string; subtitle: string; minutes: number; questions: QuizQuestion[]; html: string }
export type PrayerGroup = 'svakodnevne' | 'akatisti' | 'kanoni' | 'ostale';
export interface Prayer { slug: string; title: string; order: number; group: PrayerGroup; rules: Record<string, number>; html: string }

/** Prayer rules: prayers read in order, one after another. */
export const PRAYER_RULES = {
  jutarnje: { name: 'Јутарње правило', description: 'Молитве по устајању' },
  vecernje: { name: 'Вечерње правило', description: 'Молитве пред спавање' },
} as const;
export type PrayerRuleId = keyof typeof PRAYER_RULES;

function readFolder<T>(folder: string, convert: (slug: string, data: Record<string, unknown>, html: string) => T): T[] {
  const dir = path.join(process.cwd(), 'content', folder);
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), 'utf8'));
      return convert(f.replace(/^\d+-/, '').replace(/\.md$/, ''), data, marked.parse(content, { async: false }));
    });
}

export function lessons(): Lesson[] {
  return readFolder('lessons', (slug, d, html) => ({
    slug,
    order: Number(d.order),
    title: String(d.title),
    subtitle: String(d.subtitle ?? ''),
    minutes: Number(d.minutes ?? 5),
    questions: (d.questions as QuizQuestion[] | undefined) ?? [],
    html,
  })).sort((a, b) => a.order - b.order);
}

export function prayers(): Prayer[] {
  return readFolder('prayers', (slug, d, html) => ({
    slug,
    title: String(d.title),
    order: Number(d.order ?? 99),
    group: (String(d.group ?? 'ostale') as PrayerGroup),
    rules: (d.rules as Record<string, number> | undefined) ?? {},
    html,
  })).sort((a, b) => a.order - b.order);
}

export function prayersOfRule(id: PrayerRuleId): Prayer[] {
  return prayers()
    .filter((m) => m.rules[id] !== undefined)
    .sort((a, b) => a.rules[id]! - b.rules[id]!);
}

export interface FeastContent { id: string; summary: string; html: string }

/** Texts of major feasts (content/feasts/<id>.md), keyed by the id from feasts.json. */
export function feastContent(): Record<string, FeastContent> {
  const dir = path.join(process.cwd(), 'content', 'feasts');
  return Object.fromEntries(
    fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => {
        const id = f.replace(/\.md$/, '');
        const { data, content } = matter(fs.readFileSync(path.join(dir, f), 'utf8'));
        return [id, { id, summary: String(data.summary ?? ''), html: marked.parse(content, { async: false }) }];
      }),
  );
}

import podaci from '@/data/slike.json';

export interface Slika {
  putanja: string; // нпр. /slike/praznici/bozic.jpg
  sirina: number;
  visina: number;
  opis: string;
  autor: string;
  licenca: string;
  licencaUrl?: string;
  stranica: string; // страница фајла на Wikimedia Commons
}

const slike = (podaci as { slike: Record<string, Slika> }).slike;

export function slikaPraznika(id: string): Slika | null {
  return slike[id] ?? null;
}

export function sveSlike(): Record<string, Slika> {
  return slike;
}

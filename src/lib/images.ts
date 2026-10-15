import data from '@/data/images.json';

export interface FeastImageInfo {
  path: string; // e.g. /slike/praznici/bozic.jpg
  width: number;
  height: number;
  description: string;
  author: string;
  license: string;
  licenseUrl?: string;
  page: string; // file page on Wikimedia Commons
}

const images = (data as { images: Record<string, FeastImageInfo> }).images;

export function feastImage(id: string): FeastImageInfo | null {
  return images[id] ?? null;
}

export function allImages(): Record<string, FeastImageInfo> {
  return images;
}

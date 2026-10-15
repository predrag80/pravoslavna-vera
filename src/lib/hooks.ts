'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { today, utc } from './calendar';
import { savedScript, type Script } from './script-client';
import { savedJourney, type Journey } from './journey';

const noSubscription = () => () => {};

/**
 * Today's date, known only in the browser (the site is built ahead of time).
 * Returns `null` on the server, so a component first shows the data from the build day.
 */
export function useToday(): Date | null {
  const key = useSyncExternalStore(noSubscription, () => today().toISOString().slice(0, 10), () => null);
  return useMemo(() => {
    if (!key) return null;
    const [y, m, d] = key.split('-').map(Number);
    return utc(y!, m!, d!);
  }, [key]);
}

function subscribeToScript(notify: () => void) {
  window.addEventListener('script', notify);
  window.addEventListener('storage', notify);
  return () => {
    window.removeEventListener('script', notify);
    window.removeEventListener('storage', notify);
  };
}

export function useScript(): Script {
  return useSyncExternalStore(subscribeToScript, savedScript, () => 'cyrillic');
}

function subscribeToJourney(notify: () => void) {
  window.addEventListener('journey', notify);
  window.addEventListener('storage', notify);
  return () => {
    window.removeEventListener('journey', notify);
    window.removeEventListener('storage', notify);
  };
}

/**
 * `undefined` while the page renders on the server (the choice is not known yet),
 * `null` when the user has not picked a journey yet, otherwise the picked journey.
 */
export function useJourney(): Journey | null | undefined {
  return useSyncExternalStore(subscribeToJourney, savedJourney, () => undefined);
}


/** Reading settings (font size, night mode), shared by the prayer book and the Holy Scripture. */
export interface ReadingSettings { fontSize: number; night: boolean }
const DEFAULT_SETTINGS: ReadingSettings = { fontSize: 20, night: false };
let lastSettingsRaw = '';
let lastSettingsValue = DEFAULT_SETTINGS;

function readSettings(): ReadingSettings {
  let raw = '';
  try {
    raw = localStorage.getItem('reading-settings') ?? '';
  } catch {
    /* no saved settings */
  }
  if (raw !== lastSettingsRaw) {
    lastSettingsRaw = raw;
    try {
      lastSettingsValue = { ...DEFAULT_SETTINGS, ...(raw ? (JSON.parse(raw) as Partial<ReadingSettings>) : {}) };
    } catch {
      lastSettingsValue = DEFAULT_SETTINGS;
    }
  }
  return lastSettingsValue;
}

function subscribeToReadingSettings(notify: () => void) {
  window.addEventListener('reading-settings', notify);
  window.addEventListener('storage', notify);
  return () => {
    window.removeEventListener('reading-settings', notify);
    window.removeEventListener('storage', notify);
  };
}

export function useReadingSettings(): [ReadingSettings, (p: Partial<ReadingSettings>) => void] {
  const s = useSyncExternalStore(subscribeToReadingSettings, readSettings, () => DEFAULT_SETTINGS);
  const update = (change: Partial<ReadingSettings>) => {
    const next = { ...readSettings(), ...change };
    next.fontSize = Math.min(32, Math.max(16, next.fontSize));
    try {
      localStorage.setItem('reading-settings', JSON.stringify(next));
    } catch {
      /* private mode */
    }
    window.dispatchEvent(new Event('reading-settings'));
  };
  return [s, update];
}

/** The chosen family slava (id from slavas.json), stored on the device. */
function readSlava(): string | null {
  try {
    return localStorage.getItem('slava');
  } catch {
    return null;
  }
}

function subscribeToSlava(notify: () => void) {
  window.addEventListener('slava', notify);
  window.addEventListener('storage', notify);
  return () => {
    window.removeEventListener('slava', notify);
    window.removeEventListener('storage', notify);
  };
}

export function useSlava(): [string | null, (id: string | null) => void] {
  const id = useSyncExternalStore(subscribeToSlava, readSlava, () => null);
  const set = (next: string | null) => {
    try {
      if (next) localStorage.setItem('slava', next);
      else localStorage.removeItem('slava');
    } catch {
      /* private mode */
    }
    window.dispatchEvent(new Event('slava'));
  };
  return [id, set];
}

/** Progress in reading plans: start date and days read, per plan. Stored on the device. */
export interface PlanProgress { start: string; read: number[] }
type ProgressMap = Record<string, PlanProgress>;
let plansRaw = '';
let plansValue: ProgressMap = {};

function readPlans(): ProgressMap {
  let raw = '';
  try {
    raw = localStorage.getItem('reading-plans') ?? '';
  } catch {
    /* no saved progress */
  }
  if (raw !== plansRaw) {
    plansRaw = raw;
    try {
      plansValue = raw ? (JSON.parse(raw) as ProgressMap) : {};
    } catch {
      plansValue = {};
    }
  }
  return plansValue;
}

const emptyProgress: ProgressMap = {};
function subscribeToPlans(notify: () => void) {
  window.addEventListener('reading-plans', notify);
  window.addEventListener('storage', notify);
  return () => {
    window.removeEventListener('reading-plans', notify);
    window.removeEventListener('storage', notify);
  };
}

export function usePlanProgress(): [ProgressMap, (id: string, change: PlanProgress | null) => void] {
  const n = useSyncExternalStore(subscribeToPlans, readPlans, () => emptyProgress);
  const update = (id: string, change: PlanProgress | null) => {
    const next = { ...readPlans() };
    if (change) next[id] = change;
    else delete next[id];
    try {
      localStorage.setItem('reading-plans', JSON.stringify(next));
    } catch {
      /* private mode */
    }
    window.dispatchEvent(new Event('reading-plans'));
  };
  return [n, update];
}

/** Pilgrimage: list of shrine ids in visiting order. Stored on the device. */
let pilgrimageRaw = '';
let pilgrimageValue: string[] = [];

function readPilgrimage(): string[] {
  let raw = '';
  try {
    raw = localStorage.getItem('pilgrimage') ?? '';
  } catch {
    /* no saved pilgrimage */
  }
  if (raw !== pilgrimageRaw) {
    pilgrimageRaw = raw;
    try {
      const v: unknown = raw ? JSON.parse(raw) : [];
      pilgrimageValue = Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      pilgrimageValue = [];
    }
  }
  return pilgrimageValue;
}

const emptyPilgrimage: string[] = [];
function subscribeToPilgrimage(notify: () => void) {
  window.addEventListener('pilgrimage', notify);
  window.addEventListener('storage', notify);
  return () => {
    window.removeEventListener('pilgrimage', notify);
    window.removeEventListener('storage', notify);
  };
}

export function usePilgrimage(): [string[], (ids: string[]) => void] {
  const ids = useSyncExternalStore(subscribeToPilgrimage, readPilgrimage, () => emptyPilgrimage);
  const set = (next: string[]) => {
    try {
      localStorage.setItem('pilgrimage', JSON.stringify(next));
    } catch {
      /* private mode */
    }
    window.dispatchEvent(new Event('pilgrimage'));
  };
  return [ids, set];
}

/** Highlighted verses: key "book:chapter:verse", color and the text at the time of highlighting. Stored on the device. */
export type HighlightColor = 'gold' | 'rose' | 'blue';
export interface Highlight { color: HighlightColor; text: string; time: number }
export type Highlights = Record<string, Highlight>;
let highlightsRaw = '';
let highlightsValue: Highlights = {};

function readHighlights(): Highlights {
  let raw = '';
  try {
    raw = localStorage.getItem('highlights') ?? '';
  } catch {
    /* no saved highlights */
  }
  if (raw !== highlightsRaw) {
    highlightsRaw = raw;
    try {
      highlightsValue = raw ? (JSON.parse(raw) as Highlights) : {};
    } catch {
      highlightsValue = {};
    }
  }
  return highlightsValue;
}

const emptyHighlights: Highlights = {};
function subscribeToHighlights(notify: () => void) {
  window.addEventListener('highlights', notify);
  window.addEventListener('storage', notify);
  return () => {
    window.removeEventListener('highlights', notify);
    window.removeEventListener('storage', notify);
  };
}

export function useHighlights(): [Highlights, (changes: Record<string, Omit<Highlight, 'time'> | null>) => void] {
  const h = useSyncExternalStore(subscribeToHighlights, readHighlights, () => emptyHighlights);
  const update = (changes: Record<string, Omit<Highlight, 'time'> | null>) => {
    const next = { ...readHighlights() };
    const time = Date.now();
    for (const [k, v] of Object.entries(changes)) {
      if (v) next[k] = { ...v, time };
      else delete next[k];
    }
    try {
      localStorage.setItem('highlights', JSON.stringify(next));
    } catch {
      /* private mode */
    }
    window.dispatchEvent(new Event('highlights'));
  };
  return [h, update];
}

'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { danas, utc } from './kalendar';
import { sacuvanoPismo, type Pismo } from './pismo-klijent';
import { sacuvaniPut, type Put } from './put';

const bezPromena = () => () => {};

/**
 * Данашњи дан, познат тек у прегледачу (сајт се прави унапред).
 * На серверу враћа `null`, па компонента прво приказује податке из дана прављења сајта.
 */
export function useDanas(): Date | null {
  const kljuc = useSyncExternalStore(bezPromena, () => danas().toISOString().slice(0, 10), () => null);
  return useMemo(() => {
    if (!kljuc) return null;
    const [g, m, d] = kljuc.split('-').map(Number);
    return utc(g!, m!, d!);
  }, [kljuc]);
}

function pretplataNaPismo(obavesti: () => void) {
  window.addEventListener('pismo', obavesti);
  window.addEventListener('storage', obavesti);
  return () => {
    window.removeEventListener('pismo', obavesti);
    window.removeEventListener('storage', obavesti);
  };
}

export function usePismo(): Pismo {
  return useSyncExternalStore(pretplataNaPismo, sacuvanoPismo, () => 'cir');
}

function pretplataNaPut(obavesti: () => void) {
  window.addEventListener('put', obavesti);
  window.addEventListener('storage', obavesti);
  return () => {
    window.removeEventListener('put', obavesti);
    window.removeEventListener('storage', obavesti);
  };
}

/**
 * `undefined` док се страна приказује на серверу (избор још није познат),
 * `null` када корисник још није изабрао пут, иначе изабрани пут.
 */
export function usePut(): Put | null | undefined {
  return useSyncExternalStore(pretplataNaPut, sacuvaniPut, () => undefined);
}


/** Подешавања читања (величина слова, ноћни режим), заједничка за молитвеник и Свето писмо. */
export interface PodesavanjaCitanja { velicina: number; nocni: boolean }
const PODRAZUMEVANO: PodesavanjaCitanja = { velicina: 20, nocni: false };
let poslednjiZapis = '';
let poslednjaVrednost = PODRAZUMEVANO;

function procitajPodesavanja(): PodesavanjaCitanja {
  let zapis = '';
  try {
    zapis = localStorage.getItem('citanje') ?? '';
  } catch {
    /* без сачуваних подешавања */
  }
  if (zapis !== poslednjiZapis) {
    poslednjiZapis = zapis;
    try {
      poslednjaVrednost = { ...PODRAZUMEVANO, ...(zapis ? (JSON.parse(zapis) as Partial<PodesavanjaCitanja>) : {}) };
    } catch {
      poslednjaVrednost = PODRAZUMEVANO;
    }
  }
  return poslednjaVrednost;
}

function pretplataNaCitanje(obavesti: () => void) {
  window.addEventListener('citanje', obavesti);
  window.addEventListener('storage', obavesti);
  return () => {
    window.removeEventListener('citanje', obavesti);
    window.removeEventListener('storage', obavesti);
  };
}

export function usePodesavanjaCitanja(): [PodesavanjaCitanja, (p: Partial<PodesavanjaCitanja>) => void] {
  const p = useSyncExternalStore(pretplataNaCitanje, procitajPodesavanja, () => PODRAZUMEVANO);
  const promeni = (izmena: Partial<PodesavanjaCitanja>) => {
    const novo = { ...procitajPodesavanja(), ...izmena };
    novo.velicina = Math.min(32, Math.max(16, novo.velicina));
    try {
      localStorage.setItem('citanje', JSON.stringify(novo));
    } catch {
      /* приватни режим */
    }
    window.dispatchEvent(new Event('citanje'));
  };
  return [p, promeni];
}

/** Изабрана крсна слава (id из slave.json), чува се на уређају. */
function procitajSlavu(): string | null {
  try {
    return localStorage.getItem('slava');
  } catch {
    return null;
  }
}

function pretplataNaSlavu(obavesti: () => void) {
  window.addEventListener('slava', obavesti);
  window.addEventListener('storage', obavesti);
  return () => {
    window.removeEventListener('slava', obavesti);
    window.removeEventListener('storage', obavesti);
  };
}

export function useSlava(): [string | null, (id: string | null) => void] {
  const id = useSyncExternalStore(pretplataNaSlavu, procitajSlavu, () => null);
  const postavi = (novo: string | null) => {
    try {
      if (novo) localStorage.setItem('slava', novo);
      else localStorage.removeItem('slava');
    } catch {
      /* приватни режим */
    }
    window.dispatchEvent(new Event('slava'));
  };
  return [id, postavi];
}

/** Напредак у плановима читања: почетак и прочитани дани, по плану. Чува се на уређају. */
export interface NapredakPlana { pocetak: string; procitano: number[] }
type Napredak = Record<string, NapredakPlana>;
let zapisPlanova = '';
let vrednostPlanova: Napredak = {};

function procitajPlanove(): Napredak {
  let zapis = '';
  try {
    zapis = localStorage.getItem('planovi') ?? '';
  } catch {
    /* без сачуваног напретка */
  }
  if (zapis !== zapisPlanova) {
    zapisPlanova = zapis;
    try {
      vrednostPlanova = zapis ? (JSON.parse(zapis) as Napredak) : {};
    } catch {
      vrednostPlanova = {};
    }
  }
  return vrednostPlanova;
}

const prazno: Napredak = {};
function pretplataNaPlanove(obavesti: () => void) {
  window.addEventListener('planovi', obavesti);
  window.addEventListener('storage', obavesti);
  return () => {
    window.removeEventListener('planovi', obavesti);
    window.removeEventListener('storage', obavesti);
  };
}

export function usePlanovi(): [Napredak, (id: string, izmena: NapredakPlana | null) => void] {
  const n = useSyncExternalStore(pretplataNaPlanove, procitajPlanove, () => prazno);
  const promeni = (id: string, izmena: NapredakPlana | null) => {
    const novo = { ...procitajPlanove() };
    if (izmena) novo[id] = izmena;
    else delete novo[id];
    try {
      localStorage.setItem('planovi', JSON.stringify(novo));
    } catch {
      /* приватни режим */
    }
    window.dispatchEvent(new Event('planovi'));
  };
  return [n, promeni];
}

/** Ходочашће: списак светиња (id) редом обиласка. Чува се на уређају. */
let zapisHodocasca = '';
let vrednostHodocasca: string[] = [];

function procitajHodocasce(): string[] {
  let zapis = '';
  try {
    zapis = localStorage.getItem('hodocasce') ?? '';
  } catch {
    /* без сачуваног ходочашћа */
  }
  if (zapis !== zapisHodocasca) {
    zapisHodocasca = zapis;
    try {
      const v: unknown = zapis ? JSON.parse(zapis) : [];
      vrednostHodocasca = Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      vrednostHodocasca = [];
    }
  }
  return vrednostHodocasca;
}

const praznoHodocasce: string[] = [];
function pretplataNaHodocasce(obavesti: () => void) {
  window.addEventListener('hodocasce', obavesti);
  window.addEventListener('storage', obavesti);
  return () => {
    window.removeEventListener('hodocasce', obavesti);
    window.removeEventListener('storage', obavesti);
  };
}

export function useHodocasce(): [string[], (ids: string[]) => void] {
  const ids = useSyncExternalStore(pretplataNaHodocasce, procitajHodocasce, () => praznoHodocasce);
  const postavi = (nove: string[]) => {
    try {
      localStorage.setItem('hodocasce', JSON.stringify(nove));
    } catch {
      /* приватни режим */
    }
    window.dispatchEvent(new Event('hodocasce'));
  };
  return [ids, postavi];
}

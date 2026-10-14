/**
 * Ћирилица/латиница у прегледачу.
 * Садржај је на ћирилици; када корисник изабере латиницу, текст странице се пресловљава
 * након што React заврши приказ, а MutationObserver прати и делове који се касније мењају
 * (нова страница при навигацији, мапа, Данас…). Елементи са `data-bez-preslovljavanja` се прескачу.
 */
import { uLatinicu } from './preslovljavanje';

const KLJUC = 'pismo';
const CIRILICA = /[Ѐ-ӿ]/;
const PRESKOCI = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE']);
const ATRIBUTI = ['aria-label', 'placeholder', 'title', 'alt'];

export type Pismo = 'cir' | 'lat';

export function sacuvanoPismo(): Pismo {
  try {
    return localStorage.getItem(KLJUC) === 'lat' ? 'lat' : 'cir';
  } catch {
    return 'cir';
  }
}

function zasticen(n: Node): boolean {
  const el = n.nodeType === Node.ELEMENT_NODE ? (n as Element) : n.parentElement;
  return !el || PRESKOCI.has(el.tagName) || !!el.closest('[data-bez-preslovljavanja]');
}

function preslovi(koren: Node) {
  if (koren.nodeType === Node.TEXT_NODE) {
    if (!zasticen(koren) && koren.nodeValue && CIRILICA.test(koren.nodeValue)) koren.nodeValue = uLatinicu(koren.nodeValue);
    return;
  }
  if (koren.nodeType !== Node.ELEMENT_NODE || zasticen(koren)) return;
  const setac = document.createTreeWalker(koren, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode: (n) => (zasticen(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  let cvor: Node | null = koren;
  while (cvor) {
    if (cvor.nodeType === Node.ELEMENT_NODE) {
      const el = cvor as Element;
      for (const a of ATRIBUTI) {
        const v = el.getAttribute(a);
        if (v && CIRILICA.test(v)) el.setAttribute(a, uLatinicu(v));
      }
    } else if (cvor.nodeValue && CIRILICA.test(cvor.nodeValue)) {
      cvor.nodeValue = uLatinicu(cvor.nodeValue);
    }
    cvor = setac.nextNode();
  }
}

let posmatrac: MutationObserver | null = null;

function posmatraj() {
  if (posmatrac) return;
  posmatrac = new MutationObserver((promene) => {
    for (const p of promene) {
      if (p.type === 'characterData') preslovi(p.target);
      else if (p.type === 'childList') p.addedNodes.forEach(preslovi);
      else if (p.type === 'attributes' && p.attributeName && !zasticen(p.target)) {
        const el = p.target as Element;
        const v = el.getAttribute(p.attributeName);
        if (v && CIRILICA.test(v)) el.setAttribute(p.attributeName, uLatinicu(v));
      }
    }
  });
  posmatrac.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATRIBUTI });
}

/** Позива се једном, по учитавању апликације. */
export function primeniSacuvanoPismo() {
  const pismo = sacuvanoPismo();
  document.documentElement.lang = pismo === 'lat' ? 'sr-Latn' : 'sr-Cyrl';
  if (pismo === 'lat') {
    preslovi(document.body);
    posmatraj();
  }
}

export function promeniPismo(novo: Pismo) {
  try {
    localStorage.setItem(KLJUC, novo);
  } catch {
    /* приватни режим: избор важи до освежавања странице */
  }
  if (novo === 'lat') {
    document.documentElement.lang = 'sr-Latn';
    preslovi(document.body);
    posmatraj();
    window.dispatchEvent(new Event('pismo'));
  } else {
    // Повратак на ћирилицу: најпоузданије је поново приказати страницу из изворног текста.
    location.reload();
  }
}

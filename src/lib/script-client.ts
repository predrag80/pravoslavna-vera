/**
 * Cyrillic/Latin script in the browser.
 * Content is in Cyrillic; when the user picks Latin, the page text is transliterated
 * after React finishes rendering, and a MutationObserver also tracks parts that change later
 * (a new page on navigation, the map, Today…). Elements with `data-no-transliterate` are skipped.
 */
import { toLatin } from './transliteration';

const STORAGE_KEY = 'script';
const CYRILLIC = /[Ѐ-ӿ]/;
const SKIPPED_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE']);
const ATTRIBUTES = ['aria-label', 'placeholder', 'title', 'alt'];

export type Script = 'cyrillic' | 'latin';

export function savedScript(): Script {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'latin' ? 'latin' : 'cyrillic';
  } catch {
    return 'cyrillic';
  }
}

function isProtected(n: Node): boolean {
  const el = n.nodeType === Node.ELEMENT_NODE ? (n as Element) : n.parentElement;
  return !el || SKIPPED_TAGS.has(el.tagName) || !!el.closest('[data-no-transliterate]');
}

function transliterate(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    if (!isProtected(root) && root.nodeValue && CYRILLIC.test(root.nodeValue)) root.nodeValue = toLatin(root.nodeValue);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE || isProtected(root)) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode: (n) => (isProtected(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  let node: Node | null = root;
  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      for (const a of ATTRIBUTES) {
        const v = el.getAttribute(a);
        if (v && CYRILLIC.test(v)) el.setAttribute(a, toLatin(v));
      }
    } else if (node.nodeValue && CYRILLIC.test(node.nodeValue)) {
      node.nodeValue = toLatin(node.nodeValue);
    }
    node = walker.nextNode();
  }
}

let observer: MutationObserver | null = null;

function observe() {
  if (observer) return;
  observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'characterData') transliterate(m.target);
      else if (m.type === 'childList') m.addedNodes.forEach(transliterate);
      else if (m.type === 'attributes' && m.attributeName && !isProtected(m.target)) {
        const el = m.target as Element;
        const v = el.getAttribute(m.attributeName);
        if (v && CYRILLIC.test(v)) el.setAttribute(m.attributeName, toLatin(v));
      }
    }
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRIBUTES });
}

/** Called once, when the app loads. */
export function applySavedScript() {
  const script = savedScript();
  document.documentElement.lang = script === 'latin' ? 'sr-Latn' : 'sr-Cyrl';
  if (script === 'latin') {
    transliterate(document.body);
    observe();
  }
}

export function setScript(next: Script) {
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* private mode: the choice lasts until the page is reloaded */
  }
  if (next === 'latin') {
    document.documentElement.lang = 'sr-Latn';
    transliterate(document.body);
    observe();
    window.dispatchEvent(new Event('script'));
  } else {
    // Back to Cyrillic: the most reliable way is to render the page again from the source text.
    location.reload();
  }
}

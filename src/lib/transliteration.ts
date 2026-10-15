/** Cyrillic → Latin (Serbian alphabet). Content is stored in Cyrillic; Latin is produced by transliteration. */
const MAP: Record<string, string> = {
  А: 'A', Б: 'B', В: 'V', Г: 'G', Д: 'D', Ђ: 'Đ', Е: 'E', Ж: 'Ž', З: 'Z', И: 'I', Ј: 'J', К: 'K', Л: 'L', Љ: 'Lj',
  М: 'M', Н: 'N', Њ: 'Nj', О: 'O', П: 'P', Р: 'R', С: 'S', Т: 'T', Ћ: 'Ć', У: 'U', Ф: 'F', Х: 'H', Ц: 'C', Ч: 'Č',
  Џ: 'Dž', Ш: 'Š',
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ђ: 'đ', е: 'e', ж: 'ž', з: 'z', и: 'i', ј: 'j', к: 'k', л: 'l', љ: 'lj',
  м: 'm', н: 'n', њ: 'nj', о: 'o', п: 'p', р: 'r', с: 's', т: 't', ћ: 'ć', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'č',
  џ: 'dž', ш: 'š',
};
const DIGRAPH = /[ЉЊЏ](?=[А-ЯЂЈЉЊЋЏ])/g;

export function toLatin(text: string): string {
  // „ЉУБОСТИЊА“ → „LJUBOSTINJA“, while „Љубостиња“ → „Ljubostinja“.
  const normalized = text.replace(DIGRAPH, (s) => ({ Љ: 'LJ', Њ: 'NJ', Џ: 'DŽ' })[s] ?? s);
  let output = '';
  for (const ch of normalized) output += MAP[ch] ?? ch;
  return output;
}

const TO_CYRILLIC: [string, string][] = [
  ['Lj', 'Љ'], ['LJ', 'Љ'], ['lj', 'љ'], ['Nj', 'Њ'], ['NJ', 'Њ'], ['nj', 'њ'], ['Dž', 'Џ'], ['DŽ', 'Џ'], ['dž', 'џ'],
  ['A', 'А'], ['B', 'Б'], ['V', 'В'], ['G', 'Г'], ['D', 'Д'], ['Đ', 'Ђ'], ['E', 'Е'], ['Ž', 'Ж'], ['Z', 'З'], ['I', 'И'],
  ['J', 'Ј'], ['K', 'К'], ['L', 'Л'], ['M', 'М'], ['N', 'Н'], ['O', 'О'], ['P', 'П'], ['R', 'Р'], ['S', 'С'], ['T', 'Т'],
  ['Ć', 'Ћ'], ['U', 'У'], ['F', 'Ф'], ['H', 'Х'], ['C', 'Ц'], ['Č', 'Ч'], ['Š', 'Ш'],
  ['a', 'а'], ['b', 'б'], ['v', 'в'], ['g', 'г'], ['d', 'д'], ['đ', 'ђ'], ['e', 'е'], ['ž', 'ж'], ['z', 'з'], ['i', 'и'],
  ['j', 'ј'], ['k', 'к'], ['l', 'л'], ['m', 'м'], ['n', 'н'], ['o', 'о'], ['p', 'п'], ['r', 'р'], ['s', 'с'], ['t', 'т'],
  ['ć', 'ћ'], ['u', 'у'], ['f', 'ф'], ['h', 'х'], ['c', 'ц'], ['č', 'ч'], ['š', 'ш'],
];

/**
 * Latin → Cyrillic (e.g. for a search query typed in Latin).
 * Digraphs (lj, nj, dž) are always joined; rare exceptions (e.g. „nadživeti“) need manual checking.
 */
export function toCyrillic(text: string): string {
  let output = '';
  let i = 0;
  while (i < text.length) {
    const two = text.slice(i, i + 2);
    const pair = TO_CYRILLIC.find(([l]) => l.length === 2 && l === two);
    if (pair) {
      output += pair[1];
      i += 2;
      continue;
    }
    const single = TO_CYRILLIC.find(([l]) => l === text[i]);
    output += single ? single[1] : text[i];
    i += 1;
  }
  return output;
}

/**
 * The Psalter in services uses Septuagint (LXX) numbering, while the Daničić translation uses the Hebrew one.
 * E.g. the penitential psalm is 50 in the LXX and 51 in Daničić.
 */
export function lxxToHebrew(n: number): number {
  if (n <= 9) return n;
  if (n <= 112) return n + 1;
  if (n === 113) return 114;
  if (n <= 115) return 116;
  if (n <= 145) return n + 1;
  if (n <= 147) return 147;
  return n;
}

/** The twenty kathismas, in LXX numbering. */
export const KATHISMAS: [number, number][] = [
  [1, 8], [9, 16], [17, 23], [24, 31], [32, 36], [37, 45], [46, 54], [55, 63], [64, 69], [70, 76],
  [77, 84], [85, 90], [91, 100], [101, 104], [105, 108], [109, 117], [118, 118], [119, 133], [134, 142], [143, 150],
];

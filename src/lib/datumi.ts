export const MESECI = ['јануар', 'фебруар', 'март', 'април', 'мај', 'јун', 'јул', 'август', 'септембар', 'октобар', 'новембар', 'децембар'];
export const MESECI_KRATKO = ['јан', 'феб', 'мар', 'апр', 'мај', 'јун', 'јул', 'авг', 'сеп', 'окт', 'нов', 'дец'];
export const DANI = ['Недеља', 'Понедељак', 'Уторак', 'Среда', 'Четвртак', 'Петак', 'Субота'];

export function datumDugi(d: Date): string {
  return `${DANI[d.getUTCDay()]}, ${d.getUTCDate()}. ${MESECI[d.getUTCMonth()]} ${d.getUTCFullYear()}.`;
}

export function zaDana(n: number): string {
  if (n === 0) return 'данас';
  if (n === 1) return 'сутра';
  const m10 = n % 10, m100 = n % 100;
  return `за ${n} ${m10 === 1 && m100 !== 11 ? 'дан' : 'дана'}`;
}

export const MONTHS = ['јануар', 'фебруар', 'март', 'април', 'мај', 'јун', 'јул', 'август', 'септембар', 'октобар', 'новембар', 'децембар'];
export const MONTHS_SHORT = ['јан', 'феб', 'мар', 'апр', 'мај', 'јун', 'јул', 'авг', 'сеп', 'окт', 'нов', 'дец'];
export const WEEKDAYS = ['Недеља', 'Понедељак', 'Уторак', 'Среда', 'Четвртак', 'Петак', 'Субота'];

export function longDate(d: Date): string {
  return `${WEEKDAYS[d.getUTCDay()]}, ${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}.`;
}

export function inDays(n: number): string {
  if (n === 0) return 'данас';
  if (n === 1) return 'сутра';
  const m10 = n % 10, m100 = n % 100;
  return `за ${n} ${m10 === 1 && m100 !== 11 ? 'дан' : 'дана'}`;
}

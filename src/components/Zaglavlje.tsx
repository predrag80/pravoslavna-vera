import Link from 'next/link';
import IzborPisma from './IzborPisma';

interface Props {
  naslov: string;
  podnaslov?: string;
  natpis?: string;
  nazad?: { href: string; tekst: string };
}

/** Стандардно заглавље стране: повратак или натпис, избор писма, наслов. */
export default function Zaglavlje({ naslov, podnaslov, natpis, nazad }: Props) {
  return (
    <header className="omot zaglavlje-strane">
      <div className="gornji-red">
        {nazad ? (
          <Link className="nazad" href={nazad.href}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" />
            </svg>
            {nazad.tekst}
          </Link>
        ) : natpis ? (
          <span className="natpis">{natpis}</span>
        ) : (
          <span />
        )}
        <IzborPisma />
      </div>
      <h1>{naslov}</h1>
      {podnaslov && <p className="prigusen">{podnaslov}</p>}
    </header>
  );
}

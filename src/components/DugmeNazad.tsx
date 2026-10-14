'use client';

import { useRouter } from 'next/navigation';

/** Враћа на претходну страну; ако је ово прва страна у прозору, води на Данас. */
export default function DugmeNazad({ tekst = 'Назад', samoIkona = false, className = 'nazad' }: { tekst?: string; samoIkona?: boolean; className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      aria-label={samoIkona ? tekst : undefined}
      onClick={() => (window.history.length > 1 ? router.back() : router.push('/'))}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 6l-6 6 6 6" />
      </svg>
      {!samoIkona && tekst}
    </button>
  );
}

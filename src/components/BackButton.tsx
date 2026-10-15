'use client';

import { useRouter } from 'next/navigation';

/** Goes back to the previous page; if this is the first page in the window, goes to Today. */
export default function BackButton({ text = 'Назад', iconOnly = false, className = 'back' }: { text?: string; iconOnly?: boolean; className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      aria-label={iconOnly ? text : undefined}
      onClick={() => (window.history.length > 1 ? router.back() : router.push('/'))}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 6l-6 6 6 6" />
      </svg>
      {!iconOnly && text}
    </button>
  );
}

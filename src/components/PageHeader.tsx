import Link from 'next/link';
import BackButton from './BackButton';
import ScriptToggle from './ScriptToggle';

interface Props {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  /** Explicit back target (e.g. from a chapter to its book); without it the button returns to the previous page. */
  back?: { href: string; text: string };
}

/** Standard page header: back button, script toggle, eyebrow and title. */
export default function PageHeader({ title, subtitle, eyebrow, back }: Props) {
  return (
    <header className="container page-header">
      <div className="top-row">
        {back ? (
          <Link className="back" href={back.href}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" />
            </svg>
            {back.text}
          </Link>
        ) : (
          <BackButton />
        )}
        <ScriptToggle />
      </div>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      {subtitle && <p className="muted">{subtitle}</p>}
    </header>
  );
}

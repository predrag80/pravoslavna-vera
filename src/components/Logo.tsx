import Link from 'next/link';

interface Props {
  /** Height in pixels; the width follows the 96:122 proportion of the mark. */
  size?: number;
  /** Stroke width in pixels, kept constant at any size so the small mark stays legible. */
  stroke?: number;
  /** Wrap the mark in a link to the home screen. */
  link?: boolean;
  className?: string;
}

/** The app mark: a church doorway (double arch) with the Orthodox cross. Drawn in the current text colour. */
export function LogoMark({ size = 40, stroke = 1.6 }: Pick<Props, 'size' | 'stroke'>) {
  return (
    <svg
      width={Math.round((size * 96) / 122)}
      height={size}
      viewBox="0 0 96 122"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <g vectorEffect="non-scaling-stroke">
        <path d="M8 120V48a40 40 0 0 1 80 0v72" vectorEffect="non-scaling-stroke" />
        <path d="M18 120V50a30 30 0 0 1 60 0v70" vectorEffect="non-scaling-stroke" />
        <path d="M48 34v62M43 41h10M37 52h22M43 84l10 4" vectorEffect="non-scaling-stroke" />
        <path d="M2 120h92" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}

/** The mark, optionally as a link to the home screen ("Почетна"). */
export default function Logo({ size = 40, stroke, link = true, className }: Props) {
  const mark = <LogoMark size={size} stroke={stroke} />;
  if (!link) return <span className={`logo ${className ?? ''}`}>{mark}</span>;
  return (
    <Link href="/" className={`logo ${className ?? ''}`} aria-label="Православље, почетна">
      {mark}
    </Link>
  );
}

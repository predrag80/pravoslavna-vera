import type { FeastImageInfo } from '@/lib/images';
import s from './FeastImage.module.css';

/**
 * Image for a major day, with description, author and license (required for Wikimedia Commons).
 * Until the image is downloaded (`npm run images`), a decorative frame is shown.
 */
export default function FeastImage({ image, name, small = false }: { image: FeastImageInfo | null; name: string; small?: boolean }) {
  if (!image) {
    return (
      <div className={`${s.frame} ${small ? s.small : ''}`} role="img" aria-label={`${name}: слика ће бити додата`}>
        <svg viewBox="0 0 96 122" width="56" height="72" fill="none" stroke="#c9a24b" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
          <path d="M8 120V48a40 40 0 0 1 80 0v72" />
          <path d="M48 34v62M43 41h10M37 52h22M43 84l10 4" />
        </svg>
      </div>
    );
  }
  return (
    <figure className={`${s.image} ${small ? s.small : ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, the image is already resized */}
      <img src={image.path} width={image.width} height={image.height} alt={image.description} loading="lazy" decoding="async" />
      <figcaption>
        {image.description}
        <span>
          {' · '}
          <a href={image.page} target="_blank" rel="noreferrer">{image.author}</a>
          {', '}
          {image.licenseUrl ? <a href={image.licenseUrl} target="_blank" rel="noreferrer">{image.license}</a> : image.license}
          {', Wikimedia Commons'}
        </span>
      </figcaption>
    </figure>
  );
}

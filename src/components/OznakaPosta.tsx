import { STEPENI, type PostDana } from '@/lib/kalendar';
import s from './OznakaPosta.module.css';

const IKONE: Record<PostDana['stepen'], React.ReactNode> = {
  mrsno: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /></>,
  'beli-mrs': <><path d="M8 3h8l-1 4v12a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V7z" /><path d="M9 11h6" /></>,
  riba: <><path d="M3 12c3-4 8-5 12-3l4-3v12l-4-3c-4 2-9 1-12-3z" /><circle cx="8" cy="11" r="0.8" /></>,
  ulje: <><path d="M12 3c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10z" /><path d="M10 14a2 2 0 0 0 2 2" /></>,
  voda: <><path d="M12 3c3 4 5 7 5 10a5 5 0 0 1-10 0c0-3 2-6 5-10z" /></>,
  uzdrzanje: <><circle cx="12" cy="12" r="8" /><path d="M6 18L18 6" /></>,
};

/** Ознака поста: степен (на води, на уљу, риба…) и разлог (Божићни пост, среда…). */
export default function OznakaPosta({ post, tamno = false, opis = false }: { post: PostDana; tamno?: boolean; opis?: boolean }) {
  const st = STEPENI[post.stepen];
  return (
    <span className={`${s.oznaka} ${s[post.stepen.replace('-', '')]} ${tamno ? s.tamno : ''}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {IKONE[post.stepen]}
      </svg>
      <span>
        <b>{st.naziv}</b>
        {post.stepen !== 'mrsno' || post.naziv !== 'Мрсни дан' ? ` · ${post.naziv}` : ''}
        {opis && <small className={s.opis}>{st.opis}</small>}
      </span>
    </span>
  );
}

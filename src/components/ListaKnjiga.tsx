import Link from 'next/link';
import { brojKnjiga, type Grupa } from '@/lib/biblija';
import s from './ListaKnjiga.module.css';

const BOJE: Record<string, string> = {
  zakon: '#6e5323', istorijske: '#2f4a3a', poucne: '#24365f', 'veliki-proroci': '#5b3f73', 'mali-proroci': '#5b3f73',
  jevandjelja: '#8e2a22', dela: '#24365f', saborne: '#2f4a3a', pavle: '#6e5323', otkrivenje: '#5b3f73',
};

export default function ListaKnjiga({ grupe }: { grupe: Grupa[] }) {
  return (
    <>
      <nav className={`red-cipova ${s.skok}`} aria-label="Делови">
        {grupe.map((g) => <a key={g.id} className="cip" href={`#${g.id}`}>{g.naziv}</a>)}
      </nav>
      {grupe.map((g) => (
        <section key={g.id} id={g.id} className={s.grupa} aria-labelledby={`n-${g.id}`}>
          <div className={s.zaglavlje}>
            <span className={s.boja} style={{ background: BOJE[g.id] ?? 'var(--svod)' }} aria-hidden="true" />
            <h2 id={`n-${g.id}`}>{g.naziv}</h2>
            <span className="prigusen">{brojKnjiga(g.knjige.length)}</span>
          </div>
          <p className={`prigusen ${s.opis}`}>{g.opis}</p>
          <div className="mreza mreza-3">
            {g.knjige.map((k) => (
              <Link key={k.id} href={`/pismo/${k.id}/`} className={s.knjiga} style={{ boxShadow: `inset 0 3px 0 ${BOJE[g.id] ?? 'var(--svod)'}` }}>
                <b>{k.kratko}</b>
                <small>{k.glava} {k.glava === 1 ? 'глава' : 'глава'}</small>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

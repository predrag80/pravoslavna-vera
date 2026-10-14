'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface Rezultat { url: string; naslov: string; izvod: string }
interface PagefindApi {
  search: (upit: string) => Promise<{ results: { data: () => Promise<{ url: string; meta: { title?: string }; excerpt: string }> }[] }>;
}

/** Статичка претрага (Pagefind): индекс се прави при `npm run build`, у развоју није доступна. */
export default function Pretraga() {
  const api = useRef<PagefindApi | null>(null);
  const [upit, setUpit] = useState('');
  const [rezultati, setRezultati] = useState<Rezultat[]>([]);
  const [dostupno, setDostupno] = useState(true);

  useEffect(() => {
    const putanja = '/pagefind/pagefind.js';
    import(/* webpackIgnore: true */ /* turbopackIgnore: true */ putanja)
      .then((m: PagefindApi) => (api.current = m))
      .catch(() => setDostupno(false));
  }, []);

  async function trazi(tekst: string) {
    setUpit(tekst);
    if (!api.current || tekst.trim().length < 2) return setRezultati([]);
    const r = await api.current.search(tekst);
    const podaci = await Promise.all(r.results.slice(0, 12).map((x) => x.data()));
    setRezultati(podaci.map((d) => ({ url: d.url, naslov: d.meta.title ?? d.url, izvod: d.excerpt })));
  }

  return (
    <>
      <label className="kartica" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', minHeight: 52, marginTop: 8 }}>
        <span className="samo-citac">Тражи</span>
        <input type="search" autoFocus value={upit} onChange={(e) => trazi(e.target.value)} placeholder="Нпр. Света Петка, Студеница, Јован 3" style={{ flex: 1, border: 'none', background: 'transparent', font: 'inherit', outline: 'none' }} />
      </label>
      {!dostupno && <p className="prigusen">Претрага ради у изграђеној верзији сајта (npm run build).</p>}
      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rezultati.map((r) => (
          <li key={r.url}>
            <Link href={r.url} className="kartica" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <b style={{ color: 'var(--svod)' }}>{r.naslov}</b>
              <p className="prigusen" style={{ margin: '4px 0 0', fontSize: 13 }} dangerouslySetInnerHTML={{ __html: r.izvod }} />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

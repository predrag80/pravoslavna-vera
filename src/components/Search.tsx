'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface Result { url: string; title: string; excerpt: string }
interface PagefindApi {
  search: (query: string) => Promise<{ results: { data: () => Promise<{ url: string; meta: { title?: string }; excerpt: string }> }[] }>;
}

/** Static search (Pagefind): the index is built during `npm run build`, so it is unavailable in development. */
export default function Search() {
  const api = useRef<PagefindApi | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const path = '/pagefind/pagefind.js';
    import(/* webpackIgnore: true */ /* turbopackIgnore: true */ path)
      .then((m: PagefindApi) => (api.current = m))
      .catch(() => setAvailable(false));
  }, []);

  async function search(text: string) {
    setQuery(text);
    if (!api.current || text.trim().length < 2) return setResults([]);
    const r = await api.current.search(text);
    const data = await Promise.all(r.results.slice(0, 12).map((x) => x.data()));
    setResults(data.map((d) => ({ url: d.url, title: d.meta.title ?? d.url, excerpt: d.excerpt })));
  }

  return (
    <>
      <label className="card" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', minHeight: 52, marginTop: 8 }}>
        <span className="sr-only">Тражи</span>
        <input type="search" autoFocus value={query} onChange={(e) => search(e.target.value)} placeholder="Нпр. Света Петка, Студеница, Јован 3" style={{ flex: 1, border: 'none', background: 'transparent', font: 'inherit', outline: 'none' }} />
      </label>
      {!available && <p className="muted">Претрага ради у изграђеној верзији сајта (npm run build).</p>}
      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {results.map((r) => (
          <li key={r.url}>
            <Link href={r.url} className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <b style={{ color: 'var(--vault)' }}>{r.title}</b>
              <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }} dangerouslySetInnerHTML={{ __html: r.excerpt }} />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

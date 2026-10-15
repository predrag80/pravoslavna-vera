'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ErrorEvent, GeoJSONSource, Map as MapGL, MapLayerMouseEvent } from 'maplibre-gl';
import BackButton from './BackButton';
import ScriptToggle from './ScriptToggle';
import { usePilgrimage } from '@/lib/hooks';
import { centuryNumber, directionsUrl, km, shorterOrder, toRoman, totalKm, type Point } from '@/lib/pilgrimage';
import s from './ShrineMap.module.css';

export interface Shrine { id: string; name: string; kind: string; lat: number; lon: number; century: string; place: string; eparchy: string; description: string; tags: string[] }
export interface Eparchy { id: string; name: string }

const STYLE = process.env.NEXT_PUBLIC_MAP_STYLE || 'https://tiles.openfreemap.org/styles/liberty';
const TAG_LABELS: Record<string, string> = { unesco: 'УНЕСКО', nemanjic: 'Немањићи' };
const KINDS = [['all', 'Све'], ['monastery', 'Манастири'], ['church', 'Храмови']] as const;
const TAG_FILTERS = [['unesco', 'УНЕСКО'], ['nemanjic', 'Задужбине Немањића']] as const;

interface Filter { kind: string; eparchy: string; century: number | null; tags: string[] }
const NO_FILTER: Filter = { kind: 'all', eparchy: '', century: null, tags: [] };
type View = 'map' | 'list' | 'filters' | 'pilgrimage';

function points(list: Shrine[]) {
  return {
    type: 'FeatureCollection' as const,
    features: list.map((x) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [x.lon, x.lat] },
      properties: { id: x.id, name: x.name, kind: x.kind },
    })),
  };
}

function route(list: Shrine[]) {
  return {
    type: 'FeatureCollection' as const,
    features: [
      ...(list.length > 1 ? [{ type: 'Feature' as const, geometry: { type: 'LineString' as const, coordinates: list.map((x) => [x.lon, x.lat]) }, properties: {} }] : []),
      ...list.map((x, i) => ({ type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [x.lon, x.lat] }, properties: { num: String(i + 1) } })),
    ],
  };
}

function me(p: Point | null) {
  return { type: 'FeatureCollection' as const, features: p ? [{ type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [p.lon, p.lat] }, properties: {} }] : [] };
}

function filterCount(f: Filter) {
  return (f.kind !== 'all' ? 1 : 0) + (f.eparchy ? 1 : 0) + (f.century !== null ? 1 : 0) + f.tags.length;
}

function applyFilter(list: Shrine[], f: Filter, query: string) {
  const q = query.trim().toLowerCase();
  return list.filter((x) =>
    (f.kind === 'all' || x.kind === f.kind) &&
    (!f.eparchy || x.eparchy === f.eparchy) &&
    (f.century === null || centuryNumber(x.century) === f.century) &&
    f.tags.every((t) => x.tags.includes(t)) &&
    (!q || x.name.toLowerCase().includes(q) || x.place.toLowerCase().includes(q)),
  );
}

export default function ShrineMap({ shrines, eparchies }: { shrines: Shrine[]; eparchies: Eparchy[] }) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapGL | null>(null);
  const [filter, setFilter] = useState<Filter>(NO_FILTER);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<View>('map');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);
  const [position, setPosition] = useState<Point | null>(null);
  const [locating, setLocating] = useState(false);
  const [positionMessage, setPositionMessage] = useState('');
  const [pilgrimageIds, setPilgrimageIds] = usePilgrimage();

  const byId = useMemo(() => new Map(shrines.map((x) => [x.id, x])), [shrines]);
  const eparchyName = useMemo(() => new Map(eparchies.map((e) => [e.id, e.name])), [eparchies]);
  const eparchiesInData = useMemo(() => eparchies.filter((e) => shrines.some((x) => x.eparchy === e.id)), [eparchies, shrines]);
  const centuries = useMemo(() => [...new Set(shrines.map((x) => centuryNumber(x.century)).filter((v): v is number => v !== null))].sort((a, b) => a - b), [shrines]);

  const visible = useMemo(() => applyFilter(shrines, filter, query), [shrines, filter, query]);
  const listed = useMemo(
    () => [...visible].sort((a, b) => (position ? km(position, a) - km(position, b) : a.name.localeCompare(b.name, 'sr'))),
    [visible, position],
  );
  const pilgrimage = useMemo(() => pilgrimageIds.map((id) => byId.get(id)).filter((x): x is Shrine => !!x), [pilgrimageIds, byId]);
  const n = filterCount(filter);

  const selected = selectedId ? (byId.get(selectedId) ?? null) : null;
  const nearby = selected
    ? shrines.filter((x) => x.id !== selected.id).map((x) => ({ x, d: km(x, selected) })).filter((b) => b.d <= 40).sort((a, b) => a.d - b.d).slice(0, 3)
    : [];
  const inPilgrimage = selected ? pilgrimageIds.includes(selected.id) : false;

  // The map is created once; MapLibre is loaded only in the browser.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const maplibregl = await import('maplibre-gl');
      // The worker is served from public/maplibre (see scripts/copy-maplibre-worker.mjs).
      maplibregl.setWorkerUrl(new URL('/maplibre/maplibre-gl-worker.mjs', location.href).href);
      if (cancelled || !container.current) return;
      const m = new maplibregl.Map({
        container: container.current,
        style: STYLE,
        center: [20.9, 44.0],
        zoom: 5.9,
        attributionControl: { compact: true },
      });
      map.current = m;
      m.on('error', (e: ErrorEvent) => {
        if (!m.isStyleLoaded() && String(e.error?.message ?? '').toLowerCase().includes('fetch')) setError(true);
      });
      m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

      m.on('load', () => {
        m.addSource('route', { type: 'geojson', data: route([]) });
        m.addLayer({ id: 'route-line', type: 'line', source: 'route', filter: ['==', ['geometry-type'], 'LineString'], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#7a5a16', 'line-width': 3, 'line-dasharray': [1.5, 1.5] } });

        m.addSource('shrines', { type: 'geojson', data: points(shrines), cluster: true, clusterRadius: 40, clusterMaxZoom: 11 });
        m.addLayer({ id: 'clusters', type: 'circle', source: 'shrines', filter: ['has', 'point_count'], paint: { 'circle-color': '#f3ebd8', 'circle-radius': 16, 'circle-stroke-color': '#c9a24b', 'circle-stroke-width': 2 } });
        m.addLayer({ id: 'cluster-count', type: 'symbol', source: 'shrines', filter: ['has', 'point_count'], layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 13 }, paint: { 'text-color': '#14213d' } });
        m.addLayer({
          id: 'points', type: 'circle', source: 'shrines', filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': ['match', ['get', 'kind'], 'monastery', '#c9a24b', '#14213d'],
            'circle-radius': ['match', ['get', 'kind'], 'monastery', 10, 8],
            'circle-stroke-color': '#f3ebd8',
            'circle-stroke-width': ['match', ['get', 'kind'], 'monastery', 2, 3],
          },
        });
        m.addLayer({ id: 'selected', type: 'circle', source: 'shrines', filter: ['==', ['get', 'id'], ''], paint: { 'circle-radius': 18, 'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-color': '#14213d', 'circle-stroke-width': 3 } });
        m.addLayer({ id: 'labels', type: 'symbol', source: 'shrines', filter: ['!', ['has', 'point_count']], minzoom: 8, layout: { 'text-field': ['get', 'name'], 'text-size': 12, 'text-offset': [0, 1.4], 'text-anchor': 'top' }, paint: { 'text-color': '#14213d', 'text-halo-color': '#fffcf5', 'text-halo-width': 1.5 } });

        m.addLayer({ id: 'route-number-circle', type: 'circle', source: 'route', filter: ['==', ['geometry-type'], 'Point'], paint: { 'circle-radius': 9, 'circle-color': '#7a5a16', 'circle-stroke-color': '#fffcf5', 'circle-stroke-width': 2, 'circle-translate': [10, -10] } });
        m.addLayer({ id: 'route-number', type: 'symbol', source: 'route', filter: ['==', ['geometry-type'], 'Point'], layout: { 'text-field': ['get', 'num'], 'text-size': 11, 'text-allow-overlap': true, 'icon-allow-overlap': true }, paint: { 'text-color': '#fffcf5', 'text-translate': [10, -10] } });

        m.addSource('me', { type: 'geojson', data: me(null) });
        m.addLayer({ id: 'me-halo', type: 'circle', source: 'me', paint: { 'circle-radius': 16, 'circle-color': 'rgba(37, 99, 235, 0.18)' } });
        m.addLayer({ id: 'me', type: 'circle', source: 'me', paint: { 'circle-radius': 7, 'circle-color': '#2563eb', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2 } });

        m.on('click', 'points', (e: MapLayerMouseEvent) => {
          const id = e.features?.[0]?.properties?.id as string | undefined;
          if (id) setSelectedId(id);
        });
        m.on('click', 'clusters', async (e: MapLayerMouseEvent) => {
          const f = e.features?.[0];
          if (!f) return;
          const source = m.getSource('shrines') as GeoJSONSource;
          const zoom = await source.getClusterExpansionZoom(f.properties.cluster_id as number);
          m.easeTo({ center: (f.geometry as GeoJSON.Point).coordinates as [number, number], zoom });
        });
        for (const layer of ['points', 'clusters']) {
          m.on('mouseenter', layer, () => (m.getCanvas().style.cursor = 'pointer'));
          m.on('mouseleave', layer, () => (m.getCanvas().style.cursor = ''));
        }
        setReady(true);
      });
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
  }, [shrines]);

  // Filters and search change the data on the map.
  useEffect(() => {
    if (!ready) return;
    (map.current?.getSource('shrines') as GeoJSONSource | undefined)?.setData(points(visible));
  }, [visible, ready]);

  // The pilgrimage is drawn as a dashed line with ordinal numbers.
  useEffect(() => {
    if (!ready) return;
    (map.current?.getSource('route') as GeoJSONSource | undefined)?.setData(route(pilgrimage));
  }, [pilgrimage, ready]);

  useEffect(() => {
    if (!ready) return;
    (map.current?.getSource('me') as GeoJSONSource | undefined)?.setData(me(position));
  }, [position, ready]);

  // Selected shrine: ring on the map and pan the view.
  useEffect(() => {
    const m = map.current;
    if (!m || !ready) return;
    m.setFilter('selected', ['==', ['get', 'id'], selected?.id ?? '']);
    if (selected) m.easeTo({ center: [selected.lon, selected.lat], zoom: Math.max(m.getZoom(), 9), offset: [0, -110], duration: 700 });
  }, [selected, ready]);

  function findNearby() {
    if (!('geolocation' in navigator)) {
      setPositionMessage('Овај уређај не даје положај.');
      return;
    }
    setLocating(true);
    setPositionMessage('');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const t = { lat: p.coords.latitude, lon: p.coords.longitude };
        setPosition(t);
        setLocating(false);
        setSelectedId(null);
        setView('list');
        map.current?.easeTo({ center: [t.lon, t.lat], zoom: 8 });
      },
      () => {
        setLocating(false);
        setPositionMessage('Положај није доступан. Дозволите приступ локацији у прегледачу па покушајте поново.');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  const updatePilgrimage = (ids: string[]) => setPilgrimageIds(ids);
  const move = (i: number, by: number) => {
    const ids = [...pilgrimageIds];
    const [x] = ids.splice(i, 1);
    if (x) ids.splice(i + by, 0, x);
    updatePilgrimage(ids);
  };
  const showPilgrimage = () => {
    setSelectedId(null);
    setView('pilgrimage');
  };
  const showOnMap = () => {
    setView('map');
    const m = map.current;
    if (!m || pilgrimage.length === 0) return;
    const lon = pilgrimage.map((x) => x.lon), lat = pilgrimage.map((x) => x.lat);
    m.fitBounds([[Math.min(...lon), Math.min(...lat)], [Math.max(...lon), Math.max(...lat)]], { padding: { top: 150, bottom: 140, left: 40, right: 40 }, maxZoom: 10, duration: 700 });
  };

  return (
    <div className={s.screen}>
      <div ref={container} className={s.map} aria-label="Мапа храмова и манастира" role="region" />

      <div className={s.top}>
        <div className={s.search}>
          <BackButton iconOnly className={s.back} />
          <label>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7a5a16" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <span className="sr-only">Претрага светиња</span>
            <input type="search" placeholder="Тражи светињу или место" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <button type="button" className={s.viewToggle} onClick={() => setView(view === 'map' ? 'list' : 'map')}>
            {view === 'map' ? `Листа · ${visible.length}` : 'Мапа'}
          </button>
          <ScriptToggle />
        </div>
        <div className="chip-row" role="group" aria-label="Алати мапе">
          <button type="button" className={`chip ${s.chip} ${s.tool}`} aria-pressed={view === 'filters'} onClick={() => setView(view === 'filters' ? 'map' : 'filters')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
            Филтери{n > 0 && <span className={s.count}>{n}</span>}
          </button>
          <button type="button" className={`chip ${s.chip} ${s.tool}`} aria-pressed={!!position && view === 'list'} onClick={findNearby} disabled={locating}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><circle cx="12" cy="12" r="7" /></svg>
            {locating ? 'Тражим положај…' : 'У близини'}
          </button>
          <button type="button" className={`chip ${s.chip} ${s.tool}`} aria-pressed={view === 'pilgrimage'} onClick={() => (view === 'pilgrimage' ? setView('map') : showPilgrimage())}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="6" cy="19" r="2" /><circle cx="18" cy="5" r="2" /><path d="M8 19h7a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h7" /></svg>
            Ходочашће{pilgrimage.length > 0 && <span className={s.count}>{pilgrimage.length}</span>}
          </button>
          {KINDS.slice(1).map(([id, name]) => (
            <button key={id} type="button" className={`chip ${s.chip}`} aria-pressed={filter.kind === id} onClick={() => setFilter({ ...filter, kind: filter.kind === id ? 'all' : id })}>{name}</button>
          ))}
        </div>
      </div>

      {positionMessage && (
        <p className={s.error} role="status">
          {positionMessage}
          <button type="button" className={s.close} aria-label="Затвори" onClick={() => setPositionMessage('')}>×</button>
        </p>
      )}
      {error && view === 'map' && !positionMessage && (
        <p className={s.error} role="status">Мапа тренутно није доступна без интернета. Светиње су и даље у листи.</p>
      )}

      {view === 'list' && (
        <div className={s.list}>
          {position && <p className={s.note}>Поређано по удаљености од вас, ваздушном линијом.</p>}
          {listed.length === 0 && <p className={s.note}>Ниједна светиња не одговара претрази и филтерима.</p>}
          <ul>
            {listed.map((x) => (
              <li key={x.id}>
                <button type="button" onClick={() => { setSelectedId(x.id); setView('map'); }}>
                  <span className={x.kind === 'monastery' ? s.iconMonastery : s.iconChurch} aria-hidden="true" />
                  <span className={s.text}>
                    <b>{x.name}</b>
                    <small>{x.kind === 'monastery' ? 'Манастир' : 'Храм'} · {x.century} · {x.place}</small>
                  </span>
                  {position && <span className={s.km}>{km(position, x)} км</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {view === 'filters' && (
        <div className={s.list}>
          <div className={s.filters}>
            <fieldset>
              <legend className="eyebrow">Врста</legend>
              <div className={s.chips}>
                {KINDS.map(([id, name]) => (
                  <button key={id} type="button" className="chip" aria-pressed={filter.kind === id} onClick={() => setFilter({ ...filter, kind: id })}>{name}</button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="eyebrow">Епархија</legend>
              <div className={s.chips}>
                <button type="button" className="chip" aria-pressed={!filter.eparchy} onClick={() => setFilter({ ...filter, eparchy: '' })}>Све</button>
                {eparchiesInData.map((e) => (
                  <button key={e.id} type="button" className="chip" aria-pressed={filter.eparchy === e.id} onClick={() => setFilter({ ...filter, eparchy: e.id })}>{e.name.replace(/^Епархија /, '')}</button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="eyebrow">Век настанка</legend>
              <div className={s.chips}>
                <button type="button" className="chip" aria-pressed={filter.century === null} onClick={() => setFilter({ ...filter, century: null })}>Сви</button>
                {centuries.map((v) => (
                  <button key={v} type="button" className="chip" aria-pressed={filter.century === v} onClick={() => setFilter({ ...filter, century: v })}>{toRoman(v)}</button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="eyebrow">Одлике</legend>
              <div className={s.chips}>
                {TAG_FILTERS.map(([id, name]) => {
                  const active = filter.tags.includes(id);
                  return (
                    <button key={id} type="button" className="chip" aria-pressed={active} onClick={() => setFilter({ ...filter, tags: active ? filter.tags.filter((t) => t !== id) : [...filter.tags, id] })}>{name}</button>
                  );
                })}
              </div>
            </fieldset>
            <div className={s.buttons}>
              <button type="button" className="button button-outline" onClick={() => setFilter(NO_FILTER)} disabled={n === 0}>Поништи</button>
              <button type="button" className="button" onClick={() => setView('map')}>
                {visible.length === 0 ? 'Нема светиња' : `Прикажи ${visible.length}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'pilgrimage' && (
        <div className={s.list}>
          <div className={s.pilgrimage}>
            <h2>Ходочашће</h2>
            {pilgrimage.length === 0 ? (
              <p className="muted">
                Отворите светињу на мапи и додирните „Додај у ходочашће“. Овде ћете их сложити редом,
                видети дужину пута и отворити навигацију за цео обилазак.
              </p>
            ) : (
              <>
                <p className="muted" style={{ margin: '2px 0 10px', fontSize: 13 }}>
                  {pilgrimage.length} {pilgrimage.length === 1 ? 'светиња' : pilgrimage.length < 5 ? 'светиње' : 'светиња'} · око {totalKm(pilgrimage)} км ваздушном линијом
                  {position && ` · до прве ${km(position, pilgrimage[0]!)} км`}
                </p>
                <ol className={s.stops}>
                  {pilgrimage.map((x, i) => (
                    <li key={x.id}>
                      <span className={s.ordinal} aria-hidden="true">{i + 1}</span>
                      <button type="button" className={s.text} onClick={() => { setSelectedId(x.id); setView('map'); }}>
                        <b>{x.name}</b>
                        <small>{x.place}{i > 0 && ` · ${km(pilgrimage[i - 1]!, x)} км од претходне`}</small>
                      </button>
                      <span className={s.move}>
                        <button type="button" aria-label={`Помери ${x.name} горе`} disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
                        <button type="button" aria-label={`Помери ${x.name} доле`} disabled={i === pilgrimage.length - 1} onClick={() => move(i, 1)}>↓</button>
                        <button type="button" aria-label={`Уклони ${x.name}`} onClick={() => updatePilgrimage(pilgrimageIds.filter((id) => id !== x.id))}>×</button>
                      </span>
                    </li>
                  ))}
                </ol>
                <div className={s.buttons}>
                  <button type="button" className="button button-outline" disabled={pilgrimage.length < 3} onClick={() => updatePilgrimage(shorterOrder(pilgrimage).map((x) => x.id))}>Краћи редослед</button>
                  <button type="button" className="button button-outline" onClick={showOnMap}>Прикажи на мапи</button>
                </div>
                <a className="button" style={{ marginTop: 8, width: '100%' }} href={directionsUrl(pilgrimage, position)} target="_blank" rel="noreferrer">
                  Отвори навигацију{position ? ' од мене' : ''}
                </a>
                <button type="button" className={s.clear} onClick={() => updatePilgrimage([])}>Обриши ходочашће</button>
              </>
            )}
          </div>
        </div>
      )}

      {view === 'map' && selected && (
        <section className={s.card} aria-live="polite">
          <div className={s.row}>
            <span className="eyebrow">{selected.kind === 'monastery' ? 'Манастир' : 'Храм'} · {selected.century}</span>
            <span className={s.tags}>{selected.tags.map((t) => <span key={t}>{TAG_LABELS[t] ?? t}</span>)}</span>
            <button type="button" className={s.close} aria-label="Затвори" onClick={() => setSelectedId(null)}>×</button>
          </div>
          <h2>{selected.name}</h2>
          <p className="muted" style={{ margin: '2px 0 0', fontSize: 13 }}>
            {selected.place} · {eparchyName.get(selected.eparchy) ?? ''}
            {position && ` · ${km(position, selected)} км од вас`}
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 14 }}>{selected.description}</p>
          {nearby.length > 0 && (
            <div className={s.nearby}>
              <span className="muted">У близини:</span>
              {nearby.map(({ x, d }) => (
                <button key={x.id} type="button" className="chip" onClick={() => setSelectedId(x.id)}>{x.name} · {d} км</button>
              ))}
            </div>
          )}
          <div className={s.buttons}>
            <a className="button button-outline" href={directionsUrl([selected], position)} target="_blank" rel="noreferrer">Путања</a>
            <button
              type="button"
              className="button"
              aria-pressed={inPilgrimage}
              onClick={() => updatePilgrimage(inPilgrimage ? pilgrimageIds.filter((id) => id !== selected.id) : [...pilgrimageIds, selected.id])}
            >
              {inPilgrimage ? `У ходочашћу · ${pilgrimageIds.indexOf(selected.id) + 1}.` : 'Додај у ходочашће'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

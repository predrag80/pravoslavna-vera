'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ErrorEvent, GeoJSONSource, Map as MapaGL, MapLayerMouseEvent } from 'maplibre-gl';
import DugmeNazad from './DugmeNazad';
import IzborPisma from './IzborPisma';
import { useHodocasce } from '@/lib/kuke';
import { km, kraciRedosled, rimski, ukupnoKm, vekBroj, vezaZaPutanju, type Tacka } from '@/lib/hodocasce';
import s from './Mapa.module.css';

export interface Svetinja { id: string; naziv: string; vrsta: string; lat: number; lon: number; vek: string; mesto: string; eparhija: string; opis: string; oznake: string[] }
export interface Eparhija { id: string; naziv: string }

const STIL = process.env.NEXT_PUBLIC_MAP_STYLE || 'https://tiles.openfreemap.org/styles/liberty';
const OZNAKE: Record<string, string> = { unesko: 'УНЕСКО', nemanjici: 'Немањићи' };
const VRSTE = [['sve', 'Све'], ['manastir', 'Манастири'], ['hram', 'Храмови']] as const;
const ODLIKE = [['unesko', 'УНЕСКО'], ['nemanjici', 'Задужбине Немањића']] as const;

interface Filter { vrsta: string; eparhija: string; vek: number | null; oznake: string[] }
const BEZ_FILTERA: Filter = { vrsta: 'sve', eparhija: '', vek: null, oznake: [] };
type Prikaz = 'mapa' | 'lista' | 'filteri' | 'hodocasce';

function tacke(lista: Svetinja[]) {
  return {
    type: 'FeatureCollection' as const,
    features: lista.map((x) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [x.lon, x.lat] },
      properties: { id: x.id, naziv: x.naziv, vrsta: x.vrsta },
    })),
  };
}

function ruta(lista: Svetinja[]) {
  return {
    type: 'FeatureCollection' as const,
    features: [
      ...(lista.length > 1 ? [{ type: 'Feature' as const, geometry: { type: 'LineString' as const, coordinates: lista.map((x) => [x.lon, x.lat]) }, properties: {} }] : []),
      ...lista.map((x, i) => ({ type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [x.lon, x.lat] }, properties: { r: String(i + 1) } })),
    ],
  };
}

function ja(p: Tacka | null) {
  return { type: 'FeatureCollection' as const, features: p ? [{ type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [p.lon, p.lat] }, properties: {} }] : [] };
}

function brojFiltera(f: Filter) {
  return (f.vrsta !== 'sve' ? 1 : 0) + (f.eparhija ? 1 : 0) + (f.vek !== null ? 1 : 0) + f.oznake.length;
}

function primeni(lista: Svetinja[], f: Filter, upit: string) {
  const q = upit.trim().toLowerCase();
  return lista.filter((x) =>
    (f.vrsta === 'sve' || x.vrsta === f.vrsta) &&
    (!f.eparhija || x.eparhija === f.eparhija) &&
    (f.vek === null || vekBroj(x.vek) === f.vek) &&
    f.oznake.every((o) => x.oznake.includes(o)) &&
    (!q || x.naziv.toLowerCase().includes(q) || x.mesto.toLowerCase().includes(q)),
  );
}

export default function Mapa({ svetinje, eparhije }: { svetinje: Svetinja[]; eparhije: Eparhija[] }) {
  const kontejner = useRef<HTMLDivElement>(null);
  const mapa = useRef<MapaGL | null>(null);
  const [filter, setFilter] = useState<Filter>(BEZ_FILTERA);
  const [upit, setUpit] = useState('');
  const [prikaz, setPrikaz] = useState<Prikaz>('mapa');
  const [izabranId, setIzabranId] = useState<string | null>(null);
  const [greska, setGreska] = useState(false);
  const [spremna, setSpremna] = useState(false);
  const [polozaj, setPolozaj] = useState<Tacka | null>(null);
  const [trazim, setTrazim] = useState(false);
  const [porukaPolozaja, setPorukaPolozaja] = useState('');
  const [hodocasceIds, postaviHodocasce] = useHodocasce();

  const poId = useMemo(() => new Map(svetinje.map((x) => [x.id, x])), [svetinje]);
  const nazivEparhije = useMemo(() => new Map(eparhije.map((e) => [e.id, e.naziv])), [eparhije]);
  const eparhijeUPodacima = useMemo(() => eparhije.filter((e) => svetinje.some((x) => x.eparhija === e.id)), [eparhije, svetinje]);
  const vekovi = useMemo(() => [...new Set(svetinje.map((x) => vekBroj(x.vek)).filter((v): v is number => v !== null))].sort((a, b) => a - b), [svetinje]);

  const vidljive = useMemo(() => primeni(svetinje, filter, upit), [svetinje, filter, upit]);
  const uListi = useMemo(
    () => [...vidljive].sort((a, b) => (polozaj ? km(polozaj, a) - km(polozaj, b) : a.naziv.localeCompare(b.naziv, 'sr'))),
    [vidljive, polozaj],
  );
  const hodocasce = useMemo(() => hodocasceIds.map((id) => poId.get(id)).filter((x): x is Svetinja => !!x), [hodocasceIds, poId]);
  const n = brojFiltera(filter);

  const izabrana = izabranId ? (poId.get(izabranId) ?? null) : null;
  const blizu = izabrana
    ? svetinje.filter((x) => x.id !== izabrana.id).map((x) => ({ x, d: km(x, izabrana) })).filter((b) => b.d <= 40).sort((a, b) => a.d - b.d).slice(0, 3)
    : [];
  const uHodocascu = izabrana ? hodocasceIds.includes(izabrana.id) : false;

  // Мапа се прави једном; MapLibre се учитава тек у прегледачу.
  useEffect(() => {
    let otkazano = false;
    (async () => {
      const maplibregl = await import('maplibre-gl');
      // Worker се служи из public/maplibre (види scripts/kopiraj-maplibre-worker.mjs).
      maplibregl.setWorkerUrl(new URL('/maplibre/maplibre-gl-worker.mjs', location.href).href);
      if (otkazano || !kontejner.current) return;
      const m = new maplibregl.Map({
        container: kontejner.current,
        style: STIL,
        center: [20.9, 44.0],
        zoom: 5.9,
        attributionControl: { compact: true },
      });
      mapa.current = m;
      m.on('error', (e: ErrorEvent) => {
        if (!m.isStyleLoaded() && String(e.error?.message ?? '').toLowerCase().includes('fetch')) setGreska(true);
      });
      m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

      m.on('load', () => {
        m.addSource('ruta', { type: 'geojson', data: ruta([]) });
        m.addLayer({ id: 'ruta-linija', type: 'line', source: 'ruta', filter: ['==', ['geometry-type'], 'LineString'], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#7a5a16', 'line-width': 3, 'line-dasharray': [1.5, 1.5] } });

        m.addSource('svetinje', { type: 'geojson', data: tacke(svetinje), cluster: true, clusterRadius: 40, clusterMaxZoom: 11 });
        m.addLayer({ id: 'grupe', type: 'circle', source: 'svetinje', filter: ['has', 'point_count'], paint: { 'circle-color': '#f3ebd8', 'circle-radius': 16, 'circle-stroke-color': '#c9a24b', 'circle-stroke-width': 2 } });
        m.addLayer({ id: 'grupe-broj', type: 'symbol', source: 'svetinje', filter: ['has', 'point_count'], layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 13 }, paint: { 'text-color': '#14213d' } });
        m.addLayer({
          id: 'tacke', type: 'circle', source: 'svetinje', filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': ['match', ['get', 'vrsta'], 'manastir', '#c9a24b', '#14213d'],
            'circle-radius': ['match', ['get', 'vrsta'], 'manastir', 10, 8],
            'circle-stroke-color': '#f3ebd8',
            'circle-stroke-width': ['match', ['get', 'vrsta'], 'manastir', 2, 3],
          },
        });
        m.addLayer({ id: 'izabrana', type: 'circle', source: 'svetinje', filter: ['==', ['get', 'id'], ''], paint: { 'circle-radius': 18, 'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-color': '#14213d', 'circle-stroke-width': 3 } });
        m.addLayer({ id: 'nazivi', type: 'symbol', source: 'svetinje', filter: ['!', ['has', 'point_count']], minzoom: 8, layout: { 'text-field': ['get', 'naziv'], 'text-size': 12, 'text-offset': [0, 1.4], 'text-anchor': 'top' }, paint: { 'text-color': '#14213d', 'text-halo-color': '#fffcf5', 'text-halo-width': 1.5 } });

        m.addLayer({ id: 'ruta-broj-krug', type: 'circle', source: 'ruta', filter: ['==', ['geometry-type'], 'Point'], paint: { 'circle-radius': 9, 'circle-color': '#7a5a16', 'circle-stroke-color': '#fffcf5', 'circle-stroke-width': 2, 'circle-translate': [10, -10] } });
        m.addLayer({ id: 'ruta-broj', type: 'symbol', source: 'ruta', filter: ['==', ['geometry-type'], 'Point'], layout: { 'text-field': ['get', 'r'], 'text-size': 11, 'text-allow-overlap': true, 'icon-allow-overlap': true }, paint: { 'text-color': '#fffcf5', 'text-translate': [10, -10] } });

        m.addSource('ja', { type: 'geojson', data: ja(null) });
        m.addLayer({ id: 'ja-oreol', type: 'circle', source: 'ja', paint: { 'circle-radius': 16, 'circle-color': 'rgba(37, 99, 235, 0.18)' } });
        m.addLayer({ id: 'ja', type: 'circle', source: 'ja', paint: { 'circle-radius': 7, 'circle-color': '#2563eb', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2 } });

        m.on('click', 'tacke', (e: MapLayerMouseEvent) => {
          const id = e.features?.[0]?.properties?.id as string | undefined;
          if (id) setIzabranId(id);
        });
        m.on('click', 'grupe', async (e: MapLayerMouseEvent) => {
          const f = e.features?.[0];
          if (!f) return;
          const izvor = m.getSource('svetinje') as GeoJSONSource;
          const zoom = await izvor.getClusterExpansionZoom(f.properties.cluster_id as number);
          m.easeTo({ center: (f.geometry as GeoJSON.Point).coordinates as [number, number], zoom });
        });
        for (const sloj of ['tacke', 'grupe']) {
          m.on('mouseenter', sloj, () => (m.getCanvas().style.cursor = 'pointer'));
          m.on('mouseleave', sloj, () => (m.getCanvas().style.cursor = ''));
        }
        setSpremna(true);
      });
    })();
    return () => {
      otkazano = true;
      mapa.current?.remove();
      mapa.current = null;
    };
  }, [svetinje]);

  // Филтер и претрага мењају податке на мапи.
  useEffect(() => {
    if (!spremna) return;
    (mapa.current?.getSource('svetinje') as GeoJSONSource | undefined)?.setData(tacke(vidljive));
  }, [vidljive, spremna]);

  // Ходочашће се црта као испрекидана линија са редним бројевима.
  useEffect(() => {
    if (!spremna) return;
    (mapa.current?.getSource('ruta') as GeoJSONSource | undefined)?.setData(ruta(hodocasce));
  }, [hodocasce, spremna]);

  useEffect(() => {
    if (!spremna) return;
    (mapa.current?.getSource('ja') as GeoJSONSource | undefined)?.setData(ja(polozaj));
  }, [polozaj, spremna]);

  // Изабрана светиња: прстен на мапи и померање погледа.
  useEffect(() => {
    const m = mapa.current;
    if (!m || !spremna) return;
    m.setFilter('izabrana', ['==', ['get', 'id'], izabrana?.id ?? '']);
    if (izabrana) m.easeTo({ center: [izabrana.lon, izabrana.lat], zoom: Math.max(m.getZoom(), 9), offset: [0, -110], duration: 700 });
  }, [izabrana, spremna]);

  function uBlizini() {
    if (!('geolocation' in navigator)) {
      setPorukaPolozaja('Овај уређај не даје положај.');
      return;
    }
    setTrazim(true);
    setPorukaPolozaja('');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const t = { lat: p.coords.latitude, lon: p.coords.longitude };
        setPolozaj(t);
        setTrazim(false);
        setIzabranId(null);
        setPrikaz('lista');
        mapa.current?.easeTo({ center: [t.lon, t.lat], zoom: 8 });
      },
      () => {
        setTrazim(false);
        setPorukaPolozaja('Положај није доступан. Дозволите приступ локацији у прегледачу па покушајте поново.');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  const promeniHodocasce = (ids: string[]) => postaviHodocasce(ids);
  const pomeri = (i: number, za: number) => {
    const ids = [...hodocasceIds];
    const [x] = ids.splice(i, 1);
    if (x) ids.splice(i + za, 0, x);
    promeniHodocasce(ids);
  };
  const prikaziHodocasce = () => {
    setIzabranId(null);
    setPrikaz('hodocasce');
  };
  const prikaziNaMapi = () => {
    setPrikaz('mapa');
    const m = mapa.current;
    if (!m || hodocasce.length === 0) return;
    const lon = hodocasce.map((x) => x.lon), lat = hodocasce.map((x) => x.lat);
    m.fitBounds([[Math.min(...lon), Math.min(...lat)], [Math.max(...lon), Math.max(...lat)]], { padding: { top: 150, bottom: 140, left: 40, right: 40 }, maxZoom: 10, duration: 700 });
  };

  return (
    <div className={s.ekran}>
      <div ref={kontejner} className={s.mapa} aria-label="Мапа храмова и манастира" role="region" />

      <div className={s.gore}>
        <div className={s.pretraga}>
          <DugmeNazad samoIkona className={s.nazad} />
          <label>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7a5a16" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <span className="samo-citac">Претрага светиња</span>
            <input type="search" placeholder="Тражи светињу или место" value={upit} onChange={(e) => setUpit(e.target.value)} />
          </label>
          <button type="button" className={s.prikaz} onClick={() => setPrikaz(prikaz === 'mapa' ? 'lista' : 'mapa')}>
            {prikaz === 'mapa' ? `Листа · ${vidljive.length}` : 'Мапа'}
          </button>
          <IzborPisma />
        </div>
        <div className="red-cipova" role="group" aria-label="Алати мапе">
          <button type="button" className={`cip ${s.cip} ${s.alat}`} aria-pressed={prikaz === 'filteri'} onClick={() => setPrikaz(prikaz === 'filteri' ? 'mapa' : 'filteri')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
            Филтери{n > 0 && <span className={s.broj}>{n}</span>}
          </button>
          <button type="button" className={`cip ${s.cip} ${s.alat}`} aria-pressed={!!polozaj && prikaz === 'lista'} onClick={uBlizini} disabled={trazim}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><circle cx="12" cy="12" r="7" /></svg>
            {trazim ? 'Тражим положај…' : 'У близини'}
          </button>
          <button type="button" className={`cip ${s.cip} ${s.alat}`} aria-pressed={prikaz === 'hodocasce'} onClick={() => (prikaz === 'hodocasce' ? setPrikaz('mapa') : prikaziHodocasce())}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="6" cy="19" r="2" /><circle cx="18" cy="5" r="2" /><path d="M8 19h7a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h7" /></svg>
            Ходочашће{hodocasce.length > 0 && <span className={s.broj}>{hodocasce.length}</span>}
          </button>
          {VRSTE.slice(1).map(([id, naziv]) => (
            <button key={id} type="button" className={`cip ${s.cip}`} aria-pressed={filter.vrsta === id} onClick={() => setFilter({ ...filter, vrsta: filter.vrsta === id ? 'sve' : id })}>{naziv}</button>
          ))}
        </div>
      </div>

      {porukaPolozaja && (
        <p className={s.greska} role="status">
          {porukaPolozaja}
          <button type="button" className={s.zatvori} aria-label="Затвори" onClick={() => setPorukaPolozaja('')}>×</button>
        </p>
      )}
      {greska && prikaz === 'mapa' && !porukaPolozaja && (
        <p className={s.greska} role="status">Мапа тренутно није доступна без интернета. Светиње су и даље у листи.</p>
      )}

      {prikaz === 'lista' && (
        <div className={s.lista}>
          {polozaj && <p className={s.napomena}>Поређано по удаљености од вас, ваздушном линијом.</p>}
          {uListi.length === 0 && <p className={s.napomena}>Ниједна светиња не одговара претрази и филтерима.</p>}
          <ul>
            {uListi.map((x) => (
              <li key={x.id}>
                <button type="button" onClick={() => { setIzabranId(x.id); setPrikaz('mapa'); }}>
                  <span className={x.vrsta === 'manastir' ? s.ikManastir : s.ikHram} aria-hidden="true" />
                  <span className={s.tekst}>
                    <b>{x.naziv}</b>
                    <small>{x.vrsta === 'manastir' ? 'Манастир' : 'Храм'} · {x.vek} · {x.mesto}</small>
                  </span>
                  {polozaj && <span className={s.km}>{km(polozaj, x)} км</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {prikaz === 'filteri' && (
        <div className={s.lista}>
          <div className={s.filteri}>
            <fieldset>
              <legend className="natpis">Врста</legend>
              <div className={s.cipovi}>
                {VRSTE.map(([id, naziv]) => (
                  <button key={id} type="button" className="cip" aria-pressed={filter.vrsta === id} onClick={() => setFilter({ ...filter, vrsta: id })}>{naziv}</button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="natpis">Епархија</legend>
              <div className={s.cipovi}>
                <button type="button" className="cip" aria-pressed={!filter.eparhija} onClick={() => setFilter({ ...filter, eparhija: '' })}>Све</button>
                {eparhijeUPodacima.map((e) => (
                  <button key={e.id} type="button" className="cip" aria-pressed={filter.eparhija === e.id} onClick={() => setFilter({ ...filter, eparhija: e.id })}>{e.naziv.replace(/^Епархија /, '')}</button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="natpis">Век настанка</legend>
              <div className={s.cipovi}>
                <button type="button" className="cip" aria-pressed={filter.vek === null} onClick={() => setFilter({ ...filter, vek: null })}>Сви</button>
                {vekovi.map((v) => (
                  <button key={v} type="button" className="cip" aria-pressed={filter.vek === v} onClick={() => setFilter({ ...filter, vek: v })}>{rimski(v)}</button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="natpis">Одлике</legend>
              <div className={s.cipovi}>
                {ODLIKE.map(([id, naziv]) => {
                  const ima = filter.oznake.includes(id);
                  return (
                    <button key={id} type="button" className="cip" aria-pressed={ima} onClick={() => setFilter({ ...filter, oznake: ima ? filter.oznake.filter((o) => o !== id) : [...filter.oznake, id] })}>{naziv}</button>
                  );
                })}
              </div>
            </fieldset>
            <div className={s.dugmad}>
              <button type="button" className="dugme dugme-obrub" onClick={() => setFilter(BEZ_FILTERA)} disabled={n === 0}>Поништи</button>
              <button type="button" className="dugme" onClick={() => setPrikaz('mapa')}>
                {vidljive.length === 0 ? 'Нема светиња' : `Прикажи ${vidljive.length}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {prikaz === 'hodocasce' && (
        <div className={s.lista}>
          <div className={s.hodocasce}>
            <h2>Ходочашће</h2>
            {hodocasce.length === 0 ? (
              <p className="prigusen">
                Отворите светињу на мапи и додирните „Додај у ходочашће“. Овде ћете их сложити редом,
                видети дужину пута и отворити навигацију за цео обилазак.
              </p>
            ) : (
              <>
                <p className="prigusen" style={{ margin: '2px 0 10px', fontSize: 13 }}>
                  {hodocasce.length} {hodocasce.length === 1 ? 'светиња' : hodocasce.length < 5 ? 'светиње' : 'светиња'} · око {ukupnoKm(hodocasce)} км ваздушном линијом
                  {polozaj && ` · до прве ${km(polozaj, hodocasce[0]!)} км`}
                </p>
                <ol className={s.stanice}>
                  {hodocasce.map((x, i) => (
                    <li key={x.id}>
                      <span className={s.redni} aria-hidden="true">{i + 1}</span>
                      <button type="button" className={s.tekst} onClick={() => { setIzabranId(x.id); setPrikaz('mapa'); }}>
                        <b>{x.naziv}</b>
                        <small>{x.mesto}{i > 0 && ` · ${km(hodocasce[i - 1]!, x)} км од претходне`}</small>
                      </button>
                      <span className={s.pomeri}>
                        <button type="button" aria-label={`Помери ${x.naziv} горе`} disabled={i === 0} onClick={() => pomeri(i, -1)}>↑</button>
                        <button type="button" aria-label={`Помери ${x.naziv} доле`} disabled={i === hodocasce.length - 1} onClick={() => pomeri(i, 1)}>↓</button>
                        <button type="button" aria-label={`Уклони ${x.naziv}`} onClick={() => promeniHodocasce(hodocasceIds.filter((id) => id !== x.id))}>×</button>
                      </span>
                    </li>
                  ))}
                </ol>
                <div className={s.dugmad}>
                  <button type="button" className="dugme dugme-obrub" disabled={hodocasce.length < 3} onClick={() => promeniHodocasce(kraciRedosled(hodocasce).map((x) => x.id))}>Краћи редослед</button>
                  <button type="button" className="dugme dugme-obrub" onClick={prikaziNaMapi}>Прикажи на мапи</button>
                </div>
                <a className="dugme" style={{ marginTop: 8, width: '100%' }} href={vezaZaPutanju(hodocasce, polozaj)} target="_blank" rel="noreferrer">
                  Отвори навигацију{polozaj ? ' од мене' : ''}
                </a>
                <button type="button" className={s.obrisi} onClick={() => promeniHodocasce([])}>Обриши ходочашће</button>
              </>
            )}
          </div>
        </div>
      )}

      {prikaz === 'mapa' && izabrana && (
        <section className={s.kartica} aria-live="polite">
          <div className={s.red}>
            <span className="natpis">{izabrana.vrsta === 'manastir' ? 'Манастир' : 'Храм'} · {izabrana.vek}</span>
            <span className={s.oznake}>{izabrana.oznake.map((o) => <span key={o}>{OZNAKE[o] ?? o}</span>)}</span>
            <button type="button" className={s.zatvori} aria-label="Затвори" onClick={() => setIzabranId(null)}>×</button>
          </div>
          <h2>{izabrana.naziv}</h2>
          <p className="prigusen" style={{ margin: '2px 0 0', fontSize: 13 }}>
            {izabrana.mesto} · {nazivEparhije.get(izabrana.eparhija) ?? ''}
            {polozaj && ` · ${km(polozaj, izabrana)} км од вас`}
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 14 }}>{izabrana.opis}</p>
          {blizu.length > 0 && (
            <div className={s.blizu}>
              <span className="prigusen">У близини:</span>
              {blizu.map(({ x, d }) => (
                <button key={x.id} type="button" className="cip" onClick={() => setIzabranId(x.id)}>{x.naziv} · {d} км</button>
              ))}
            </div>
          )}
          <div className={s.dugmad}>
            <a className="dugme dugme-obrub" href={vezaZaPutanju([izabrana], polozaj)} target="_blank" rel="noreferrer">Путања</a>
            <button
              type="button"
              className="dugme"
              aria-pressed={uHodocascu}
              onClick={() => promeniHodocasce(uHodocascu ? hodocasceIds.filter((id) => id !== izabrana.id) : [...hodocasceIds, izabrana.id])}
            >
              {uHodocascu ? `У ходочашћу · ${hodocasceIds.indexOf(izabrana.id) + 1}.` : 'Додај у ходочашће'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

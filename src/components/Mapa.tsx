'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ErrorEvent, GeoJSONSource, Map as MapaGL, MapLayerMouseEvent } from 'maplibre-gl';
import IzborPisma from './IzborPisma';
import s from './Mapa.module.css';

export interface Svetinja { id: string; naziv: string; vrsta: string; lat: number; lon: number; vek: string; mesto: string; opis: string; oznake: string[] }

const STIL = process.env.NEXT_PUBLIC_MAP_STYLE || 'https://tiles.openfreemap.org/styles/liberty';
const OZNAKE: Record<string, string> = { unesko: 'УНЕСКО', nemanjici: 'Немањићи' };
const FILTERI = [
  ['sve', 'Све'], ['manastir', 'Манастири'], ['hram', 'Храмови'], ['nemanjici', 'Задужбине Немањића'], ['unesko', 'УНЕСКО'],
] as const;

function km(a: Svetinja, b: Svetinja) {
  const dx = (a.lon - b.lon) * 111.3 * Math.cos((a.lat * Math.PI) / 180);
  const dy = (a.lat - b.lat) * 111.3;
  return Math.round(Math.hypot(dx, dy));
}

function geojson(lista: Svetinja[]) {
  return {
    type: 'FeatureCollection' as const,
    features: lista.map((x) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [x.lon, x.lat] },
      properties: { id: x.id, naziv: x.naziv, vrsta: x.vrsta },
    })),
  };
}

export default function Mapa({ svetinje }: { svetinje: Svetinja[] }) {
  const kontejner = useRef<HTMLDivElement>(null);
  const mapa = useRef<MapaGL | null>(null);
  const [filter, setFilter] = useState<string>('sve');
  const [upit, setUpit] = useState('');
  const [prikaz, setPrikaz] = useState<'mapa' | 'lista'>('mapa');
  const [izabranId, setIzabranId] = useState<string | null>(null);
  const [greska, setGreska] = useState(false);
  const [spremna, setSpremna] = useState(false);

  const vidljive = useMemo(() => {
    const q = upit.trim().toLowerCase();
    return svetinje.filter((x) => {
      const poFilteru = filter === 'sve' || x.vrsta === filter || x.oznake.includes(filter);
      const poUpitu = !q || x.naziv.toLowerCase().includes(q) || x.mesto.toLowerCase().includes(q);
      return poFilteru && poUpitu;
    });
  }, [svetinje, filter, upit]);

  const izabrana = svetinje.find((x) => x.id === izabranId) ?? null;
  const blizu = izabrana ? svetinje.filter((x) => x.id !== izabrana.id && km(x, izabrana) <= 30).slice(0, 3) : [];

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
      m.addControl(new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true } }), 'top-right');

      m.on('load', () => {
        m.addSource('svetinje', { type: 'geojson', data: geojson(svetinje), cluster: true, clusterRadius: 40, clusterMaxZoom: 11 });
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
    (mapa.current?.getSource('svetinje') as GeoJSONSource | undefined)?.setData(geojson(vidljive));
  }, [vidljive, spremna]);

  // Изабрана светиња: прстен на мапи и померање погледа.
  useEffect(() => {
    const m = mapa.current;
    if (!m || !spremna) return;
    m.setFilter('izabrana', ['==', ['get', 'id'], izabrana?.id ?? '']);
    if (izabrana) m.easeTo({ center: [izabrana.lon, izabrana.lat], zoom: Math.max(m.getZoom(), 9), offset: [0, -110], duration: 700 });
  }, [izabrana, spremna]);

  return (
    <div className={s.ekran}>
      <div ref={kontejner} className={s.mapa} aria-label="Мапа храмова и манастира" role="region" />

      <div className={s.gore}>
        <div className={s.pretraga}>
          <label>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7a5a16" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <span className="samo-citac">Претрага светиња</span>
            <input type="search" placeholder="Манастир, храм или место" value={upit} onChange={(e) => setUpit(e.target.value)} />
          </label>
          <button type="button" className={s.prikaz} onClick={() => setPrikaz(prikaz === 'mapa' ? 'lista' : 'mapa')}>
            {prikaz === 'mapa' ? `Листа · ${vidljive.length}` : 'Мапа'}
          </button>
          <IzborPisma />
        </div>
        <div className="red-cipova" role="group" aria-label="Филтер">
          {FILTERI.map(([id, naziv]) => (
            <button key={id} type="button" className={`cip ${s.cip}`} aria-pressed={filter === id} onClick={() => setFilter(id)}>{naziv}</button>
          ))}
        </div>
      </div>

      {greska && prikaz === 'mapa' && (
        <p className={s.greska} role="status">Мапа тренутно није доступна без интернета. Светиње су и даље у листи.</p>
      )}

      {prikaz === 'lista' && (
        <div className={s.lista}>
          <ul>
            {[...vidljive].sort((a, b) => a.naziv.localeCompare(b.naziv, 'sr')).map((x) => (
              <li key={x.id}>
                <button type="button" onClick={() => { setIzabranId(x.id); setPrikaz('mapa'); }}>
                  <span className={x.vrsta === 'manastir' ? s.ikManastir : s.ikHram} aria-hidden="true" />
                  <span className={s.tekst}>
                    <b>{x.naziv}</b>
                    <small>{x.vrsta === 'manastir' ? 'Манастир' : 'Храм'} · {x.vek} · {x.mesto}</small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
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
          <p className="prigusen" style={{ margin: '2px 0 0', fontSize: 13 }}>{izabrana.mesto}</p>
          <p style={{ margin: '6px 0 0', fontSize: 14 }}>{izabrana.opis}</p>
          {blizu.length > 0 && (
            <div className={s.blizu}>
              <span className="prigusen">У близини:</span>
              {blizu.map((b) => (
                <button key={b.id} type="button" className="cip" onClick={() => setIzabranId(b.id)}>{b.naziv} · {km(b, izabrana)} км</button>
              ))}
            </div>
          )}
          <div className={s.dugmad}>
            <a className="dugme" href={`https://www.openstreetmap.org/directions?to=${izabrana.lat}%2C${izabrana.lon}`} target="_blank" rel="noreferrer">Путања</a>
            <button type="button" className="dugme dugme-obrub">Историја и слава</button>
          </div>
        </section>
      )}
    </div>
  );
}

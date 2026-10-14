import podaci from '@/data/svetinje.json';

// Статички GeoJSON за мапу; прави се једном, при изградњи сајта.
export const dynamic = 'force-static';

export function GET() {
  const geojson = {
    type: 'FeatureCollection',
    features: podaci.svetinje.map((s) => ({
      type: 'Feature',
      id: s.id,
      geometry: { type: 'Point', coordinates: [s.lon, s.lat] },
      properties: { id: s.id, naziv: s.naziv, vrsta: s.vrsta, vek: s.vek, mesto: s.mesto, opis: s.opis, oznake: s.oznake.join(',') },
    })),
  };
  return Response.json(geojson);
}

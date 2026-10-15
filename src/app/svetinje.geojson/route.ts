import data from '@/data/shrines.json';

// Static GeoJSON for the map; built once, at site build time.
export const dynamic = 'force-static';

export function GET() {
  const geojson = {
    type: 'FeatureCollection',
    features: data.shrines.map((s) => ({
      type: 'Feature',
      id: s.id,
      geometry: { type: 'Point', coordinates: [s.lon, s.lat] },
      properties: { id: s.id, name: s.name, kind: s.kind, century: s.century, place: s.place, description: s.description, tags: s.tags.join(',') },
    })),
  };
  return Response.json(geojson);
}

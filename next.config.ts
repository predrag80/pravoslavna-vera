import type { NextConfig } from 'next';

// Static export: `npm run build` produces a ready site in `out/` for any static host.
// When an external API or database is needed, remove `output: 'export'` and add API routes (app/api/...).
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;

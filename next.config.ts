import type { NextConfig } from 'next';

// Статички извоз: `npm run build` прави готов сајт у `out/` за било који статички хостинг.
// Када затреба спољни API или база, уклоните `output: 'export'` и додајте API руте (app/api/...).
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;

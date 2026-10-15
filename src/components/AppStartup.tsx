'use client';

import { useEffect } from 'react';
import { applySavedScript } from '@/lib/script-client';

/** Starts app-wide behaviour: the chosen script and offline support. */
export default function AppStartup() {
  useEffect(() => {
    applySavedScript();
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);
  return null;
}

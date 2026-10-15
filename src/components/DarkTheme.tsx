'use client';

import { useEffect } from 'react';

/** Turns on the dark (vault) background only on the page where it is rendered. */
export default function DarkTheme() {
  useEffect(() => {
    document.body.classList.add('dark');
    return () => document.body.classList.remove('dark');
  }, []);
  return null;
}

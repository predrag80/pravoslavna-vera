/** The journey the user picked on the welcome screen. Stored only on the device. */
export type Journey = 'beginner' | 'learning' | 'practice';

const STORAGE_KEY = 'journey';
const JOURNEYS: Journey[] = ['beginner', 'learning', 'practice'];

export function savedJourney(): Journey | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return JOURNEYS.includes(v as Journey) ? (v as Journey) : null;
  } catch {
    return null;
  }
}

export function saveJourney(journey: Journey) {
  try {
    localStorage.setItem(STORAGE_KEY, journey);
  } catch {
    /* private mode: the choice lasts until the app is closed */
  }
  window.dispatchEvent(new Event('journey'));
}

/**
 * Script that runs while the HTML is loading, before rendering: if no journey has been picked,
 * the first visit goes straight to the welcome screen, without the home page flashing.
 */
export const REDIRECT_IF_NO_JOURNEY = `try{if(!localStorage.getItem('${STORAGE_KEY}'))location.replace('/dobrodosli/')}catch(e){}`;

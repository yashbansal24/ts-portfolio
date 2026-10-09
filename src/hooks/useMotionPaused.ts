import { useSyncExternalStore } from 'react';

// Site-wide "pause motion" switch (WCAG 2.2.2 Pause, Stop, Hide): one boolean shared by the Nav control,
// the CSS loops (html[data-motion='paused'] in global.css) and the three.js render loops (ThreeCanvas).
// Persisted in localStorage; index.html applies the stored value before first paint.

const KEY = 'motion';
const listeners = new Set<() => void>();

function readStored(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(KEY) === 'paused';
  } catch {
    return false;
  }
}

let paused = readStored();

/** Mirror the flag onto <html data-motion="paused"> (the CSS hook). */
export function applyMotionAttr(p: boolean = paused) {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  if (p) el.dataset.motion = 'paused';
  else delete el.dataset.motion;
}

/** Non-hook read (for render loops). */
export function isMotionPaused(): boolean {
  return paused;
}

export function setMotionPaused(next: boolean) {
  if (next === paused) return;
  paused = next;
  try {
    if (next) localStorage.setItem(KEY, 'paused');
    else localStorage.removeItem(KEY);
  } catch {
    /* storage blocked: the choice lasts for this page view */
  }
  applyMotionAttr(next);
  listeners.forEach((l) => l());
}

/** Subscribe to changes; returns the unsubscribe function. */
export function subscribeMotion(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Live "motion paused" flag (false on the server and during hydration). */
export function useMotionPaused(): boolean {
  return useSyncExternalStore(subscribeMotion, isMotionPaused, () => false);
}

/// <reference types="vite/client" />

/**
 * Build month as a month index (`year * 12 + monthIndex`, 0-based month), injected by vite.config.ts `define`.
 * Date-dependent text (career length, "Present" durations, © year) should render this value on the server
 * and during hydration (useSyncExternalStore's getServerSnapshot), then switch to the visitor's clock, so the
 * prerendered HTML never mismatches.
 */
declare const __BUILD_MONTH__: number;

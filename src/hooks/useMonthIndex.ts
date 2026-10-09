import { useSyncExternalStore } from 'react';

/** Month index = year * 12 + 0-based month. */
const clientMonthIndex = () => {
  const d = new Date();
  return d.getFullYear() * 12 + d.getMonth();
};
const noSubscribe = () => () => {};
const buildMonth = () => __BUILD_MONTH__;

/**
 * Current month index. The prerendered HTML and hydration use the build month (__BUILD_MONTH__), so they always match;
 * React then re-renders with the visitor's real month if it differs (no hydration mismatch when the build is old).
 */
export function useMonthIndex(): number {
  return useSyncExternalStore(noSubscribe, clientMonthIndex, buildMonth);
}

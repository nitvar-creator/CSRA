"use client";

import { useSyncExternalStore } from "react";

/**
 * Returns `false` during SSR and the first client render, then `true` on every
 * subsequent render. Use this to gate rendering of UI that depends on
 * browser-only state (e.g. sessionStorage drafts) so the server and the first
 * client paint stay in sync, avoiding hydration mismatches and the React 19
 * `react-hooks/set-state-in-effect` lint rule (which fires when state hydrated
 * from external systems is written via `setState` inside `useEffect`).
 *
 * `useSyncExternalStore` is the idiomatic React 18+/19 way to subscribe to an
 * external "store" — here that store is simply "are we on the client yet."
 */
const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

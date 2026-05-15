/**
 * Session-storage-backed draft persistence for the Mother flow.
 *
 * SSR-safe: every sessionStorage access is guarded behind a
 * `typeof window === "undefined"` check, so module load on the server
 * never touches browser-only globals.
 */

import type { MotherAnswers, MotherStep } from "./flow";

export const STORAGE_KEY = "csra:motherDraft";

export type DraftEnvelope = {
  draftId: string;
  updatedAt: number;
  currentStep: MotherStep;
  answers: MotherAnswers;
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function mintId(): string {
  // crypto.randomUUID is available in modern browsers and Node 19+.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback (should rarely be hit): RFC4122-ish v4 string built from Math.random.
  const rand = (n: number) =>
    Array.from({ length: n }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("");
  return `${rand(8)}-${rand(4)}-4${rand(3)}-${((Math.random() * 4) | 8).toString(16)}${rand(3)}-${rand(12)}`;
}

/** Reads the draft if any. Returns null on missing, parse error, or non-browser. */
export function loadDraft(): DraftEnvelope | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftEnvelope;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.draftId !== "string" ||
      typeof parsed.updatedAt !== "number" ||
      typeof parsed.currentStep !== "string" ||
      typeof parsed.answers !== "object" ||
      parsed.answers === null
    ) {
      clearDraft();
      return null;
    }
    return parsed;
  } catch {
    clearDraft();
    return null;
  }
}

/**
 * Saves (creates or updates) the draft. Mints `draftId` if it's a new draft.
 * Updates `updatedAt` on every save. In a non-browser context the returned
 * envelope is built but not persisted.
 */
export function saveDraft(input: {
  currentStep: MotherStep;
  answers: MotherAnswers;
}): DraftEnvelope {
  const existing = loadDraft();
  const envelope: DraftEnvelope = {
    draftId: existing?.draftId ?? mintId(),
    updatedAt: Date.now(),
    currentStep: input.currentStep,
    answers: input.answers,
  };
  if (isBrowser()) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    } catch {
      // Quota / disabled storage — swallow; envelope is still returned so the
      // caller can keep operating on the in-memory copy.
    }
  }
  return envelope;
}

/** Deletes the draft. Idempotent and safe on the server. */
export function clearDraft(): void {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors on clear.
  }
}

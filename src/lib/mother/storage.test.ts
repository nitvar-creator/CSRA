import { describe, it, expect, beforeEach } from 'vitest';
import { loadDraft, saveDraft, clearDraft, STORAGE_KEY } from './storage';

describe('storage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('loadDraft returns null when nothing is saved', () => {
    expect(loadDraft()).toBeNull();
  });

  it('saveDraft creates a new envelope with a draftId', () => {
    const env = saveDraft({ currentStep: 'start', answers: { name: 'A' } });
    expect(env.draftId).toBeTruthy();
    expect(env.currentStep).toBe('start');
    expect(env.answers).toEqual({ name: 'A' });
    expect(env.updatedAt).toBeGreaterThan(0);
  });

  it('saveDraft preserves draftId across saves', () => {
    const first = saveDraft({ currentStep: 'start', answers: { name: 'A' } });
    const second = saveDraft({ currentStep: 'status', answers: { name: 'A', age: 25 } });
    expect(second.draftId).toBe(first.draftId);
  });

  it('loadDraft returns what was saved', () => {
    saveDraft({ currentStep: 'status', answers: { name: 'A', age: 25 } });
    const loaded = loadDraft();
    expect(loaded?.currentStep).toBe('status');
    expect(loaded?.answers.name).toBe('A');
  });

  it('clearDraft removes the draft', () => {
    saveDraft({ currentStep: 'start', answers: {} });
    clearDraft();
    expect(loadDraft()).toBeNull();
  });

  it('loadDraft returns null and clears bad data on parse error', () => {
    sessionStorage.setItem(STORAGE_KEY, '{not valid json}');
    expect(loadDraft()).toBeNull();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import { activeEvent, createEmptyState, formatDuration, mergeStates, relativeTime, sortedCompletedEvents } from '../src/state';
import type { CareEvent } from '../src/types';

const event = (overrides: Partial<CareEvent> = {}): CareEvent => ({
  id: 'event-1', type: 'feed', startAt: 1_000, endAt: 61_000, note: '', updatedAt: 70_000,
  revision: 1, deviceId: 'device-a', ...overrides,
});

describe('handoff state', () => {
  it('uses completion time—not start time—to choose the last action', () => {
    const state = createEmptyState('device-a');
    state.events = [
      event({ id: 'long-feed', startAt: 1_000, endAt: 100_000 }),
      event({ id: 'short-diaper', type: 'diaper', startAt: 50_000, endAt: 50_000 }),
    ];
    expect(sortedCompletedEvents(state)[0]?.id).toBe('long-feed');
  });

  it('keeps active actions out of the completed handoff', () => {
    const state = createEmptyState('device-a');
    state.events = [event({ id: 'active', endAt: null }), event({ id: 'done' })];
    expect(activeEvent(state)?.id).toBe('active');
    expect(sortedCompletedEvents(state).map((item) => item.id)).toEqual(['done']);
  });

  it('resolves conflicts by revision, then timestamp, then device id', () => {
    const local = createEmptyState('device-a');
    local.events = [event({ note: 'local', revision: 2, updatedAt: 90_000 })];
    const incoming = createEmptyState('device-b');
    incoming.settings = local.settings;
    incoming.events = [event({ note: 'incoming', revision: 3, updatedAt: 80_000, deviceId: 'device-b' })];
    const merged = mergeStates(local, incoming);
    expect(merged.state.events[0]?.note).toBe('incoming');
    expect(merged.changed).toBe(1);
    expect(merged.state.corrections[0]?.reason).toContain('Sync conflict');
  });

  it('unions correction history without duplicates', () => {
    const local = createEmptyState('device-a');
    const incoming = createEmptyState('device-b');
    const correction = { id: 'c1', eventId: 'event-1', at: 3, reason: 'Corrected time', before: { startAt: 1, endAt: 2, note: '' }, after: { startAt: 1, endAt: 3, note: '' }, deviceId: 'device-a' };
    local.corrections = [correction];
    incoming.corrections = [correction];
    expect(mergeStates(local, incoming).state.corrections).toHaveLength(1);
  });

  it('formats tired-parent-friendly durations and elapsed time', () => {
    expect(formatDuration(95 * 60_000)).toBe('1 hr 35 min');
    expect(relativeTime(0, 30_000)).toBe('just now');
    expect(relativeTime(0, 2 * 60 * 60_000)).toBe('2 hrs ago');
  });
});

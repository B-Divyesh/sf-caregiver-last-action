import type { AppState, CareEvent, Correction } from './types';

export function createEmptyState(deviceId: string): AppState {
  return {
    version: 1,
    events: [],
    corrections: [],
    settings: { babyName: '', caregiverName: '', updatedAt: 0, deviceId },
  };
}

function winner(a: CareEvent, b: CareEvent): CareEvent {
  if (a.revision !== b.revision) return a.revision > b.revision ? a : b;
  if (a.updatedAt !== b.updatedAt) return a.updatedAt > b.updatedAt ? a : b;
  return a.deviceId.localeCompare(b.deviceId) >= 0 ? a : b;
}

export function mergeStates(local: AppState, incoming: AppState): { state: AppState; changed: number } {
  const events = new Map(local.events.map((event) => [event.id, event]));
  const conflictCorrections: Correction[] = [];
  let changed = 0;
  for (const event of incoming.events) {
    const current = events.get(event.id);
    if (!current) {
      events.set(event.id, event);
      changed += 1;
      continue;
    }
    const selected = winner(current, event);
    if (JSON.stringify(current) !== JSON.stringify(event)) {
      const discarded = selected === current ? event : current;
      conflictCorrections.push({
        id: `conflict:${event.id}:${discarded.revision}:${discarded.deviceId}:${selected.revision}:${selected.deviceId}`,
        eventId: event.id,
        at: selected.updatedAt,
        reason: 'Sync conflict resolved by newest revision',
        before: { startAt: discarded.startAt, endAt: discarded.endAt, note: discarded.note, deleted: discarded.deleted },
        after: { startAt: selected.startAt, endAt: selected.endAt, note: selected.note, deleted: selected.deleted },
        deviceId: selected.deviceId,
      });
    }
    if (selected !== current) {
      events.set(event.id, selected);
      changed += 1;
    }
  }

  const corrections = new Map<string, Correction>();
  for (const correction of [...local.corrections, ...incoming.corrections, ...conflictCorrections]) {
    corrections.set(correction.id, correction);
  }

  const settings = incoming.settings.updatedAt > local.settings.updatedAt
    || (incoming.settings.updatedAt === local.settings.updatedAt
      && incoming.settings.deviceId.localeCompare(local.settings.deviceId) > 0)
    ? incoming.settings
    : local.settings;
  if (settings !== local.settings) changed += 1;

  return {
    state: {
      version: 1,
      events: [...events.values()],
      corrections: [...corrections.values()].sort((a, b) => a.at - b.at),
      settings,
    },
    changed,
  };
}

export function sortedCompletedEvents(state: AppState): CareEvent[] {
  return state.events
    .filter((event) => !event.deleted && event.endAt !== null)
    .sort((a, b) => (b.endAt ?? 0) - (a.endAt ?? 0));
}

export function activeEvent(state: AppState): CareEvent | undefined {
  return state.events
    .filter((event) => !event.deleted && event.endAt === null)
    .sort((a, b) => b.startAt - a.startAt)[0];
}

export function formatDuration(milliseconds: number): string {
  const totalMinutes = Math.max(0, Math.round(milliseconds / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) return `${minutes} min`;
  if (!minutes) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
}

export function relativeTime(timestamp: number, now = Date.now()): string {
  const minutes = Math.max(0, Math.floor((now - timestamp) / 60_000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

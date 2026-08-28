export type ActionType = 'feed' | 'sleep' | 'medicine' | 'diaper';

export interface CareEvent {
  id: string;
  type: ActionType;
  startAt: number;
  endAt: number | null;
  note: string;
  updatedAt: number;
  revision: number;
  deviceId: string;
  deleted?: boolean;
}

export interface Correction {
  id: string;
  eventId: string;
  at: number;
  reason: string;
  before: Pick<CareEvent, 'startAt' | 'endAt' | 'note' | 'deleted'>;
  after: Pick<CareEvent, 'startAt' | 'endAt' | 'note' | 'deleted'>;
  deviceId: string;
}

export interface Settings {
  babyName: string;
  caregiverName: string;
  updatedAt: number;
  deviceId: string;
}

export interface AppState {
  version: 1;
  events: CareEvent[];
  corrections: Correction[];
  settings: Settings;
}

export const ACTION_META: Record<ActionType, { label: string; verb: string; timed: boolean }> = {
  feed: { label: 'Feed', verb: 'fed', timed: true },
  sleep: { label: 'Sleep', verb: 'slept', timed: true },
  medicine: { label: 'Medicine', verb: 'medicine given', timed: false },
  diaper: { label: 'Diaper', verb: 'diaper changed', timed: false },
};

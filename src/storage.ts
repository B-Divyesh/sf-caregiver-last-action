import type { AppState } from './types';
import { createEmptyState } from './state';

const DATABASE = 'caregiver-last-action';
const STORE = 'app';
const STATE_KEY = 'state';

function databaseName(demo = false): string {
  return demo ? `demo:${DATABASE}` : DATABASE;
}

export function getDeviceId(demo = false): string {
  const key = demo ? 'demo:cla_device_id' : 'cla_device_id';
  const stored = localStorage.getItem(key);
  if (stored) return stored;
  const id = crypto.randomUUID();
  localStorage.setItem(key, id);
  return id;
}

function openDatabase(demo = false): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName(demo), 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open local storage.'));
  });
}

export async function loadState(deviceId: string, demo = false): Promise<AppState> {
  const database = await openDatabase(demo);
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE, 'readonly');
    const request = transaction.objectStore(STORE).get(STATE_KEY);
    request.onsuccess = () => {
      const saved = request.result as unknown;
      resolve(isValidState(saved) ? saved : createEmptyState(deviceId));
    };
    request.onerror = () => reject(request.error ?? new Error('Could not read your local record.'));
    transaction.oncomplete = () => database.close();
  });
}

export async function saveState(state: AppState, demo = false): Promise<void> {
  if (!isValidState(state)) throw new Error('Refusing to save an invalid local record.');
  const database = await openDatabase(demo);
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(state, STATE_KEY);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => reject(transaction.error ?? new Error('Could not save your change.'));
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isText(value: unknown, maximum = 120): value is string {
  return typeof value === 'string' && value.length <= maximum;
}

function isTimestamp(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isEvent(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const timed = value.type === 'feed' || value.type === 'sleep';
  const instant = value.type === 'medicine' || value.type === 'diaper';
  return (timed || instant)
    && isText(value.id, 100) && value.id.length > 0
    && isTimestamp(value.startAt)
    && (value.endAt === null || isTimestamp(value.endAt))
    && (!timed || value.endAt === null || (value.endAt as number) >= value.startAt)
    && (instant ? value.endAt !== null : true)
    && isText(value.note)
    && isTimestamp(value.updatedAt)
    && Number.isInteger(value.revision) && (value.revision as number) > 0
    && isText(value.deviceId, 100) && value.deviceId.length > 0
    && (value.deleted === undefined || typeof value.deleted === 'boolean');
}

function isSnapshot(value: unknown): boolean {
  return isRecord(value) && isTimestamp(value.startAt) && (value.endAt === null || isTimestamp(value.endAt))
    && isText(value.note) && (value.deleted === undefined || typeof value.deleted === 'boolean');
}

function isCorrection(value: unknown): boolean {
  return isRecord(value) && isText(value.id, 160) && value.id.length > 0 && isText(value.eventId, 100)
    && isTimestamp(value.at) && isText(value.reason) && isSnapshot(value.before) && isSnapshot(value.after)
    && isText(value.deviceId, 100) && value.deviceId.length > 0;
}

export function isValidState(value: unknown): value is AppState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Record<string, unknown>;
  return state.version === 1 && Array.isArray(state.events) && state.events.every(isEvent)
    && Array.isArray(state.corrections) && state.corrections.every(isCorrection)
    && isRecord(state.settings) && isText(state.settings.babyName, 40) && isText(state.settings.caregiverName, 40)
    && isTimestamp(state.settings.updatedAt) && isText(state.settings.deviceId, 100) && state.settings.deviceId.length > 0;
}

export function validateImportedState(value: unknown): AppState {
  if (!isValidState(value)) throw new Error('That backup has missing or invalid care actions. Nothing was changed.');
  return value;
}

export async function clearDemoState(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(databaseName(true));
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error('Could not reset the sample data.'));
    request.onblocked = () => resolve();
  });
  localStorage.removeItem('demo:cla_device_id');
}

import type { AppState } from './types';
import { createEmptyState } from './state';

const DATABASE = 'caregiver-last-action';
const STORE = 'app';
const STATE_KEY = 'state';

export function getDeviceId(): string {
  const stored = localStorage.getItem('cla_device_id');
  if (stored) return stored;
  const id = crypto.randomUUID();
  localStorage.setItem('cla_device_id', id);
  return id;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open local storage.'));
  });
}

export async function loadState(deviceId: string): Promise<AppState> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE, 'readonly');
    const request = transaction.objectStore(STORE).get(STATE_KEY);
    request.onsuccess = () => resolve((request.result as AppState | undefined) ?? createEmptyState(deviceId));
    request.onerror = () => reject(request.error ?? new Error('Could not read your local record.'));
    transaction.oncomplete = () => database.close();
  });
}

export async function saveState(state: AppState): Promise<void> {
  const database = await openDatabase();
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

export function validateImportedState(value: unknown): AppState {
  if (!value || typeof value !== 'object') throw new Error('That file is not a Caregiver Last Action export.');
  const state = value as Partial<AppState>;
  if (state.version !== 1 || !Array.isArray(state.events) || !Array.isArray(state.corrections) || !state.settings) {
    throw new Error('That file is not a supported Caregiver Last Action export.');
  }
  return state as AppState;
}

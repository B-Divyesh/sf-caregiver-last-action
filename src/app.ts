import './styles.css';
import type { ActionType, AppState, CareEvent, Correction } from './types';
import { ACTION_META } from './types';
import { activeEvent, formatDuration, mergeStates, relativeTime, sortedCompletedEvents } from './state';
import { clearDemoState, getDeviceId, loadState, saveState, validateImportedState } from './storage';
import { copyPairingCode, drawQr, PeerLink } from './peer';

const demoMode = window.location.pathname === '/demo' || new URLSearchParams(window.location.search).get('demo') === '1';
const deviceId = getDeviceId(demoMode);
let state: AppState;
let peerLink: PeerLink | undefined;
let pairStatus = 'Not connected';
let toastTimer = 0;
let cameraStream: MediaStream | undefined;
let networkReachable = navigator.onLine;
let forcedOffline = false;
// Demo and real records must never meet, including through another open tab.
const broadcast = new BroadcastChannel(`caregiver-last-action:${demoMode ? 'demo' : 'real'}`);

const element = <T extends HTMLElement>(id: string): T => {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Missing element: ${id}`);
  return found as T;
};

const main = element<HTMLElement>('main');
const loading = element<HTMLElement>('loading');
const dialog = element<HTMLDialogElement>('app-dialog');
const dialogBody = element<HTMLElement>('dialog-body');

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] ?? character);
}

function icon(type: ActionType): string {
  const paths: Record<ActionType, string> = {
    feed: '<path d="M9 3h6v4l2 3v10H7V10l2-3Zm0 4h6M7 12h10"/>',
    sleep: '<path d="M4 18V8m0 7h16v3M7 15V9h7a4 4 0 0 1 4 4v2"/>',
    medicine: '<path d="m8 4 8 8m-6-6-4 4a4.2 4.2 0 0 0 6 6l6-6a4.2 4.2 0 0 0-6-6Z"/>',
    diaper: '<path d="M6 5c1 5 3 7 6 7s5-2 6-7v12c-4 3-8 3-12 0Zm2 14 2-7m6 7-2-7"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[type]}</svg>`;
}

function dateLabel(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(timestamp);
}

function timeLabel(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(timestamp);
}

function fullTimeLabel(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(timestamp);
}

function toLocalInput(timestamp: number): string {
  const date = new Date(timestamp - new Date(timestamp).getTimezoneOffset() * 60_000);
  return date.toISOString().slice(0, 16);
}

function showToast(message: string, action?: { label: string; run: () => void }): void {
  window.clearTimeout(toastTimer);
  const toast = element<HTMLElement>('toast');
  toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
  if (action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = action.label;
    button.addEventListener('click', () => {
      action.run();
      toast.hidden = true;
    });
    toast.append(button);
  }
  toast.hidden = false;
  toastTimer = window.setTimeout(() => { toast.hidden = true; }, action ? 8_000 : 4_000);
}

function setConnection(text: string, kind: 'ok' | 'offline' | 'error' = 'ok'): void {
  const pill = element<HTMLElement>('connection-pill');
  pill.className = `connection-pill${kind === 'ok' ? '' : ` is-${kind}`}`;
  const label = pill.querySelector('b');
  if (label) label.textContent = text;
}

async function persist(message = demoMode ? 'Saved in sample data' : 'Saved on this device', announce = false): Promise<void> {
  try {
    await saveState(state, demoMode);
    broadcast.postMessage(state);
    await peerLink?.send(state);
    setConnection(peerLink ? pairStatus : message);
    render();
    if (announce) showToast(message);
  } catch {
    setConnection('Could not save', 'error');
    showToast('This change could not be saved. Try again.');
  }
}

function sampleState(): AppState {
  const now = Date.now();
  const entry = (type: ActionType, minutesAgo: number, durationMinutes: number, note: string): CareEvent => {
    const endAt = now - minutesAgo * 60_000;
    return { id: `sample-${type}`, type, startAt: endAt - durationMinutes * 60_000, endAt, note, updatedAt: endAt, revision: 1, deviceId };
  };
  return {
    version: 1,
    events: [entry('diaper', 18, 0, 'Wet diaper'), entry('feed', 95, 22, 'Finished 120 ml'), entry('sleep', 220, 74, 'Woke calmly')],
    corrections: [],
    settings: { babyName: 'Mila', caregiverName: 'Sample caregiver', updatedAt: now, deviceId },
  };
}

function snapshot(event: CareEvent): Correction['before'] {
  return { startAt: event.startAt, endAt: event.endAt, note: event.note, deleted: event.deleted };
}

function addCorrection(event: CareEvent, before: Correction['before'], reason: string): void {
  state.corrections.push({
    id: crypto.randomUUID(), eventId: event.id, at: Date.now(), reason,
    before, after: snapshot(event), deviceId,
  });
}

function startAction(type: ActionType): void {
  const now = Date.now();
  const event: CareEvent = {
    id: crypto.randomUUID(), type, startAt: now, endAt: ACTION_META[type].timed ? null : now,
    note: '', updatedAt: now, revision: 1, deviceId,
  };
  state.events.push(event);
  void persist(ACTION_META[type].timed ? `${ACTION_META[type].label} started` : `${ACTION_META[type].label} recorded`);
  showToast(ACTION_META[type].timed ? `${ACTION_META[type].label} started` : `${ACTION_META[type].label} recorded`, {
    label: 'Undo',
    run: () => {
      const before = snapshot(event);
      event.deleted = true;
      event.updatedAt = Date.now();
      event.revision += 1;
      addCorrection(event, before, 'Undid newly recorded action');
      void persist('Action removed');
    },
  });
}

function stopActive(): void {
  const event = activeEvent(state);
  if (!event) return;
  const before = snapshot(event);
  event.endAt = Date.now();
  event.updatedAt = Date.now();
  event.revision += 1;
  addCorrection(event, before, 'Completed action');
  void persist(`${ACTION_META[event.type].label} ended`);
  showToast(`${ACTION_META[event.type].label} ended · handoff updated`);
}

function renderLastAction(): void {
  const container = element<HTMLElement>('last-action');
  const last = sortedCompletedEvents(state)[0];
  if (!last || last.endAt === null) {
    container.innerHTML = `<div class="empty-card"><svg class="horizon-mark" viewBox="0 0 120 48" aria-hidden="true"><path d="M3 39c25-9 41-9 64 0 19 7 33 7 50 0" fill="none" stroke="var(--reed)" stroke-width="3" stroke-linecap="round"/><path d="M27 31a32 32 0 0 1 56-23 37 37 0 0 0-56 23Z" fill="var(--brass)"/></svg><h3>The next action becomes the handoff.</h3><p>Start a feed or sleep below, or record medicine or a diaper change in one tap.</p></div>`;
    return;
  }
  const meta = ACTION_META[last.type];
  const detail = meta.timed && last.endAt > last.startAt
    ? `<span>Duration <strong>${formatDuration(last.endAt - last.startAt)}</strong></span>` : '<span>Recorded as an instant action</span>';
  const note = last.note ? `<span>Note <strong>${escapeHtml(last.note)}</strong></span>` : '';
  container.innerHTML = `<article class="last-card"><div><p class="last-card__type">${icon(last.type)} ${meta.label}</p><p class="last-card__time">${timeLabel(last.endAt)}</p><p class="last-card__ended">Ended ${dateLabel(last.endAt)}</p></div><span class="last-card__relative">${relativeTime(last.endAt)}</span><div class="last-card__detail">${detail}${note}</div></article>`;
}

function renderActiveAction(): void {
  const container = element<HTMLElement>('active-action');
  const active = activeEvent(state);
  if (!active) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = `<div class="active-card"><div class="active-card__state"><span class="pulse" aria-hidden="true"></span><p><strong>${ACTION_META[active.type].label} in progress</strong><span>Started ${timeLabel(active.startAt)} · ${relativeTime(active.startAt)}</span></p></div><button class="button button--primary" id="stop-active" type="button">End ${ACTION_META[active.type].label.toLowerCase()}</button></div>`;
  element<HTMLButtonElement>('stop-active').addEventListener('click', stopActive);
}

function renderActions(): void {
  const container = element<HTMLElement>('action-grid');
  const active = activeEvent(state);
  container.innerHTML = (Object.keys(ACTION_META) as ActionType[]).map((type) => {
    const meta = ACTION_META[type];
    const disabled = Boolean(active && meta.timed);
    return `<button class="action-button" type="button" data-action="${type}" ${disabled ? 'disabled' : ''}><span>${icon(type)}</span><span>${meta.timed ? 'Tap to start' : 'Tap to record'}<strong>${meta.label}</strong></span></button>`;
  }).join('');
  container.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((button) => {
    button.addEventListener('click', () => startAction(button.dataset.action as ActionType));
  });
}

function renderHistory(): void {
  const container = element<HTMLElement>('history-list');
  const events = sortedCompletedEvents(state).slice(0, 30);
  if (!events.length) {
    container.innerHTML = '<div class="history-empty">No completed actions yet. Your record will appear here.</div>';
    return;
  }
  container.innerHTML = `<ol class="history-list">${events.map((event) => {
    const corrected = state.corrections.some((correction) => correction.eventId === event.id && correction.reason !== 'Completed action');
    const duration = ACTION_META[event.type].timed && event.endAt ? formatDuration(event.endAt - event.startAt) : 'Instant';
    return `<li class="history-row"><span class="history-icon">${icon(event.type)}</span><span class="history-main"><strong>${ACTION_META[event.type].label}${corrected ? '<span class="correction-flag">Corrected</span>' : ''}</strong><span>${duration}${event.note ? ` · ${escapeHtml(event.note)}` : ''}</span></span><time class="history-when" datetime="${new Date(event.endAt!).toISOString()}">${dateLabel(event.endAt!)}<br>${timeLabel(event.endAt!)}</time><button class="icon-button" type="button" aria-label="Correct ${ACTION_META[event.type].label.toLowerCase()} from ${fullTimeLabel(event.endAt!)}" data-edit="${event.id}">•••</button></li>`;
  }).join('')}</ol>`;
  container.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach((button) => button.addEventListener('click', () => openCorrection(button.dataset.edit!)));
}

function renderConnect(): void {
  const container = element<HTMLElement>('connect-content');
  container.innerHTML = `<div class="connect-panel"><div><h3>Share with the next caregiver.</h3><p>Show an invitation on one device. Scan or paste it on the other. New care actions then appear on both boards.</p><p class="pair-status">${escapeHtml(pairStatus)}</p></div><div class="button-row"><button class="button button--primary" id="create-invite" type="button">Create invitation</button><button class="button button--secondary" id="join-invite" type="button">Join invitation</button></div></div>`;
  element<HTMLButtonElement>('create-invite').addEventListener('click', () => void createInvitation());
  element<HTMLButtonElement>('join-invite').addEventListener('click', openJoinInvitation);
}

function render(): void {
  const baby = state.settings.babyName.trim();
  element<HTMLElement>('baby-label').textContent = baby ? `${baby} · current care action` : 'Current care action';
  element<HTMLElement>('hero-line').textContent = baby ? `One clear answer for ${baby}’s next caregiver.` : 'For baby caregivers handing off feeds, sleep, medicine, and diapers.';
  renderLastAction();
  renderActiveAction();
  renderActions();
  renderHistory();
  renderConnect();
  const babyInput = element<HTMLInputElement>('baby-name');
  const caregiverInput = element<HTMLInputElement>('caregiver-name');
  if (document.activeElement !== babyInput) babyInput.value = state.settings.babyName;
  if (document.activeElement !== caregiverInput) caregiverInput.value = state.settings.caregiverName;
}

function openDialog(kicker: string, title: string, content: string): void {
  element<HTMLElement>('dialog-kicker').textContent = kicker;
  element<HTMLElement>('dialog-title').textContent = title;
  dialogBody.innerHTML = content;
  dialog.showModal();
}

function closeDialog(): void {
  cameraStream?.getTracks().forEach((track) => track.stop());
  cameraStream = undefined;
  dialog.close();
}

function openCorrection(id: string): void {
  const event = state.events.find((item) => item.id === id);
  if (!event || event.endAt === null) return;
  openDialog('Visible correction', `Correct ${ACTION_META[event.type].label.toLowerCase()}`, `<form class="dialog-form" id="correction-form"><label>Started<input type="datetime-local" id="correct-start" required value="${toLocalInput(event.startAt)}"></label><label>Ended<input type="datetime-local" id="correct-end" required value="${toLocalInput(event.endAt)}"></label><label>Note <span>(optional)</span><input id="correct-note" maxlength="120" value="${escapeHtml(event.note)}"></label><label>Reason for correction <span>(shown in correction history)</span><input id="correct-reason" required maxlength="120" value="Corrected time"></label><p class="field-error" id="correction-error" role="alert" hidden></p><details><summary>Correction history (${state.corrections.filter((item) => item.eventId === id).length})</summary><ol>${state.corrections.filter((item) => item.eventId === id).map((item) => `<li>${escapeHtml(item.reason)} · ${fullTimeLabel(item.at)}</li>`).join('') || '<li>No earlier corrections.</li>'}</ol></details><div class="dialog-actions"><button class="button button--danger" id="delete-event" type="button">Delete action</button><button class="button button--primary" type="submit">Save correction</button></div></form>`);
  element<HTMLFormElement>('correction-form').addEventListener('submit', (submitEvent) => {
    submitEvent.preventDefault();
    const startAt = new Date(element<HTMLInputElement>('correct-start').value).getTime();
    const endAt = new Date(element<HTMLInputElement>('correct-end').value).getTime();
    const error = element<HTMLElement>('correction-error');
    if (!Number.isFinite(startAt) || !Number.isFinite(endAt) || endAt < startAt) {
      error.textContent = 'End time must be the same as or later than start time.';
      error.hidden = false;
      return;
    }
    const before = snapshot(event);
    event.startAt = startAt;
    event.endAt = endAt;
    event.note = element<HTMLInputElement>('correct-note').value.trim();
    event.updatedAt = Date.now();
    event.revision += 1;
    addCorrection(event, before, element<HTMLInputElement>('correct-reason').value.trim() || 'Corrected details');
    closeDialog();
    void persist('Correction saved', true);
  });
  element<HTMLButtonElement>('delete-event').addEventListener('click', () => {
    if (!window.confirm(`Delete this ${ACTION_META[event.type].label.toLowerCase()} action? The deletion will remain in correction history.`)) return;
    const before = snapshot(event);
    event.deleted = true;
    event.updatedAt = Date.now();
    event.revision += 1;
    addCorrection(event, before, 'Deleted action');
    closeDialog();
    void persist('Action deleted', true);
  });
}

function wirePeer(link: PeerLink): void {
  peerLink?.close();
  peerLink = link;
  pairStatus = 'Waiting for the other device…';
  link.onStatus = (status) => {
    if (status === 'connected') {
      pairStatus = 'Connected · changes sync live';
      setConnection('Connected to caregiver');
      void link.send(state);
      showToast('Caregiver connected');
    } else if (status === 'connecting') pairStatus = 'Connecting…';
    else if (status === 'closed') pairStatus = 'Connection closed';
    else pairStatus = 'Connection interrupted · records are still saved locally';
    renderConnect();
  };
  link.onState = (incoming) => {
    const merged = mergeStates(state, incoming);
    if (incoming.settings.caregiverName.trim()) {
      pairStatus = `Connected to ${incoming.settings.caregiverName.trim()} · changes sync live`;
      setConnection(`Connected to ${incoming.settings.caregiverName.trim()}`);
    }
    if (merged.changed) {
      state = merged.state;
      void saveState(state, demoMode);
      void link.send(state);
      render();
      showToast(`Merged ${merged.changed} newer change${merged.changed === 1 ? '' : 's'}`);
    }
  };
}

function pairingOutput(title: string, code: string, nextLabel: string): string {
  return `<p>Let the other caregiver scan this code. Keep it private: anyone who sees it during pairing could join.</p><div class="qr-wrap"><canvas id="pair-qr" width="320" height="320" aria-label="Pairing QR code"></canvas></div><label>Pairing code <span>(copy this if camera scanning is unavailable)</span><textarea class="pair-code" id="pair-code" readonly>${code}</textarea></label><div class="dialog-actions"><button class="button button--ghost" id="copy-code" type="button">Copy code</button><button class="button button--primary" id="pair-next" type="button">${nextLabel}</button></div><p class="license-note">${title}</p>`;
}

async function createInvitation(): Promise<void> {
  openDialog('Encrypted pairing', 'Creating invitation…', '<p role="status">Preparing a direct connection on this device.</p>');
  try {
    const result = await PeerLink.createHost(demoMode);
    wirePeer(result.link);
    element<HTMLElement>('dialog-title').textContent = 'Scan on the second device';
    dialogBody.innerHTML = pairingOutput('Invitation expires when this dialog or app is closed.', result.invite, 'Enter their response');
    try { drawQr(element<HTMLCanvasElement>('pair-qr'), result.invite); } catch { element<HTMLElement>('pair-qr').hidden = true; }
    element<HTMLButtonElement>('copy-code').addEventListener('click', () => void copyPairingCode(result.invite).then(() => showToast('Pairing code copied')));
    element<HTMLButtonElement>('pair-next').addEventListener('click', () => {
      dialogBody.innerHTML = `<form class="dialog-form" id="answer-form"><p>The other caregiver will show a response code. Copy it on that device and paste it below.</p><label>Response code<textarea class="pair-code" id="answer-code" required></textarea></label><p class="field-error" id="answer-error" role="alert" hidden></p><div class="dialog-actions"><button class="button button--primary" type="submit">Finish pairing</button></div></form>`;
      element<HTMLFormElement>('answer-form').addEventListener('submit', (event) => {
        event.preventDefault();
        void result.link.acceptAnswer(element<HTMLTextAreaElement>('answer-code').value, demoMode).then(() => {
          closeDialog();
          pairStatus = 'Connecting…';
          renderConnect();
        }).catch((error: Error) => {
          const output = element<HTMLElement>('answer-error'); output.textContent = error.message; output.hidden = false;
        });
      });
    });
  } catch (error) {
    dialogBody.innerHTML = `<p role="alert">${escapeHtml(error instanceof Error ? error.message : 'Could not create an invitation.')}</p>`;
  }
}

function openJoinInvitation(): void {
  openDialog('Encrypted pairing', 'Join a caregiver', `<form class="dialog-form" id="invite-form"><p>Scan the invitation shown on the first device, or paste its pairing code.</p><button class="button button--secondary" id="scan-invite" type="button">Scan invitation QR</button><label>Invitation code<textarea class="pair-code" id="invite-code" required></textarea></label><p class="field-error" id="invite-error" role="alert" hidden></p><div class="dialog-actions"><button class="button button--primary" type="submit">Create response</button></div></form>`);
  element<HTMLButtonElement>('scan-invite').addEventListener('click', () => openScanner((code) => {
    openJoinInvitation();
    element<HTMLTextAreaElement>('invite-code').value = code;
  }));
  element<HTMLFormElement>('invite-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const code = element<HTMLTextAreaElement>('invite-code').value;
    dialogBody.innerHTML = '<p role="status">Creating the encrypted response…</p>';
    void PeerLink.join(code, demoMode).then((result) => {
      wirePeer(result.link);
      element<HTMLElement>('dialog-title').textContent = 'Return this response';
      dialogBody.innerHTML = pairingOutput('Keep this screen open until the first device says connected.', result.answer, 'Done');
      try { drawQr(element<HTMLCanvasElement>('pair-qr'), result.answer); } catch { element<HTMLElement>('pair-qr').hidden = true; }
      element<HTMLButtonElement>('copy-code').addEventListener('click', () => void copyPairingCode(result.answer).then(() => showToast('Response code copied')));
      element<HTMLButtonElement>('pair-next').addEventListener('click', closeDialog);
    }).catch((error: Error) => {
      dialogBody.innerHTML = `<p role="alert">${escapeHtml(error.message)}</p><button class="button button--secondary" id="try-join-again" type="button">Try again</button>`;
      element<HTMLButtonElement>('try-join-again').addEventListener('click', openJoinInvitation);
    });
  });
}

function openScanner(onResult: (code: string) => void): void {
  const detectorConstructor = (window as unknown as { BarcodeDetector?: new (options: { formats: string[] }) => { detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>> } }).BarcodeDetector;
  if (!detectorConstructor || !navigator.mediaDevices?.getUserMedia) {
    showToast('QR scanning is not supported here. Copy and paste the code instead.');
    return;
  }
  openDialog('Camera scanner', 'Hold the QR inside the frame', '<div class="camera-wrap"><video id="scanner-video" autoplay playsinline muted></video><span class="camera-frame" aria-hidden="true"></span></div><p id="scanner-status" role="status">Starting camera…</p>');
  const video = element<HTMLVideoElement>('scanner-video');
  const status = element<HTMLElement>('scanner-status');
  const detector = new detectorConstructor({ formats: ['qr_code'] });
  void navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false }).then((stream) => {
    cameraStream = stream;
    video.srcObject = stream;
    status.textContent = 'Looking for a pairing QR code…';
    const scan = async () => {
      if (!cameraStream || dialog.open === false) return;
      try {
        const codes = await detector.detect(video);
        if (codes[0]?.rawValue) {
          const value = codes[0].rawValue;
          closeDialog();
          onResult(value);
          return;
        }
      } catch { /* the video may not be ready yet */ }
      window.setTimeout(() => void scan(), 450);
    };
    void scan();
  }).catch(() => { status.textContent = 'Camera access was unavailable. Close this and paste the pairing code instead.'; });
}

function download(filename: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function exportCsv(): void {
  const quote = (value: string | number | null) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const rows = [['type', 'started_at', 'ended_at', 'duration_minutes', 'note', 'last_updated_at']];
  for (const event of sortedCompletedEvents(state)) rows.push([
    event.type, new Date(event.startAt).toISOString(), new Date(event.endAt!).toISOString(), String(Math.round((event.endAt! - event.startAt) / 60_000)), event.note, new Date(event.updatedAt).toISOString(),
  ]);
  download(`caregiver-last-action-${new Date().toISOString().slice(0, 10)}.csv`, rows.map((row) => row.map(quote).join(',')).join('\n'), 'text/csv');
}

function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  let updateRequested = false;
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').then((registration) => {
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            showToast('An app update is ready', { label: 'Update', run: () => {
              updateRequested = true;
              registration.waiting?.postMessage('SKIP_WAITING');
            } });
          }
        });
      });
    });
    // The first controller change is normal registration. Reloading there tears
    // down in-flight work and made offline startup unreliable. Only reload when
    // a person explicitly accepted a later update.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (updateRequested) window.location.reload();
    });
  });
}

function updateOnlineState(): void {
  const offline = forcedOffline || !navigator.onLine || !networkReachable;
  element<HTMLElement>('offline-banner').hidden = !offline;
  if (offline) setConnection('Offline · saved locally', 'offline');
  else setConnection(peerLink ? pairStatus : 'Saved on this device');
}

function updateMobileNavigation(): void {
  const navigation = document.querySelector<HTMLElement>('.bottom-nav');
  if (!navigation) return;
  const visible = window.matchMedia('(max-width: 760px)').matches && window.scrollY > 420;
  navigation.classList.toggle('is-visible', visible);
  navigation.toggleAttribute('inert', !visible);
  navigation.setAttribute('aria-hidden', String(!visible));
}

async function checkConnectivity(): Promise<void> {
  if (!navigator.onLine) {
    networkReachable = false;
    updateOnlineState();
    return;
  }
  try {
    const response = await fetch(`/manifest.json?connectivity=${Date.now()}`, { cache: 'no-store' });
    networkReachable = response.ok;
  } catch {
    networkReachable = false;
  }
  updateOnlineState();
}

async function initialize(): Promise<void> {
  document.title = demoMode ? 'Demo — Caregiver Last Action' : 'Caregiver Last Action — last baby-care action';
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = demoMode ? `${location.origin}/demo` : `${location.origin}/`;
  element<HTMLElement>('demo-banner').hidden = !demoMode;
  try {
    state = await loadState(deviceId, demoMode);
    if (demoMode && state.events.length === 0) {
      state = sampleState();
      await saveState(state, true);
    }
    loading.hidden = true;
    main.hidden = false;
    document.querySelectorAll<HTMLElement>('.bottom-nav, .site-footer').forEach((item) => { item.hidden = false; });
    updateMobileNavigation();
    render();
    updateOnlineState();
    void checkConnectivity();
    window.requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLHeadingElement>('h1');
      heading?.focus();
      element<HTMLElement>('route-announcer').textContent = demoMode ? 'Demo board opened' : 'Caregiver Last Action opened';
    });
  } catch (error) {
    loading.innerHTML = `<strong>Could not open the local record.</strong><span>${escapeHtml(error instanceof Error ? error.message : 'Reload and try again.')}</span><button class="button button--primary" type="button" onclick="location.reload()">Reload</button>`;
    return;
  }

}

element<HTMLButtonElement>('close-dialog').addEventListener('click', closeDialog);
dialog.addEventListener('click', (event) => { if (event.target === dialog) closeDialog(); });
element<HTMLFormElement>('settings-form').addEventListener('submit', (event) => {
  event.preventDefault();
  state.settings = {
    babyName: element<HTMLInputElement>('baby-name').value.trim(),
    caregiverName: element<HTMLInputElement>('caregiver-name').value.trim(),
    updatedAt: Date.now(), deviceId,
  };
  void persist('Names saved', true);
});
element<HTMLButtonElement>('export-csv').addEventListener('click', exportCsv);
element<HTMLButtonElement>('export-json').addEventListener('click', () => download(`caregiver-last-action-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(state, null, 2), 'application/json'));
element<HTMLButtonElement>('import-json').addEventListener('click', () => element<HTMLInputElement>('import-file').click());
element<HTMLInputElement>('import-file').addEventListener('change', (event) => {
  const file = (event.currentTarget as HTMLInputElement).files?.[0];
  if (!file) return;
  void file.text().then((text) => {
    const incoming = validateImportedState(JSON.parse(text) as unknown);
    const merged = mergeStates(state, incoming);
    state = merged.state;
    void persist(`Imported ${merged.changed} newer change${merged.changed === 1 ? '' : 's'}`, true);
  }).catch((error: Error) => showToast(error.message || 'That backup could not be imported.'));
});
element<HTMLButtonElement>('reset-demo').addEventListener('click', () => {
  if (!demoMode) return;
  void clearDemoState().then(() => location.reload()).catch(() => showToast('The sample could not be reset. Reload and try again.'));
});
broadcast.addEventListener('message', (event: MessageEvent<AppState>) => {
  if (!state) return;
  const merged = mergeStates(state, event.data);
  if (merged.changed) {
    state = merged.state;
    void saveState(state, demoMode);
    render();
  }
});
window.addEventListener('online', () => { forcedOffline = false; networkReachable = true; void checkConnectivity(); });
window.addEventListener('offline', () => { forcedOffline = true; networkReachable = false; updateOnlineState(); });
window.addEventListener('scroll', updateMobileNavigation, { passive: true });
window.addEventListener('resize', updateMobileNavigation);
window.setInterval(() => {
  if (!state) return;
  element<HTMLElement>('current-time').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' }).format(Date.now());
  renderLastAction();
  renderActiveAction();
}, 30_000);
element<HTMLElement>('current-time').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' }).format(Date.now());

if (import.meta.env.PROD) registerServiceWorker();
void initialize();

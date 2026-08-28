import qrcode from 'qrcode-generator';
import type { AppState } from './types';

interface InviteSignal {
  v: 1;
  k: string;
  s: RTCSessionDescriptionInit;
}

interface AnswerSignal {
  v: 1;
  s: RTCSessionDescriptionInit;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const binary = atob(normalized + '='.repeat((4 - (normalized.length % 4)) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function packSignal(value: InviteSignal | AnswerSignal): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  if ('CompressionStream' in window) {
    const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
    return `cla1.z.${bytesToBase64(new Uint8Array(await new Response(stream).arrayBuffer()))}`;
  }
  return `cla1.j.${bytesToBase64(bytes)}`;
}

async function unpackSignal<T>(value: string): Promise<T> {
  const clean = value.trim();
  const parts = clean.split('.');
  if (parts.length !== 3 || parts[0] !== 'cla1') throw new Error('This is not a valid pairing code.');
  let bytes = base64ToBytes(parts[2] ?? '');
  if (parts[1] === 'z') {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  } else if (parts[1] !== 'j') {
    throw new Error('This pairing code uses an unsupported format.');
  }
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

function waitForIceGathering(peer: RTCPeerConnection): Promise<void> {
  if (peer.iceGatheringState === 'complete') return Promise.resolve();
  return new Promise((resolve) => {
    const timeout = window.setTimeout(resolve, 8_000);
    const listener = () => {
      if (peer.iceGatheringState === 'complete') {
        window.clearTimeout(timeout);
        peer.removeEventListener('icegatheringstatechange', listener);
        resolve();
      }
    };
    peer.addEventListener('icegatheringstatechange', listener);
  });
}

export class PeerLink {
  private channel?: RTCDataChannel;
  private key?: CryptoKey;
  private readonly peer: RTCPeerConnection;
  private readonly secret: Uint8Array<ArrayBuffer>;
  onState?: (state: AppState) => void;
  onStatus?: (status: 'connecting' | 'connected' | 'closed' | 'error') => void;

  private constructor(peer: RTCPeerConnection, secret: Uint8Array<ArrayBuffer>) {
    this.peer = peer;
    this.secret = secret;
    peer.addEventListener('connectionstatechange', () => {
      const status = peer.connectionState;
      if (status === 'connected') this.onStatus?.('connected');
      else if (status === 'failed' || status === 'disconnected') this.onStatus?.('error');
      else if (status === 'closed') this.onStatus?.('closed');
      else this.onStatus?.('connecting');
    });
  }

  static async createHost(): Promise<{ invite: string; link: PeerLink }> {
    const peer = new RTCPeerConnection({ iceServers: [] });
    const secret = crypto.getRandomValues(new Uint8Array(32));
    const link = new PeerLink(peer, secret);
    link.attachChannel(peer.createDataChannel('care-record', { ordered: true }));
    await peer.setLocalDescription(await peer.createOffer());
    await waitForIceGathering(peer);
    return {
      invite: await packSignal({ v: 1, k: bytesToBase64(secret), s: peer.localDescription! }),
      link,
    };
  }

  static async join(invite: string): Promise<{ answer: string; link: PeerLink }> {
    const signal = await unpackSignal<InviteSignal>(invite);
    if (signal.v !== 1 || !signal.k || signal.s.type !== 'offer') throw new Error('This pairing invitation is incomplete.');
    const peer = new RTCPeerConnection({ iceServers: [] });
    const link = new PeerLink(peer, base64ToBytes(signal.k));
    peer.addEventListener('datachannel', (event) => link.attachChannel(event.channel));
    await peer.setRemoteDescription(signal.s);
    await peer.setLocalDescription(await peer.createAnswer());
    await waitForIceGathering(peer);
    return { answer: await packSignal({ v: 1, s: peer.localDescription! }), link };
  }

  async acceptAnswer(answer: string): Promise<void> {
    const signal = await unpackSignal<AnswerSignal>(answer);
    if (signal.v !== 1 || signal.s.type !== 'answer') throw new Error('This is not the answer for a pairing invitation.');
    await this.peer.setRemoteDescription(signal.s);
  }

  private attachChannel(channel: RTCDataChannel): void {
    this.channel = channel;
    channel.addEventListener('open', () => this.onStatus?.('connected'));
    channel.addEventListener('close', () => this.onStatus?.('closed'));
    channel.addEventListener('error', () => this.onStatus?.('error'));
    channel.addEventListener('message', (event) => void this.receive(String(event.data)));
  }

  private async getKey(): Promise<CryptoKey> {
    this.key ??= await crypto.subtle.importKey('raw', this.secret, 'AES-GCM', false, ['encrypt', 'decrypt']);
    return this.key;
  }

  private async receive(message: string): Promise<void> {
    try {
      const envelope = JSON.parse(message) as { i: string; d: string };
      const clear = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: base64ToBytes(envelope.i) },
        await this.getKey(),
        base64ToBytes(envelope.d),
      );
      const state = JSON.parse(new TextDecoder().decode(clear)) as AppState;
      if (state.version === 1 && Array.isArray(state.events)) this.onState?.(state);
    } catch {
      this.onStatus?.('error');
    }
  }

  async send(state: AppState): Promise<boolean> {
    if (this.channel?.readyState !== 'open') return false;
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      await this.getKey(),
      new TextEncoder().encode(JSON.stringify(state)),
    );
    this.channel.send(JSON.stringify({ i: bytesToBase64(iv), d: bytesToBase64(new Uint8Array(encrypted)) }));
    return true;
  }

  close(): void {
    this.channel?.close();
    this.peer.close();
  }
}

export function drawQr(canvas: HTMLCanvasElement, value: string): void {
  const qr = qrcode(0, 'L');
  qr.addData(value, 'Byte');
  qr.make();
  const count = qr.getModuleCount();
  const quiet = 4;
  const size = 320;
  const cell = size / (count + quiet * 2);
  const context = canvas.getContext('2d');
  if (!context) return;
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, size, size);
  context.fillStyle = '#102027';
  for (let row = 0; row < count; row += 1) {
    for (let column = 0; column < count; column += 1) {
      if (qr.isDark(row, column)) {
        context.fillRect(
          Math.floor((column + quiet) * cell),
          Math.floor((row + quiet) * cell),
          Math.ceil(cell),
          Math.ceil(cell),
        );
      }
    }
  }
}

export async function copyPairingCode(code: string): Promise<void> {
  await navigator.clipboard.writeText(code);
}

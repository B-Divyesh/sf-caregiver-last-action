export const LICENSE_KEY = 'sb_license:caregiver-last-action';
const VERDICT_KEY = 'sb_license_verdict:caregiver-last-action';
const DAY = 86_400_000;
const BILLING_BASE = import.meta.env.VITE_BILLING_BASE_URL || 'https://api.sociobot.in';

interface CachedVerdict {
  valid: boolean;
  checkedAt: number;
  reason: string;
}

export interface LicenseState {
  unlocked: boolean;
  checking: boolean;
  message: string;
}

export const checkoutUrl = `${BILLING_BASE}/api/v1/products/caregiver-last-action/checkout`;

function readVerdict(): CachedVerdict | null {
  try {
    return JSON.parse(localStorage.getItem(VERDICT_KEY) ?? 'null') as CachedVerdict | null;
  } catch {
    return null;
  }
}

export function captureLicenseFromUrl(): boolean {
  const url = new URL(window.location.href);
  const license = url.searchParams.get('license');
  if (!license) return false;
  localStorage.setItem(LICENSE_KEY, license.trim());
  localStorage.removeItem(VERDICT_KEY);
  url.searchParams.delete('license');
  history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  return true;
}

export function cachedLicenseState(): LicenseState {
  const token = localStorage.getItem(LICENSE_KEY);
  const verdict = readVerdict();
  if (!token) return { unlocked: false, checking: false, message: '' };
  if (verdict?.valid) return { unlocked: true, checking: false, message: 'Household pass active' };
  return { unlocked: false, checking: true, message: 'Checking household pass…' };
}

export async function verifyLicense(force = false): Promise<LicenseState> {
  const token = localStorage.getItem(LICENSE_KEY)?.trim();
  if (!token) return { unlocked: false, checking: false, message: '' };
  const cached = readVerdict();
  if (!force && cached && Date.now() - cached.checkedAt < DAY) {
    return {
      unlocked: cached.valid,
      checking: false,
      message: cached.valid ? 'Household pass active' : 'License no longer active',
    };
  }
  try {
    const response = await fetch(`${BILLING_BASE}/api/v1/products/caregiver-last-action/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification service unavailable.');
    const result = await response.json() as { valid: boolean; reason: string };
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: result.valid, reason: result.reason, checkedAt: Date.now() }));
    return {
      unlocked: result.valid,
      checking: false,
      message: result.valid ? 'Household pass active' : 'License no longer active',
    };
  } catch {
    if (cached?.valid) return { unlocked: true, checking: false, message: 'Pass active · verification pending' };
    return { unlocked: false, checking: false, message: 'Could not verify the license. Check your connection and try again.' };
  }
}

export function restoreLicense(token: string): void {
  const clean = token.trim();
  if (!clean) throw new Error('Paste the license token from your receipt.');
  localStorage.setItem(LICENSE_KEY, clean);
  localStorage.removeItem(VERDICT_KEY);
}

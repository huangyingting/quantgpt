export const INVITE_ONLY_ADMISSION = true;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeAccountEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidAccountEmail(email: string): boolean {
  const normalized = normalizeAccountEmail(email);
  return normalized.length >= 3 && normalized.length <= 254 && EMAIL_PATTERN.test(normalized);
}

export function isValidRole(role: string): role is 'ADMIN' | 'PRO' | 'MEMBER' {
  return role === 'ADMIN' || role === 'PRO' || role === 'MEMBER';
}

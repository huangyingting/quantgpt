import bcrypt from 'bcryptjs';
import { AccountAdmissionError } from './errors';

const PASSWORD_MIN_LENGTH = 10;
const PASSWORD_MAX_LENGTH = 128;
const BCRYPT_ROUNDS = 12;

export function passwordPolicyError(password: string): string | null {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`;
  }
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  const err = passwordPolicyError(password);
  if (err) {
    throw new AccountAdmissionError(400, 'invalid_password', err);
  }
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string | null | undefined): Promise<boolean> {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

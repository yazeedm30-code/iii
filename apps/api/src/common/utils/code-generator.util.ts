import { randomBytes, randomInt } from 'node:crypto';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateNumericCode(length: number): string {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += randomInt(0, 10).toString();
  }
  return out;
}

export function generateAlphanumericCode(length: number): string {
  let out = '';
  const bytes = randomBytes(length);
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

export function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const tail = generateAlphanumericCode(4);
  return `O-${ts}-${tail}`;
}

export function generatePickupCode(): string {
  return generateNumericCode(4);
}

export function generateReferralCode(): string {
  return generateAlphanumericCode(8);
}

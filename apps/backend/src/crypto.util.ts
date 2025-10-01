import * as crypto from 'crypto';
import { ENCRYPTION_CONSTANTS } from '@falcon-eye/common';

const { ALGO, IV_LEN, AUTH_TAG_LEN } = ENCRYPTION_CONSTANTS;

function getMasterKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY not set');
  }
  return key;
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(
    ALGO,
    Buffer.from(getMasterKey(), 'base64'),
    iv,
  );
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  // store iv + tag + ciphertext in base64
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decrypt(enc: string): string {
  const data = Buffer.from(enc, 'base64');
  const iv = data.slice(0, IV_LEN);
  const tag = data.slice(IV_LEN, IV_LEN + AUTH_TAG_LEN);
  const ciphertext = data.slice(IV_LEN + AUTH_TAG_LEN);
  const decipher = crypto.createDecipheriv(
    ALGO,
    Buffer.from(getMasterKey(), 'base64'),
    iv,
  );
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

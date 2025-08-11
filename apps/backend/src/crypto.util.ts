import * as crypto from 'crypto';
import { config } from 'dotenv';

config();

const ALGO = 'aes-256-gcm';
const IV_LEN = 12; // recommended for GCM
const AUTH_TAG_LEN = 16;

const MASTER_KEY = process.env.ENCRYPTION_KEY; // 32 bytes base64 or raw

if (!MASTER_KEY) {
  throw new Error('ENCRYPTION_KEY not set');
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(
    ALGO,
    Buffer.from(MASTER_KEY, 'base64'),
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
    Buffer.from(MASTER_KEY, 'base64'),
    iv,
  );
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

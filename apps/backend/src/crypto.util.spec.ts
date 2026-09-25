import { randomBytes } from 'crypto';
import { decrypt, encrypt } from './crypto.util';

describe('crypto.util', () => {
  const originalKey = process.env.ENCRYPTION_KEY;
  const newKey = () => randomBytes(32).toString('base64');

  beforeEach(() => {
    process.env.ENCRYPTION_KEY = newKey();
  });
  afterAll(() => {
    process.env.ENCRYPTION_KEY = originalKey;
  });

  it('round-trips a token', () => {
    const token = 'ATATT3xFfGF0-example-token';
    expect(decrypt(encrypt(token))).toBe(token);
  });

  it('never repeats a ciphertext for the same input (random IV)', () => {
    expect(encrypt('same token')).not.toBe(encrypt('same token'));
  });

  it('does not contain the plaintext', () => {
    expect(
      Buffer.from(encrypt('visible-secret'), 'base64').toString('utf8'),
    ).not.toContain('visible-secret');
  });

  it('detects tampering with the stored value', () => {
    const data = Buffer.from(encrypt('token'), 'base64');
    data[data.length - 1] ^= 0xff; // flip a bit in the ciphertext
    expect(() => decrypt(data.toString('base64'))).toThrow();
  });

  it('cannot be decrypted with a different key', () => {
    const encrypted = encrypt('token');
    process.env.ENCRYPTION_KEY = newKey();
    expect(() => decrypt(encrypted)).toThrow();
  });

  it('fails loudly when ENCRYPTION_KEY is missing', () => {
    delete process.env.ENCRYPTION_KEY;
    expect(() => encrypt('token')).toThrow('ENCRYPTION_KEY not set');
  });
});

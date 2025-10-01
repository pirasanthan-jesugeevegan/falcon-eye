export const ENCRYPTION_CONSTANTS = {
  ALGO: 'aes-256-gcm' as const,
  IV_LEN: 12, // recommended for GCM
  AUTH_TAG_LEN: 16,
};

const SPACES_VARS = [
  'SPACES_ENDPOINT',
  'SPACES_REGION',
  'SPACES_BUCKET',
  'SPACES_ACCESS_KEY',
  'SPACES_SECRET_KEY',
  'SPACES_CDN_URL',
] as const;

export function assertProductionEnv() {
  if (process.env.NODE_ENV !== 'production') return;

  const secret = process.env.JWT_SECRET ?? '';
  if (!secret || secret.length < 32 || secret.includes('change-me')) {
    throw new Error('JWT_SECRET must be set to a random string of at least 32 characters in production');
  }

  const missingSpaces = SPACES_VARS.filter((k) => !process.env[k]?.trim());
  if (missingSpaces.length) {
    throw new Error(
      `DigitalOcean Spaces is required in production. Missing: ${missingSpaces.join(', ')}`,
    );
  }
}

export function assertProductionEnv() {
  if (process.env.NODE_ENV !== 'production') return;

  const secret = process.env.JWT_SECRET ?? '';
  if (!secret || secret.length < 32 || secret.includes('change-me')) {
    throw new Error('JWT_SECRET must be set to a random string of at least 32 characters in production');
  }
}

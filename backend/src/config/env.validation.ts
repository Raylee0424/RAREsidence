const MIN_SECRET_LENGTH = 32;

// Runs once at startup; the app refuses to boot with a missing or weak secret
// instead of silently signing tokens with something guessable.
export function validateEnv(config: Record<string, unknown>) {
  const secret = config.JWT_SECRET;
  if (typeof secret !== 'string' || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be set to at least ${MIN_SECRET_LENGTH} characters. ` +
        'Copy .env.example to .env and generate one with: ' +
        `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`,
    );
  }
  return config;
}

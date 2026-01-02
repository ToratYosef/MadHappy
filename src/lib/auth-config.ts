export const authSecret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'dev-secret';

if (!process.env.NEXTAUTH_SECRET && !process.env.AUTH_SECRET) {
  console.warn(
    '[auth] NEXTAUTH_SECRET (or AUTH_SECRET) is not set. Using a fallback secret for development. Set one in production.'
  );
}

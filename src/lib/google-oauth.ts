/** Real Google OAuth client IDs end with `.apps.googleusercontent.com` */
export function isGoogleOAuthConfigured(): boolean {
  const id = process.env.AUTH_GOOGLE_ID?.trim();
  const secret = process.env.AUTH_GOOGLE_SECRET?.trim();
  return (
    !!id &&
    !!secret &&
    id.includes(".apps.googleusercontent.com") &&
    !id.startsWith("qa-") &&
    secret.length > 10
  );
}

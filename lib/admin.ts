/**
 * Admin access control — email-based allowlist.
 * Add more admin emails to the ADMIN_EMAILS env var (comma-separated).
 */
export const ADMIN_EMAILS: string[] = (
  process.env.ADMIN_EMAILS ?? "armanesajjadian@gmail.com"
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

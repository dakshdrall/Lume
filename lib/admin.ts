import "server-only";
import { getAuthClient } from "./supabase/server";

/** ADMIN_EMAILS: comma-separated, case-insensitive, whitespace-trimmed. Empty/unset = nobody is admin. */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}

export type AdminSession =
  | { status: "unconfigured" }
  | { status: "signed-out" }
  | { status: "forbidden"; email: string }
  | { status: "ok"; email: string };

/**
 * Resolves the current visitor against the allowlist. getUser() validates the JWT with Supabase
 * (never trust the cookie alone), and the email must be confirmed: otherwise anyone could call
 * Supabase's public signUp API with an admin's address and receive a session without owning the inbox.
 */
export async function getAdminSession(): Promise<AdminSession> {
  const supabase = getAuthClient();
  if (!supabase) return { status: "unconfigured" };
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user?.email) return { status: "signed-out" };
  if (!user.email_confirmed_at || !isAllowedAdmin(user.email)) return { status: "forbidden", email: user.email };
  return { status: "ok", email: user.email };
}

/** Returns the signed-in admin's email, or null if not signed in / not allowlisted. */
export async function requireAdmin(): Promise<{ email: string } | null> {
  const session = await getAdminSession();
  return session.status === "ok" ? { email: session.email } : null;
}

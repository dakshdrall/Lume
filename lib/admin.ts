import "server-only";
import { getAuthClient } from "./supabase/server";

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

/** Returns the signed-in admin's email, or null if not signed in / not allowlisted. */
export async function requireAdmin(): Promise<{ email: string } | null> {
  const supabase = getAuthClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email;
  return email && isAllowedAdmin(email) ? { email } : null;
}

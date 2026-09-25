"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAuthClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { isAllowedAdmin, requireAdmin } from "@/lib/admin";
import { SITE_URL } from "@/lib/site";

export type LoginState = { message: string; ok: boolean } | null;

export async function sendMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = z.string().trim().toLowerCase().email().safeParse(formData.get("email"));
  if (!parsed.success) return { ok: false, message: "Enter a valid email address." };
  const email = parsed.data;

  // Same response whether or not the email is allowlisted, so nobody can probe for admins.
  const generic: LoginState = { ok: true, message: "If that email is allowed, a sign-in link is on its way." };
  if (!isAllowedAdmin(email)) return generic;

  const supabase = getAuthClient();
  if (!supabase) return { ok: false, message: "Supabase isn't configured." };

  const origin = headers().get("origin") || SITE_URL;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback`, shouldCreateUser: true },
  });
  if (error) {
    console.error("magic link error", error.message);
    return { ok: false, message: "Couldn't send the link. Try again in a minute." };
  }
  return generic;
}

export async function signOut() {
  const supabase = getAuthClient();
  await supabase?.auth.signOut();
  redirect("/admin");
}

export async function deleteSignup(id: string): Promise<{ ok: boolean }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false };
  if (!z.string().uuid().safeParse(id).success) return { ok: false };

  const db = getAdminClient();
  if (!db) return { ok: false };
  const { error } = await db.from("waitlist").delete().eq("id", id);
  if (error) {
    console.error("delete error", error.message);
    return { ok: false };
  }
  console.info(`waitlist row ${id} deleted by ${admin.email}`);
  revalidatePath("/admin");
  revalidatePath("/api/count");
  return { ok: true };
}

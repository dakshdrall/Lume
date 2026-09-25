import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getAuthClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const OTP_TYPES: EmailOtpType[] = ["email", "magiclink", "signup"];

// Magic-link landing: turn the link into a session cookie, then always go to /admin
// (a fixed destination, so this can't be used as an open redirect).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const supabase = getAuthClient();
  if (!supabase) return NextResponse.redirect(`${origin}/admin?error=link`);

  // Default flow (PKCE): works when the link is opened in the same browser that requested it.
  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/admin`);
  }

  // Token-hash flow: works across browsers/devices (e.g. link opened in the Gmail app).
  // Requires the Supabase email templates described in the README.
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  if (tokenHash && type && OTP_TYPES.includes(type)) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(`${origin}/admin`);
  }

  return NextResponse.redirect(`${origin}/admin?error=link`);
}

import { NextResponse, type NextRequest } from "next/server";
import { getAuthClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Magic-link landing: swap the one-time code for a session cookie, then go to /admin.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const supabase = getAuthClient();

  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/admin`);
  }
  return NextResponse.redirect(`${origin}/admin?error=link`);
}

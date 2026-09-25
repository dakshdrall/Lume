import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

// Cached for 60s at the edge / data cache, so the counter never hammers the database.
export const revalidate = 60;

export async function GET() {
  const supabase = getAdminClient();
  let count: number | null = null;

  if (supabase) {
    const { data, error } = await supabase.rpc("get_waitlist_count");
    if (!error && typeof data === "number") count = data;
    else if (error) console.error("count error", error.message);
  }

  return NextResponse.json(
    { count },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}

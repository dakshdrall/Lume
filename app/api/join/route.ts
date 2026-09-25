import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { clientIp, hashIp } from "@/lib/request";
import { verifyTurnstile } from "@/lib/turnstile";
import { toFieldErrors, waitlistSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  // Only accept same-origin JSON posts.
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return json({ status: "error", message: "Unsupported content type." }, 415);
  }
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return json({ status: "error", message: "Forbidden." }, 403);
  }

  let body: Record<string, unknown>;
  try {
    const parsed = await req.json();
    if (!parsed || typeof parsed !== "object") throw new Error();
    body = parsed as Record<string, unknown>;
  } catch {
    return json({ status: "error", message: "Invalid request." }, 400);
  }

  // Honeypot: pretend it worked so bots learn nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return json({ status: "ok" });
  }

  const result = waitlistSchema.safeParse(body);
  if (!result.success) {
    return json({ status: "invalid", errors: toFieldErrors(result.error) }, 400);
  }

  const ip = clientIp(req.headers);
  if (!(await verifyTurnstile(body.token, ip))) {
    return json({ status: "error", message: "Verification failed. Please try the check again." }, 403);
  }

  const supabase = getAdminClient();
  if (!supabase) {
    return json({ status: "error", message: "The waitlist isn't open yet. Please try again soon." }, 503);
  }

  const limit = Number(process.env.RATE_LIMIT_PER_HOUR) || 5;
  const { data: allowed, error: rlError } = await supabase.rpc("hit_rate_limit", {
    p_key: `join:${hashIp(ip ?? "unknown")}`,
    p_limit: limit,
    p_window_seconds: 3600,
  });
  if (rlError) {
    console.error("rate limit error", rlError.message);
    return json({ status: "error", message: "Something went wrong. Please try again." }, 500);
  }
  if (allowed === false) {
    return json({ status: "rate_limited", message: "Too many attempts. Please try again later." }, 429);
  }

  const { name, email, year, isAdult, consent } = result.data;
  const { error } = await supabase.from("waitlist").insert({
    name,
    email,
    year,
    is_adult: isAdult,
    consent,
  });

  if (error) {
    if (error.code === "23505") return json({ status: "duplicate" }, 409);
    console.error("waitlist insert error", error.message);
    return json({ status: "error", message: "Something went wrong. Please try again." }, 500);
  }

  return json({ status: "ok" }, 201);
}

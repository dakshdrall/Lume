import "server-only";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: unknown, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Allow local development without Turnstile, but never in production.
    return process.env.NODE_ENV !== "production";
  }
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { success?: boolean; action?: string };
    // Test keys return action "test"; real keys echo the action set on the widget.
    return data.success === true && (!data.action || data.action === "waitlist" || data.action === "test");
  } catch {
    return false;
  }
}

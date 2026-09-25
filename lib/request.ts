import "server-only";
import { createHash } from "crypto";

export function clientIp(headers: Headers): string | null {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim() || null;
  return headers.get("x-real-ip");
}

/** Salted hash so raw IP addresses are never stored. */
export function hashIp(ip: string): string {
  const salt = process.env.RATE_LIMIT_SALT || "lume";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

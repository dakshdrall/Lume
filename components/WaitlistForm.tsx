"use client";

import { useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import Link from "next/link";
import { YEARS, toFieldErrors, waitlistSchema, type FieldErrors } from "@/lib/validation";
import { Turnstile, type TurnstileHandle } from "./Turnstile";
import { WaitlistCounter } from "./WaitlistCounter";
import { useWaitlist } from "./WaitlistContext";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "joined"; name: string }
  | { kind: "duplicate" };

export function WaitlistForm() {
  const { increment } = useWaitlist();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const turnstile = useRef<TurnstileHandle>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const fd = new FormData(e.currentTarget);
    const raw = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      year: String(fd.get("year") ?? ""),
      isAdult: fd.get("isAdult") === "on",
      consent: fd.get("consent") === "on",
    };

    const parsed = waitlistSchema.safeParse(raw);
    if (!parsed.success) {
      const fe = toFieldErrors(parsed.error);
      setErrors(fe);
      focusFirstError(fe);
      return;
    }
    setErrors({});

    if (SITE_KEY && !token) {
      setFormError("Please complete the quick check above the button.");
      return;
    }

    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, website: String(fd.get("website") ?? ""), token }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        status?: string;
        errors?: FieldErrors;
        message?: string;
      };

      if (res.ok && data.status === "ok") {
        increment();
        setStatus({ kind: "joined", name: parsed.data.name });
        return;
      }
      if (res.status === 409 || data.status === "duplicate") {
        setStatus({ kind: "duplicate" });
        return;
      }

      setStatus({ kind: "idle" });
      turnstile.current?.reset();
      if (res.status === 400 && data.errors) {
        setErrors(data.errors);
        focusFirstError(data.errors);
      } else if (res.status === 429) {
        setFormError("Too many attempts from this network. Please try again in an hour.");
      } else {
        setFormError(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus({ kind: "idle" });
      turnstile.current?.reset();
      setFormError("Couldn't reach the server. Check your connection and try again.");
    }
  }

  function focusFirstError(fe: FieldErrors) {
    const order: (keyof FieldErrors)[] = ["name", "email", "year", "isAdult", "consent"];
    const first = order.find((k) => fe[k]);
    if (!first) return;
    const el = formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`);
    el?.focus();
  }

  const clearError = (key: keyof FieldErrors) => {
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const done = status.kind === "joined" || status.kind === "duplicate";

  return (
    <section id="waitlist" aria-labelledby="waitlist-title" className="container-page scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto max-w-xl rounded-card-lg border border-line bg-surface p-6 shadow-[0_30px_80px_-50px_rgb(var(--accent)/0.55)] sm:p-10">
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <m.div
              key="done"
              role="status"
              className="py-8 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <span className="glow-dot h-3 w-3" aria-hidden="true" />
              <h2 id="waitlist-title" className="mt-6 font-serif text-[clamp(2.2rem,8vw,3.2rem)] leading-[1.05] text-ink">
                {status.kind === "joined" ? (
                  <>
                    You&apos;re on the list, <em className="italic text-accent">{status.name}.</em>
                  </>
                ) : (
                  <>You&apos;re already on the list!</>
                )}
              </h2>
              <p className="mx-auto mt-4 max-w-sm text-muted">
                We&apos;ll only email you about the launch. Nothing else, promise.
              </p>
              <WaitlistCounter className="mt-8 justify-center" />
            </m.div>
          ) : (
            <m.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              <h2 id="waitlist-title" className="font-serif text-[clamp(2.2rem,8vw,3.2rem)] leading-[1.05] text-ink">
                Get in <em className="italic text-accent">early.</em>
              </h2>
              <p className="mt-3 text-muted">
                Join the waitlist and we&apos;ll let you know the moment lume opens for IITM Janakpuri.
              </p>

              <form ref={formRef} onSubmit={onSubmit} noValidate className="relative mt-8 flex flex-col gap-5">
                {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                  <label>
                    Website
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>

                <Field id="name" label="First name" error={errors.name}>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="given-name"
                    maxLength={40}
                    placeholder="Your first name"
                    className="field"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    onChange={() => clearError("name")}
                  />
                </Field>

                <Field id="email" label="Email" error={errors.email}>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={254}
                    placeholder="you@example.com"
                    className="field"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    onChange={() => clearError("email")}
                  />
                </Field>

                <fieldset aria-describedby={errors.year ? "year-error" : undefined}>
                  <legend className="mb-2 text-sm font-medium text-ink">Year of study</legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {YEARS.map((y) => (
                      <label key={y} className="relative">
                        <input
                          type="radio"
                          name="year"
                          value={y}
                          className="peer sr-only"
                          onChange={() => clearError("year")}
                        />
                        <span className="flex min-h-[44px] cursor-pointer items-center justify-center rounded-full border border-line bg-bg/60 px-3 text-center text-sm text-muted transition-colors hover:text-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-bg peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface">
                          {y}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.year && <ErrorText id="year-error">{errors.year}</ErrorText>}
                </fieldset>

                <div className="flex flex-col gap-3">
                  <Checkbox name="isAdult" error={errors.isAdult} onChange={() => clearError("isAdult")}>
                    I confirm I am 18 or older
                  </Checkbox>
                  <Checkbox name="consent" error={errors.consent} onChange={() => clearError("consent")}>
                    I agree to the{" "}
                    <Link href="/privacy" className="text-ink underline decoration-accent/60 underline-offset-4" target="_blank">
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link href="/terms" className="text-ink underline decoration-accent/60 underline-offset-4" target="_blank">
                      Terms
                    </Link>
                  </Checkbox>
                </div>

                {SITE_KEY && (
                  <Turnstile
                    ref={turnstile}
                    siteKey={SITE_KEY}
                    onToken={(t) => {
                      setToken(t);
                      if (t) setFormError(null);
                    }}
                    onError={() => setFormError("The bot check couldn't load. Refresh the page and try again.")}
                  />
                )}

                {formError && (
                  <p role="alert" className="rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-ink">
                    {formError}
                  </p>
                )}

                <button type="submit" className="btn-primary h-12 w-full text-base" disabled={status.kind === "submitting"}>
                  {status.kind === "submitting" ? "Joining…" : "Join the waitlist"}
                </button>

                <WaitlistCounter className="justify-center" />
              </form>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error && <ErrorText id={`${id}-error`}>{error}</ErrorText>}
    </div>
  );
}

function ErrorText({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[#B42318] dark:text-[#FF8A80]">
      <span aria-hidden="true">!</span>
      {children}
    </p>
  );
}

function Checkbox({
  name,
  error,
  onChange,
  children,
}: {
  name: string;
  error?: string;
  onChange: () => void;
  children: React.ReactNode;
}) {
  const errId = `${name}-error`;
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-snug text-muted">
        <input
          type="checkbox"
          name={name}
          onChange={onChange}
          aria-invalid={!!error}
          aria-describedby={error ? errId : undefined}
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded-md border-line accent-[rgb(var(--accent))]"
        />
        <span>{children}</span>
      </label>
      {error && <ErrorText id={errId}>{error}</ErrorText>}
    </div>
  );
}

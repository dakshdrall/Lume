"use client";

import { useFormState, useFormStatus } from "react-dom";
import { sendMagicLink, type LoginState } from "@/app/admin/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Sending…" : "Email me a sign-in link"}
    </button>
  );
}

export function AdminLogin({ linkError }: { linkError?: boolean }) {
  const [state, action] = useFormState<LoginState, FormData>(sendMagicLink, null);

  return (
    <div className="card p-6 sm:p-8">
      <h1 className="font-serif text-4xl text-ink">Admin sign in</h1>
      <p className="mt-2 text-sm text-muted">We&apos;ll email you a magic link. Only allowlisted emails can sign in.</p>
      {linkError && (
        <p role="alert" className="mt-4 rounded-2xl bg-accent/10 px-4 py-3 text-sm text-ink">
          That link was invalid or expired. Request a new one and open it in this same browser.
        </p>
      )}
      <form action={action} className="mt-6 flex flex-col gap-4">
        <label htmlFor="admin-email" className="text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="field -mt-2"
          aria-describedby={state ? "admin-login-msg" : undefined}
        />
        <Submit />
        {state && (
          <p id="admin-login-msg" role="status" className={`text-sm ${state.ok ? "text-muted" : "text-ink"}`}>
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
}

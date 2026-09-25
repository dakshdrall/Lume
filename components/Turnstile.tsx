"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
    __lumeTurnstileLoading?: Promise<void>;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (window.__lumeTurnstileLoading) return window.__lumeTurnstileLoading;
  window.__lumeTurnstileLoading = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => {
      window.__lumeTurnstileLoading = undefined;
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(s);
  });
  return window.__lumeTurnstileLoading;
}

export type TurnstileHandle = { reset: () => void };

type Props = {
  siteKey: string;
  onToken: (token: string | null) => void;
  onError?: () => void;
};

export const Turnstile = forwardRef<TurnstileHandle, Props>(function Turnstile({ siteKey, onToken, onError }, ref) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  // keep latest callbacks without re-rendering the widget
  const cb = useRef({ onToken, onError });
  cb.current = { onToken, onError };

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
      cb.current.onToken(null);
    },
  }));

  useEffect(() => {
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !container.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(container.current, {
          sitekey: siteKey,
          theme: "auto",
          size: "flexible",
          action: "waitlist",
          callback: (t: string) => cb.current.onToken(t),
          "expired-callback": () => cb.current.onToken(null),
          "error-callback": () => {
            cb.current.onToken(null);
            cb.current.onError?.();
          },
        });
      })
      .catch(() => cb.current.onError?.());

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey]);

  return <div ref={container} className="min-h-[65px] w-full" />;
});

"use client";

import { useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { ProfileCard } from "./ProfileCard";
import { PROFILES, THEMES, type ThemeKey } from "./profiles";

const OPTIONS: { key: ThemeKey; label: string }[] = [
  { key: "rose", label: "Rose" },
  { key: "azure", label: "Azure" },
];

export function ThemePreview() {
  const [themeKey, setThemeKey] = useState<ThemeKey>("rose");
  const theme = THEMES[themeKey];

  return (
    <section aria-labelledby="themes-title" className="container-page py-16 sm:py-24">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div className="text-halo max-w-md">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent-ink">Theme preview</p>
          <h2 id="themes-title" className="mt-3 font-serif text-[clamp(2.4rem,8vw,4rem)] leading-[1] text-ink">
            Two moods.
            <br />
            <em className="italic">Your pick.</em>
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-muted">
            Profiles you scroll, not swipe. Photos and prompts tell the story, and you can like the exact
            thing that caught your eye.
          </p>

          <div
            role="group"
            aria-label="Profile theme"
            className="mt-8 inline-flex rounded-full border border-line bg-surface p-1"
          >
            {OPTIONS.map((opt) => {
              const active = opt.key === themeKey;
              return (
                <button
                  key={opt.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setThemeKey(opt.key)}
                  className={`relative flex min-h-[44px] items-center gap-2 rounded-full px-5 text-[15px] font-medium transition-colors ${
                    active ? "text-bg" : "text-muted hover:text-ink"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute inset-0 rounded-full bg-ink transition-opacity duration-300 ${
                      active ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <span
                    aria-hidden="true"
                    className="relative h-3 w-3 rounded-full ring-1 ring-black/10"
                    style={{ background: THEMES[opt.key].accent }}
                  />
                  <span className="relative">{opt.label}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-muted">Themes arrive with the full launch.</p>
        </div>

        <div
          className="relative flex justify-center overflow-hidden rounded-card-lg px-4 py-10 transition-colors duration-500 sm:px-10 sm:py-14"
          style={{ background: theme.bg }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(60% 50% at 20% 0%, ${theme.card}AA, transparent 70%), radial-gradient(50% 50% at 90% 100%, ${theme.accent}33, transparent 70%)`,
            }}
          />
          <div aria-hidden="true" className="scanlines pointer-events-none absolute inset-0 opacity-70" />
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={themeKey}
              className="relative flex w-full justify-center"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProfileCard profile={PROFILES[themeKey]} theme={theme} />
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
